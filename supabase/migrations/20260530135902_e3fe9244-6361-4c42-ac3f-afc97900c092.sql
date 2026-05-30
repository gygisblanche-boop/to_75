
-- =====================================================================
-- PROFILES
-- =====================================================================
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  age INTEGER,
  height NUMERIC,
  start_weight NUMERIC,
  current_weight NUMERIC,
  goal_weight NUMERIC,
  start_date DATE,
  xp INTEGER NOT NULL DEFAULT 0,
  fat_percent NUMERIC,
  muscle_mass NUMERIC,
  steps INTEGER,
  sleep_duration NUMERIC,
  sleep_time TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- =====================================================================
-- EXERCISES
-- =====================================================================
CREATE TABLE public.exercises (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_exercises_user ON public.exercises(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own exercises" ON public.exercises
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own exercises" ON public.exercises
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own exercises" ON public.exercises
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own exercises" ON public.exercises
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================================
-- HABITS  (one row per user per date)
-- =====================================================================
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  wake_up BOOLEAN NOT NULL DEFAULT false,
  hydration BOOLEAN NOT NULL DEFAULT false,
  eat_clean BOOLEAN NOT NULL DEFAULT false,
  avoid_junk BOOLEAN NOT NULL DEFAULT false,
  sleep_on_time BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
CREATE INDEX idx_habits_user_date ON public.habits(user_id, date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own habits" ON public.habits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own habits" ON public.habits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own habits" ON public.habits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own habits" ON public.habits
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================================
-- MEALS  (one row per user per date)
-- =====================================================================
CREATE TABLE public.meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  log TEXT,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);
CREATE INDEX idx_meals_user_date ON public.meals(user_id, date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.meals TO authenticated;
GRANT ALL ON public.meals TO service_role;

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own meals" ON public.meals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own meals" ON public.meals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own meals" ON public.meals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own meals" ON public.meals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================================
-- TODOS
-- =====================================================================
CREATE TABLE public.todos (
  id TEXT NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_todos_user ON public.todos(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated;
GRANT ALL ON public.todos TO service_role;

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own todos" ON public.todos
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own todos" ON public.todos
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own todos" ON public.todos
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own todos" ON public.todos
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =====================================================================
-- updated_at trigger + auto profile creation on signup
-- =====================================================================
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated  BEFORE UPDATE ON public.profiles  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_exercises_updated BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_habits_updated    BEFORE UPDATE ON public.habits    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_meals_updated     BEFORE UPDATE ON public.meals     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_todos_updated     BEFORE UPDATE ON public.todos     FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

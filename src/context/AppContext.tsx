import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseEnabled } from '@/supabase';
import type { User } from '@supabase/supabase-js';

// Local storage keys for Demo Mode
const STORAGE_KEYS = {
  USER: 'myjourney_user_v1',
  XP: 'myjourney_xp_v1',
  EXERCISES: 'myjourney_exercises_v1',
  HABITS: 'myjourney_habits_v1',
  MEALS: 'myjourney_meals_v1',
  TODOS: 'myjourney_todos_v1',
  BODY_COMP: 'myjourney_body_comp_v1',
  STREAK: 'myjourney_streak_v1',
};

// Safe storage wrapper to prevent crashes in private modes or strict browser sandboxes
const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`[MyJourney] Failed to read key "${key}" from localStorage. Falling back to session state.`, e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`[MyJourney] Failed to write key "${key}" to localStorage. Falling back to session state.`, e);
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`[MyJourney] Failed to remove key "${key}" from localStorage.`, e);
    }
  },
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('[MyJourney] Failed to clear localStorage.', e);
    }
  }
};

export interface UserProfile {
  name: string;
  age: number;
  height: number; // cm
  startWeight: number; // kg
  currentWeight: number; // kg
  goalWeight: number; // kg
  startDate: string;
}

export interface Exercise {
  id: string;
  name: string;
  target: number;
  completed: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
}

export interface BodyComp {
  weight: number;
  fatPercent: number;
  muscleMass: number;
  steps: number;
  sleepDuration: number; // hours
  sleepTime: string; // "HH:MM" e.g., "22:15"
}

// Habits record keyed by YYYY-MM-DD, then habit field
export type HabitKeys = 'wakeUp' | 'hydration' | 'eatClean' | 'avoidJunk' | 'sleepOnTime';
export type DailyHabits = Record<HabitKeys, boolean>;
export type HabitsRecord = Record<string, DailyHabits>;

export interface MealLog {
  log: string;
  image?: string; // base64 mock or attachment url
}
export type MealsRecord = Record<string, MealLog>;

interface AppContextType {
  // Auth details
  authLoading: boolean;
  authUser: User | null;
  isDemoMode: boolean;
  isCloudConnected: boolean;
  // Core user states
  user: UserProfile | null;
  xp: number;
  level: number;
  exercises: Exercise[];
  habits: HabitsRecord;
  meals: MealsRecord;
  todos: Todo[];
  bodyComp: BodyComp;
  syncStatus: 'idle' | 'syncing' | 'connected';
  currentStreak: number;
  levelUpPopup: { show: boolean; oldLevel: number; newLevel: number } | null;
  // Authentication Actions
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  enableDemoMode: () => void;
  // Common Utilities
  getTodayDateString: () => string;
  updateUser: (profile: UserProfile) => void;
  resetApp: () => void;
  addXP: (amount: number) => void;
  closeLevelUpPopup: () => void;
  // Exercise actions
  addExerciseTarget: (name: string, target: number) => void;
  logExerciseProgress: (id: string, reps: number) => void;
  deleteExercise: (id: string) => void;
  // Habit actions
  toggleHabit: (date: string, key: HabitKeys) => void;
  // Meal actions
  logMealText: (date: string, text: string) => void;
  logMealImage: (date: string, imageUri: string) => void;
  // Todo actions
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  // Body comp & Fit actions
  updateWeight: (weight: number) => void;
  updateBodyCompDirect: (updates: Partial<BodyComp>) => void;
  syncGoogleFit: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

// Helpers for dates
const getLocalDateString = (offsetDays = 0) => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth and Engine States
  const [authLoading, setAuthLoading] = useState(isSupabaseEnabled);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseEnabled);

  // Core User states (synced either from Supabase or localStorage fallback)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [xp, setXp] = useState<number>(0);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [habits, setHabits] = useState<HabitsRecord>({});
  const [meals, setMeals] = useState<MealsRecord>({});
  const [todos, setTodos] = useState<Todo[]>([]);
  const [bodyComp, setBodyComp] = useState<BodyComp>({
    weight: 85,
    fatPercent: 22,
    muscleMass: 55,
    steps: 3500,
    sleepDuration: 6.5,
    sleepTime: '23:30',
  });

  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'connected'>('idle');
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [levelUpPopup, setLevelUpPopup] = useState<{ show: boolean; oldLevel: number; newLevel: number } | null>(null);

  const getTodayDateString = () => getLocalDateString(0);
  const level = Math.floor(xp / 100) + 1;
  const isCloudConnected = isSupabaseEnabled && !!authUser;

  // ----------------------------------------------------
  // 1. Supabase Auth Listener
  // ----------------------------------------------------
  useEffect(() => {
    if (!isSupabaseEnabled) return;

    // Check active session immediately on mount
    supabase!.auth.getSession().then(({ data: { session } }: any) => {
      if (session) {
        setAuthUser(session.user);
        setIsDemoMode(false);
      }
      setAuthLoading(false);
    });

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event: any, session: any) => {
      if (session) {
        setAuthUser(session.user);
        setIsDemoMode(false);
      } else {
        setAuthUser(null);
        if (!isDemoMode) {
          setUser(null);
          setXp(0);
          setExercises([]);
          setHabits({});
          setMeals({});
          setTodos([]);
        }
      }
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  // ----------------------------------------------------
  // 2. Hydrate Cloud Data from Supabase Tables
  // ----------------------------------------------------
  useEffect(() => {
    if (!isCloudConnected) return;

    const loadUserData = async () => {
      const uid = authUser!.id;

      // A. Load Profile
      const { data: profileData } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (profileData) {
        setUser({
          name: profileData.name,
          age: profileData.age,
          height: Number(profileData.height),
          startWeight: Number(profileData.start_weight),
          currentWeight: Number(profileData.current_weight),
          goalWeight: Number(profileData.goal_weight),
          startDate: profileData.start_date,
        });
        setXp(profileData.xp || 0);
        setBodyComp({
          weight: Number(profileData.current_weight) || 85,
          fatPercent: Number(profileData.fat_percent) || 22,
          muscleMass: Number(profileData.muscle_mass) || 55,
          steps: Number(profileData.steps) || 3500,
          sleepDuration: Number(profileData.sleep_duration) || 6.5,
          sleepTime: profileData.sleep_time || '23:30',
        });
      } else {
        setUser(null); // Directs to onboarding modal
      }

      // B. Load Exercises
      const { data: exercisesData } = await supabase!
        .from('exercises')
        .select('*')
        .eq('user_id', uid);

      if (exercisesData && exercisesData.length > 0) {
        const list: Exercise[] = exercisesData.map((e: any) => ({
          id: e.id,
          name: e.name,
          target: e.target,
          completed: e.completed
        }));
        list.sort((a, b) => a.name.localeCompare(b.name));
        setExercises(list);
      } else {
        setExercises([
          { id: '1', name: 'Pushups', target: 50, completed: 0 },
          { id: '2', name: 'Pullups', target: 20, completed: 0 }
        ]);
      }

      // C. Load Habits
      const { data: habitsData } = await supabase!
        .from('habits')
        .select('*')
        .eq('user_id', uid);

      if (habitsData) {
        const record: HabitsRecord = {};
        habitsData.forEach((h: any) => {
          record[h.date] = {
            wakeUp: h.wake_up,
            hydration: h.hydration,
            eatClean: h.eat_clean,
            avoidJunk: h.avoid_junk,
            sleepOnTime: h.sleep_on_time,
          };
        });
        setHabits(record);
      }

      // D. Load Meals
      const { data: mealsData } = await supabase!
        .from('meals')
        .select('*')
        .eq('user_id', uid);

      if (mealsData) {
        const record: MealsRecord = {};
        mealsData.forEach((m: any) => {
          record[m.date] = {
            log: m.log || '',
            image: m.image || undefined
          };
        });
        setMeals(record);
      }

      // E. Load Todos
      const { data: todosData } = await supabase!
        .from('todos')
        .select('*')
        .eq('user_id', uid);

      if (todosData) {
        const list: Todo[] = todosData.map((t: any) => ({
          id: t.id,
          text: t.text,
          completed: t.completed,
          date: t.date
        }));
        setTodos(list);
      }
    };

    loadUserData();
  }, [isCloudConnected, authUser]);

  // ----------------------------------------------------
  // 3. Local Storage Sync (Demo Mode Engine)
  // ----------------------------------------------------
  useEffect(() => {
    if (!isDemoMode) return;

    const cachedUser = safeStorage.getItem(STORAGE_KEYS.USER);
    setUser(cachedUser ? JSON.parse(cachedUser) : null);

    const cachedXp = safeStorage.getItem(STORAGE_KEYS.XP);
    setXp(cachedXp ? parseInt(cachedXp, 10) : 0);

    const cachedExercises = safeStorage.getItem(STORAGE_KEYS.EXERCISES);
    setExercises(cachedExercises ? JSON.parse(cachedExercises) : [
      { id: '1', name: 'Pushups', target: 50, completed: 0 },
      { id: '2', name: 'Pullups', target: 20, completed: 0 }
    ]);

    const cachedHabits = safeStorage.getItem(STORAGE_KEYS.HABITS);
    setHabits(cachedHabits ? JSON.parse(cachedHabits) : {});

    const cachedMeals = safeStorage.getItem(STORAGE_KEYS.MEALS);
    setMeals(cachedMeals ? JSON.parse(cachedMeals) : {});

    const cachedTodos = safeStorage.getItem(STORAGE_KEYS.TODOS);
    setTodos(cachedTodos ? JSON.parse(cachedTodos) : []);

    const cachedBody = safeStorage.getItem(STORAGE_KEYS.BODY_COMP);
    setBodyComp(cachedBody ? JSON.parse(cachedBody) : {
      weight: 85,
      fatPercent: 22,
      muscleMass: 55,
      steps: 3500,
      sleepDuration: 6.5,
      sleepTime: '23:30',
    });
  }, [isDemoMode]);

  useEffect(() => {
    if (!isDemoMode) return;
    if (user) {
      safeStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      safeStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [isDemoMode, user]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.XP, String(xp));
  }, [isDemoMode, xp]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  }, [isDemoMode, exercises]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [isDemoMode, habits]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(meals));
  }, [isDemoMode, meals]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
  }, [isDemoMode, todos]);

  useEffect(() => {
    if (!isDemoMode) return;
    safeStorage.setItem(STORAGE_KEYS.BODY_COMP, JSON.stringify(bodyComp));
  }, [isDemoMode, bodyComp]);

  // ----------------------------------------------------
  // 4. Carryover To-Do Logic
  // ----------------------------------------------------
  useEffect(() => {
    const today = getTodayDateString();
    let changed = false;
    const updatedTodos = todos.map(todo => {
      if (!todo.completed && todo.date < today) {
        changed = true;
        return { ...todo, date: today };
      }
      return todo;
    });

    if (changed) {
      setTodos(updatedTodos);
      if (isDemoMode) {
        safeStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(updatedTodos));
      } else if (isCloudConnected) {
        updatedTodos.forEach((todo) => {
          if (todo.date === today) {
            supabase!
              .from('todos')
              .upsert({
                id: todo.id,
                user_id: authUser!.id,
                text: todo.text,
                completed: todo.completed,
                date: todo.date
              }).then();
          }
        });
      }
    }
  }, [todos, isDemoMode, isCloudConnected]);

  // ----------------------------------------------------
  // 5. Streak Calculator
  // ----------------------------------------------------
  useEffect(() => {
    let streak = 0;
    const todayStr = getTodayDateString();
    
    const isDayHabitsComplete = (dateStr: string) => {
      const dayRecord = habits[dateStr];
      if (!dayRecord) return false;
      return (
        dayRecord.wakeUp &&
        dayRecord.hydration &&
        dayRecord.eatClean &&
        dayRecord.avoidJunk &&
        dayRecord.sleepOnTime
      );
    };

    let currentCheckDate = isDayHabitsComplete(todayStr) ? todayStr : getLocalDateString(-1);
    
    while (true) {
      if (isDayHabitsComplete(currentCheckDate)) {
        streak++;
        const dateObj = new Date(currentCheckDate);
        dateObj.setDate(dateObj.getDate() - 1);
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        currentCheckDate = `${y}-${m}-${d}`;
      } else {
        break;
      }
    }

    setCurrentStreak(streak);
  }, [habits]);

  // ----------------------------------------------------
  // 6. DB Optimistic Operations & Sync Actions
  // ----------------------------------------------------

  const loginWithEmail = async (email: string, password: string) => {
    if (!isSupabaseEnabled) return;
    const { error } = await supabase!.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const registerWithEmail = async (email: string, password: string) => {
    if (!isSupabaseEnabled) return;
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase!.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (isSupabaseEnabled) {
      await supabase!.auth.signOut();
    }
    setIsDemoMode(false);
    setAuthUser(null);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
  };

  const addXP = async (amount: number) => {
    const newXp = xp + amount;
    setXp(newXp);
    
    const oldLvl = Math.floor(xp / 100) + 1;
    const newLvl = Math.floor(newXp / 100) + 1;
    if (newLvl > oldLvl) {
      setLevelUpPopup({ show: true, oldLevel: oldLvl, newLevel: newLvl });
    }

    if (isCloudConnected) {
      await supabase!
        .from('profiles')
        .update({ xp: newXp })
        .eq('id', authUser!.id);
    }
  };

  const closeLevelUpPopup = () => {
    setLevelUpPopup(null);
  };

  const updateUser = async (profile: UserProfile) => {
    const isNew = !user;
    setUser(profile);
    setBodyComp(prev => ({ ...prev, weight: profile.currentWeight }));
    
    let targetXp = xp;
    if (isNew) {
      targetXp = xp + 100;
      setXp(targetXp);
      setLevelUpPopup({ show: true, oldLevel: 1, newLevel: 2 });
    }

    if (isCloudConnected) {
      const uid = authUser!.id;
      // Upsert profiles
      await supabase!
        .from('profiles')
        .upsert({
          id: uid,
          name: profile.name,
          age: profile.age,
          height: profile.height,
          start_weight: profile.startWeight,
          current_weight: profile.currentWeight,
          goal_weight: profile.goalWeight,
          start_date: profile.startDate,
          xp: targetXp,
          level: isNew ? 2 : level,
          fat_percent: bodyComp.fatPercent,
          muscle_mass: bodyComp.muscleMass,
          steps: bodyComp.steps,
          sleep_duration: bodyComp.sleepDuration,
          sleep_time: bodyComp.sleepTime,
        });

      // Initialize default exercises
      await supabase!
        .from('exercises')
        .upsert([
          { id: '1', user_id: uid, name: 'Pushups', target: 50, completed: 0 },
          { id: '2', user_id: uid, name: 'Pullups', target: 20, completed: 0 }
        ]);
    }
  };

  const resetApp = async () => {
    if (isCloudConnected) {
      const uid = authUser!.id;
      await supabase!.from('profiles').delete().eq('id', uid);
      await supabase!.from('exercises').delete().eq('user_id', uid);
      await supabase!.from('habits').delete().eq('user_id', uid);
      await supabase!.from('meals').delete().eq('user_id', uid);
      await supabase!.from('todos').delete().eq('user_id', uid);
    }

    setUser(null);
    setXp(0);
    setExercises([
      { id: '1', name: 'Pushups', target: 50, completed: 0 },
      { id: '2', name: 'Pullups', target: 20, completed: 0 },
    ]);
    setHabits({});
    setMeals({});
    setTodos([]);
    setBodyComp({
      weight: 85,
      fatPercent: 22,
      muscleMass: 55,
      steps: 3500,
      sleepDuration: 6.5,
      sleepTime: '23:30',
    });
    setSyncStatus('idle');
    setLevelUpPopup(null);

    if (isDemoMode) {
      safeStorage.clear();
    }
  };

  const addExerciseTarget = async (name: string, target: number) => {
    const id = Date.now().toString();
    const newEx: Exercise = { id, name, target, completed: 0 };
    setExercises(prev => [...prev, newEx]);

    if (isCloudConnected) {
      await supabase!
        .from('exercises')
        .insert({
          id,
          user_id: authUser!.id,
          name,
          target,
          completed: 0
        });
    }
  };

  const logExerciseProgress = async (id: string, reps: number) => {
    let targetEx = exercises.find(ex => ex.id === id);
    if (!targetEx) return;

    const prevCompleted = targetEx.completed;
    const newCompleted = Math.min(targetEx.target, targetEx.completed + reps);

    setExercises(prev =>
      prev.map(ex => (ex.id === id ? { ...ex, completed: newCompleted } : ex))
    );

    if (newCompleted >= targetEx.target && prevCompleted < targetEx.target) {
      addXP(20);
    }

    if (isCloudConnected) {
      await supabase!
        .from('exercises')
        .update({ completed: newCompleted })
        .eq('user_id', authUser!.id)
        .eq('id', id);
    }
  };

  const deleteExercise = async (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));

    if (isCloudConnected) {
      await supabase!
        .from('exercises')
        .delete()
        .eq('user_id', authUser!.id)
        .eq('id', id);
    }
  };

  const toggleHabit = async (date: string, key: HabitKeys) => {
    const todayHabits = habits[date] ? { ...habits[date] } : {
      wakeUp: false,
      hydration: false,
      eatClean: false,
      avoidJunk: false,
      sleepOnTime: false,
    };

    const wasCompleteBefore = todayHabits.wakeUp && todayHabits.hydration && todayHabits.eatClean && todayHabits.avoidJunk && todayHabits.sleepOnTime;
    todayHabits[key] = !todayHabits[key];
    const isCompleteNow = todayHabits.wakeUp && todayHabits.hydration && todayHabits.eatClean && todayHabits.avoidJunk && todayHabits.sleepOnTime;

    setHabits(prev => ({ ...prev, [date]: todayHabits }));

    let earnedXP = todayHabits[key] ? 10 : -10;
    if (isCompleteNow && !wasCompleteBefore) earnedXP += 30;
    if (!isCompleteNow && wasCompleteBefore) earnedXP -= 30;

    addXP(earnedXP);

    if (isCloudConnected) {
      await supabase!
        .from('habits')
        .upsert({
          user_id: authUser!.id,
          date,
          wake_up: todayHabits.wakeUp,
          hydration: todayHabits.hydration,
          eat_clean: todayHabits.eatClean,
          avoid_junk: todayHabits.avoidJunk,
          sleep_on_time: todayHabits.sleepOnTime
        });
    }
  };

  const logMealText = async (date: string, text: string) => {
    const existing = meals[date] || { log: '', image: '' };
    const isFirstLog = !existing.log && text;

    setMeals(prev => ({ ...prev, [date]: { ...existing, log: text } }));

    if (isFirstLog) addXP(15);

    if (isCloudConnected) {
      await supabase!
        .from('meals')
        .upsert({
          user_id: authUser!.id,
          date,
          log: text,
          image: existing.image || null
        });
    }
  };

  const logMealImage = async (date: string, imageUri: string) => {
    const existing = meals[date] || { log: '', image: '' };
    setMeals(prev => ({ ...prev, [date]: { ...existing, image: imageUri } }));

    if (isCloudConnected) {
      await supabase!
        .from('meals')
        .upsert({
          user_id: authUser!.id,
          date,
          log: existing.log || null,
          image: imageUri
        });
    }
  };

  const addTodo = async (text: string) => {
    const id = Date.now().toString();
    const newTodo: Todo = { id, text, completed: false, date: getTodayDateString() };
    setTodos(prev => [...prev, newTodo]);
    addXP(5);

    if (isCloudConnected) {
      await supabase!
        .from('todos')
        .insert({
          id,
          user_id: authUser!.id,
          text,
          completed: false,
          date: newTodo.date
        });
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const nextState = !todo.completed;
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed: nextState } : t)));
    addXP(nextState ? 10 : -10);

    if (isCloudConnected) {
      await supabase!
        .from('todos')
        .update({ completed: nextState })
        .eq('user_id', authUser!.id)
        .eq('id', id);
    }
  };

  const deleteTodo = async (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));

    if (isCloudConnected) {
      await supabase!
        .from('todos')
        .delete()
        .eq('user_id', authUser!.id)
        .eq('id', id);
    }
  };

  const updateWeight = async (weight: number) => {
    if (!user) return;
    const updatedProfile = { ...user, currentWeight: weight };
    setUser(updatedProfile);
    setBodyComp(prev => ({ ...prev, weight }));
    addXP(50);

    if (isCloudConnected) {
      await supabase!
        .from('profiles')
        .update({ current_weight: weight })
        .eq('id', authUser!.id);
    }
  };

  const updateBodyCompDirect = async (updates: Partial<BodyComp>) => {
    const updated = { ...bodyComp, ...updates };
    setBodyComp(updated);

    if (isCloudConnected) {
      await supabase!
        .from('profiles')
        .update({
          fat_percent: updated.fatPercent,
          muscle_mass: updated.muscleMass,
          steps: updated.steps,
          sleep_duration: updated.sleepDuration,
          sleep_time: updated.sleepTime
        })
        .eq('id', authUser!.id);
    }
  };

  const syncGoogleFit = async () => {
    setSyncStatus('syncing');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockSteps = Math.floor(8000 + Math.random() * 4500);
    const mockSleepDur = parseFloat((7.0 + Math.random() * 1.5).toFixed(1));
    const sleepTimes = ['21:30', '21:50', '22:10', '22:20', '22:45', '23:05', '23:15'];
    const mockSleepTime = sleepTimes[Math.floor(Math.random() * sleepTimes.length)];
    const mockFat = parseFloat((16 + Math.random() * 5).toFixed(1));
    const mockMuscle = parseFloat((56 + Math.random() * 6).toFixed(1));
    
    const today = getTodayDateString();

    const updatedBody = {
      ...bodyComp,
      steps: mockSteps,
      sleepDuration: mockSleepDur,
      sleepTime: mockSleepTime,
      fatPercent: mockFat,
      muscleMass: mockMuscle,
    };

    setBodyComp(updatedBody);
    setSyncStatus('connected');
    addXP(40);

    const [hours, minutes] = mockSleepTime.split(':').map(Number);
    const sleepMinutes = hours * 60 + minutes;
    const threshold = 22 * 60 + 30; // 10:30 PM

    let toggledSleep = false;
    const todayHabits = habits[today] ? { ...habits[today] } : {
      wakeUp: false,
      hydration: false,
      eatClean: false,
      avoidJunk: false,
      sleepOnTime: false,
    };

    if (sleepMinutes <= threshold || hours < 12) {
      const wasCompleteBefore = todayHabits.wakeUp && todayHabits.hydration && todayHabits.eatClean && todayHabits.avoidJunk && todayHabits.sleepOnTime;
      
      if (!todayHabits.sleepOnTime) {
        todayHabits.sleepOnTime = true;
        toggledSleep = true;
        addXP(10);
        
        const isCompleteNow = todayHabits.wakeUp && todayHabits.hydration && todayHabits.eatClean && todayHabits.avoidJunk && todayHabits.sleepOnTime;
        if (isCompleteNow && !wasCompleteBefore) {
          addXP(30);
        }
        setHabits(prev => ({ ...prev, [today]: todayHabits }));
      }
    }

    if (isCloudConnected) {
      // Sync steps & sleep back to profile
      await supabase!
        .from('profiles')
        .update({
          fat_percent: updatedBody.fatPercent,
          muscle_mass: updatedBody.muscleMass,
          steps: updatedBody.steps,
          sleep_duration: updatedBody.sleepDuration,
          sleep_time: updatedBody.sleepTime
        })
        .eq('id', authUser!.id);

      if (toggledSleep) {
        await supabase!
          .from('habits')
          .upsert({
            user_id: authUser!.id,
            date: today,
            wake_up: todayHabits.wakeUp,
            hydration: todayHabits.hydration,
            eat_clean: todayHabits.eatClean,
            avoid_junk: todayHabits.avoidJunk,
            sleep_on_time: true
          });
      }
    }
  };

  return (
    <AppContext.Provider value={{
      authLoading,
      authUser,
      isDemoMode,
      isCloudConnected,
      user,
      xp,
      level,
      exercises,
      habits,
      meals,
      todos,
      bodyComp,
      syncStatus,
      currentStreak,
      levelUpPopup,
      loginWithEmail,
      registerWithEmail,
      logout,
      enableDemoMode,
      getTodayDateString,
      updateUser,
      resetApp,
      addXP,
      closeLevelUpPopup,
      addExerciseTarget,
      logExerciseProgress,
      deleteExercise,
      toggleHabit,
      logMealText,
      logMealImage,
      addTodo,
      toggleTodo,
      deleteTodo,
      updateWeight,
      updateBodyCompDirect,
      syncGoogleFit,
    }}>
      {children}
    </AppContext.Provider>
  );
};
export default AppProvider;

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  Bot, 
  Zap, 
  Dumbbell, 
  Quote, 
  Moon, 
  Footprints, 
  Scale, 
  Check, 
  Activity 
} from 'lucide-react';

interface InsightItem {
  type: 'weight' | 'exercise' | 'habits' | 'recovery';
  title: string;
  status: 'good' | 'warning' | 'info';
  message: string;
  valueText: string;
  progress?: number;
}

interface CoachBriefing {
  greeting: string;
  insights: InsightItem[];
  quoteText: string;
  quoteAuthor: string;
}

export const GeminiCoach: React.FC = () => {
  const { user, exercises, habits, bodyComp, getTodayDateString } = useApp();
  const [briefing, setBriefing] = useState<CoachBriefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);

  const thinkingMessages = [
    "Analyzing biometric trends...",
    "Correlating exercise completion rate...",
    "Evaluating habit streak consistency...",
    "Synthesizing customized AI coaching brief..."
  ];

  // Increment thinking steps during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setThinkingStep(0);
      interval = setInterval(() => {
        setThinkingStep(prev => {
          if (prev < thinkingMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const generateTip = () => {
    if (!user) return;
    setIsGenerating(true);

    setTimeout(() => {
      const today = getTodayDateString();
      const weightLost = user.startWeight - user.currentWeight;
      const kgToGoal = user.currentWeight - user.goalWeight;
      
      const completedExercises = exercises.filter(e => e.completed >= e.target).length;
      const totalExercises = exercises.length;
      
      const todayHabits = habits[today] || { wakeUp: false, hydration: false, eatClean: false, avoidJunk: false, sleepOnTime: false };
      const habitsChecked = Object.values(todayHabits).filter(Boolean).length;

      const insights: InsightItem[] = [];

      // 1. Weight Insight
      if (weightLost > 0) {
        insights.push({
          type: 'weight',
          title: 'Weight progress',
          status: 'good',
          valueText: `-${weightLost.toFixed(1)} kg`,
          message: `Awesome! You've lost ${weightLost.toFixed(1)} kg. Just ${kgToGoal.toFixed(1)} kg left to reach your target of ${user.goalWeight} kg.`
        });
      } else if (weightLost < 0) {
        insights.push({
          type: 'weight',
          title: 'Weight trend',
          status: 'warning',
          valueText: `+${Math.abs(weightLost).toFixed(1)} kg`,
          message: `Weight is up ${Math.abs(weightLost).toFixed(1)} kg from your start weight. Let's tighten up nutrition and keep pushing!`
        });
      } else {
        insights.push({
          type: 'weight',
          title: 'Weight steady',
          status: 'info',
          valueText: `${user.currentWeight} kg`,
          message: `Holding steady at your start weight. Build up your consistency today to trigger the next down-trend!`
        });
      }

      // 2. Exercise Insight
      if (totalExercises === 0) {
        insights.push({
          type: 'exercise',
          title: 'Daily Reps',
          status: 'warning',
          valueText: '0 Targets',
          message: 'No active target exercises configured. Go to the Exercise tab to add targets!'
        });
      } else {
        const pct = Math.round((completedExercises / totalExercises) * 100);
        insights.push({
          type: 'exercise',
          title: 'Daily Reps',
          status: completedExercises === totalExercises ? 'good' : completedExercises > 0 ? 'info' : 'warning',
          valueText: `${completedExercises}/${totalExercises}`,
          progress: pct,
          message: completedExercises === totalExercises 
            ? "100% of exercise targets completed today! Amazing work! 🔥"
            : completedExercises > 0
              ? `You've completed ${completedExercises} of ${totalExercises} targets. Keep pushing to close the rings!`
              : "No workout sessions finished today. Even a short 10-minute session will spark energy."
        });
      }

      // 3. Habits Insight
      insights.push({
        type: 'habits',
        title: 'Habit rings',
        status: habitsChecked === 5 ? 'good' : habitsChecked >= 3 ? 'info' : 'warning',
        valueText: `${habitsChecked}/5`,
        message: habitsChecked === 5
          ? "Sensational! All 5 habits checked. You're building an iron discipline streak. 🌟"
          : habitsChecked >= 3
            ? `Checked ${habitsChecked}/5. Ensure you hit hydration and sleep to finish strong.`
            : `Only ${habitsChecked}/5 checked. Focus on checking off 1-2 more habits before bed.`
      });

      // 4. Recovery Insight
      if (bodyComp.steps > 9000) {
        insights.push({
          type: 'recovery',
          title: 'Active steps',
          status: 'good',
          valueText: `${bodyComp.steps.toLocaleString()}`,
          message: `Excellent cardiovascular health! Logging ${bodyComp.steps.toLocaleString()} steps provides great active recovery.`
        });
      } else if (bodyComp.sleepDuration < 7.0) {
        insights.push({
          type: 'recovery',
          title: 'Sleep quality',
          status: 'warning',
          valueText: `${bodyComp.sleepDuration}h`,
          message: `Got only ${bodyComp.sleepDuration} hours of rest. Prioritize winding down early to keep growth hormone high.`
        });
      } else {
        insights.push({
          type: 'recovery',
          title: 'Recovery State',
          status: 'info',
          valueText: bodyComp.steps > 0 ? `${bodyComp.steps.toLocaleString()} steps` : 'Active',
          message: "Keep moving! Logging active steps and prioritizing 7-8 hours of sleep guarantees peak athletic output."
        });
      }

      const quotes = [
        { text: "We are what we repeatedly do. Excellence is not an act, but a habit.", author: "Aristotle" },
        { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
        { text: "Your only competition is the version of you from yesterday. Beat them.", author: "Unknown" },
        { text: "Run the day. Don't let the day run you.", author: "Jim Rohn" },
      ];
      const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

      setBriefing({
        greeting: `Hey ${user.name}! Here is your real-time AI performance analysis and briefing. Let's optimize your momentum.`,
        insights,
        quoteText: selectedQuote.text,
        quoteAuthor: selectedQuote.author
      });
      setIsGenerating(false);
    }, 2000);
  };

  const getStatusColor = (status: InsightItem['status']) => {
    switch (status) {
      case 'good': return 'var(--accent-green)';
      case 'warning': return '#ffcc00';
      case 'info': return 'var(--accent-blue)';
      default: return 'var(--text-secondary)';
    }
  };

  const getStatusBg = (status: InsightItem['status']) => {
    switch (status) {
      case 'good': return 'rgba(57, 255, 20, 0.05)';
      case 'warning': return 'rgba(255, 204, 0, 0.05)';
      case 'info': return 'rgba(10, 132, 255, 0.05)';
      default: return 'rgba(255, 255, 255, 0.02)';
    }
  };

  const getInsightIcon = (type: InsightItem['type']) => {
    switch (type) {
      case 'weight': return <Scale size={16} color="var(--accent-orange)" />;
      case 'exercise': return <Dumbbell size={16} color="var(--accent-purple)" />;
      case 'habits': return <Check size={16} color="var(--accent-green)" />;
      case 'recovery': return <Moon size={16} color="var(--accent-blue)" />;
    }
  };

  const today = getTodayDateString();
  const todayHabits = habits[today] || { wakeUp: false, hydration: false, eatClean: false, avoidJunk: false, sleepOnTime: false };
  const habitKeys: (keyof typeof todayHabits)[] = ['wakeUp', 'hydration', 'eatClean', 'avoidJunk', 'sleepOnTime'];

  return (
    <div style={{
      borderRadius: '18px',
      background: 'linear-gradient(150deg, rgba(30, 30, 38, 0.95) 0%, rgba(15, 15, 18, 0.98) 100%)',
      border: '1px solid rgba(255, 94, 0, 0.16)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
      marginTop: '20px',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(255, 94, 0, 0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Glowing Avatar Wrapper */}
          <div style={{
            position: 'relative',
            width: '38px',
            height: '38px',
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c42 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(255, 94, 0, 0.25)',
              zIndex: 2,
              position: 'relative',
            }}>
              <BrainCircuit size={19} color="#fff" />
            </div>
            {/* Pulsing glow under active generation */}
            {isGenerating && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                left: '-2px',
                right: '-2px',
                bottom: '-2px',
                borderRadius: '14px',
                background: 'rgba(255, 94, 0, 0.4)',
                filter: 'blur(6px)',
                zIndex: 1,
                animation: 'pulse-glow 1.2s infinite ease-in-out',
              }} />
            )}
          </div>
          <div>
            <h3 style={{
              fontSize: '0.94rem',
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              Gemini Coach <Zap size={12} color="var(--accent-orange)" fill="var(--accent-orange)" />
            </h3>
            <span style={{
              fontSize: '0.7rem',
              color: isGenerating ? 'var(--accent-orange)' : 'var(--accent-green)',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <span style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isGenerating ? 'var(--accent-orange)' : 'var(--accent-green)',
                display: 'inline-block',
              }} />
              {isGenerating ? 'Analyzing biometrics...' : 'System Synced'}
            </span>
          </div>
        </div>

        {briefing && (
          <button
            onClick={generateTip}
            disabled={isGenerating || !user}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary)',
              cursor: !user ? 'not-allowed' : 'pointer',
              opacity: !user ? 0.3 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (user && !isGenerating) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
            }}
            title="Refresh Analysis"
          >
            <RefreshCw size={15} style={{
              animation: isGenerating ? 'spin-slow 1.5s linear infinite' : 'none',
            }} />
          </button>
        )}
      </div>

      {/* Main View Area */}
      <div style={{ padding: '20px' }}>
        {isGenerating ? (
          /* Premium Simulated AI Thinking Panel */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '10px 0',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <Bot size={20} color="var(--accent-orange)" className="anim-pulse-glow" />
              <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Generating Personal Briefing...
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
            }}>
              {thinkingMessages.map((msg, i) => {
                const isCompleted = thinkingStep > i;
                const isActive = thinkingStep === i;
                return (
                  <div key={i} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isCompleted || isActive ? 1 : 0.25,
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{
                      fontSize: '0.78rem',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 400,
                    }}>
                      {msg}
                    </span>
                    {isCompleted ? (
                      <Check size={12} color="var(--accent-green)" style={{ strokeWidth: 3 }} />
                    ) : isActive ? (
                      <RefreshCw size={12} color="var(--accent-orange)" style={{
                        animation: 'spin-slow 1.5s linear infinite'
                      }} />
                    ) : (
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : !briefing ? (
          /* Clean Welcome/Idle Panel */
          <div style={{
            textAlign: 'center',
            padding: '24px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(255, 94, 0, 0.15), rgba(255, 140, 66, 0.06))',
              border: '1px solid rgba(255, 94, 0, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Sparkles size={24} color="var(--accent-orange)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                Your Personalized AI Briefing
              </h4>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                maxWidth: '300px',
                margin: '0 auto',
              }}>
                Compute fitness trajectories, streak ratios, and tailored athletic insights based on your daily logging.
              </p>
            </div>
            <button
              onClick={generateTip}
              disabled={isGenerating || !user}
              style={{
                marginTop: '6px',
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c42 100%)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: 'none',
                cursor: !user ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(255, 94, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (user) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <BrainCircuit size={15} />
              Generate Coach Briefing
            </button>
            {!user && (
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Complete onboarding to initialize AI engine
              </span>
            )}
          </div>
        ) : (
          /* Premium Interactive AI Briefing Dashboard Dashboard */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            animation: 'fadeSlideUp 0.4s ease-out forwards',
          }}>
            {/* Greeting */}
            <div style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255, 94, 0, 0.04)',
              border: '1px solid rgba(255, 94, 0, 0.08)',
              borderRadius: '12px',
              padding: '14px 16px',
            }}>
              <Bot size={18} color="var(--accent-orange)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{
                fontSize: '0.84rem',
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {briefing.greeting}
              </p>
            </div>

            {/* Metrics Dashboard Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              {briefing.insights.map((insight, idx) => (
                <div key={idx} style={{
                  background: getStatusBg(insight.status),
                  border: `1px solid rgba(255, 255, 255, 0.04)`,
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Metric Top line */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}>
                      {insight.title}
                    </span>
                    {getInsightIcon(insight.type)}
                  </div>

                  {/* Value display */}
                  <div style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: getStatusColor(insight.status),
                    lineHeight: 1,
                  }}>
                    {insight.valueText}
                  </div>

                  {/* Context specific custom indicators */}
                  {insight.type === 'exercise' && insight.progress !== undefined && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.06)',
                      overflow: 'hidden',
                      marginTop: '2px',
                    }}>
                      <div style={{
                        width: `${insight.progress}%`,
                        height: '100%',
                        background: getStatusColor(insight.status),
                        borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  )}

                  {insight.type === 'habits' && (
                    <div style={{
                      display: 'flex',
                      gap: '4px',
                      marginTop: '2px',
                    }}>
                      {habitKeys.map((key, i) => (
                        <div key={i} style={{
                          flex: 1,
                          height: '3px',
                          borderRadius: '1.5px',
                          background: todayHabits[key] ? 'var(--accent-green)' : 'rgba(255,255,255,0.08)',
                          boxShadow: todayHabits[key] ? '0 0 6px var(--accent-green-glow)' : 'none',
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recommendations Stack */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                paddingLeft: '2px',
              }}>
                Coach Directives
              </span>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}>
                {briefing.insights.map((insight, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.8)',
                    lineHeight: 1.45,
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '10px',
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(insight.status),
                      marginTop: '6px',
                      flexShrink: 0,
                    }} />
                    <span>{insight.message}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation Quote Block */}
            <div style={{
              background: 'linear-gradient(90deg, rgba(255, 94, 0, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderLeft: '3px solid var(--accent-orange)',
              borderRadius: '0 12px 12px 0',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '4px',
            }}>
              <Quote size={16} color="var(--accent-orange)" opacity={0.6} />
              <p style={{
                fontSize: '0.8rem',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.85)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                "{briefing.quoteText}"
              </p>
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                textAlign: 'right',
              }}>
                — {briefing.quoteAuthor}
              </span>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '4px',
            }}>
              <button
                onClick={generateTip}
                disabled={isGenerating || !user}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ff5e00 0%, #ff8c42 100%)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: !user ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(255, 94, 0, 0.25)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (user) e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <RefreshCw size={13} />
                Regenerate Briefing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeminiCoach;

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';

export const GeminiCoach: React.FC = () => {
  const { user, exercises, habits, bodyComp, getTodayDateString } = useApp();
  const [coachingText, setCoachingText] = useState<string>(
    "Welcome to the Live Execution Window. Tap 'Request AI Insight' to generate your personalized athletic coaching feedback."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [typedText, setTypedText] = useState('');

  // Typing effect helper
  useEffect(() => {
    if (!isGenerating && coachingText) {
      setTypedText('');
      let index = 0;
      const interval = setInterval(() => {
        setTypedText((prev) => prev + coachingText.charAt(index));
        index++;
        if (index >= coachingText.length) {
          clearInterval(interval);
        }
      }, 15); // Adjust typing speed here
      return () => clearInterval(interval);
    }
  }, [coachingText, isGenerating]);

  const generateTip = () => {
    if (!user) return;
    setIsGenerating(true);
    setCoachingText('');

    setTimeout(() => {
      // Analyze current performance parameters
      const weightLost = user.startWeight - user.currentWeight;
      const kgToGoal = user.currentWeight - user.goalWeight;
      const completedExercises = exercises.filter(e => e.completed >= e.target).length;
      
      const today = getTodayDateString();
      const todayHabits = habits[today] || { wakeUp: false, hydration: false, eatClean: false, avoidJunk: false, sleepOnTime: false };
      const habitsChecked = Object.values(todayHabits).filter(Boolean).length;
      
      // Dynamic coaching insights
      const insights: string[] = [];

      // Insight 1: Weight progression
      if (weightLost > 0) {
        insights.push(`You've shed ${weightLost.toFixed(1)} kg since starting. That's pure execution! You are exactly ${kgToGoal.toFixed(1)} kg away from your final objective of ${user.goalWeight} kg.`);
      } else if (weightLost < 0) {
        insights.push(`Your weight is currently higher than your start point by ${Math.abs(weightLost).toFixed(1)} kg. Focus on calorie quality, clean eating habits, and consistency in your daily pushups and pullups.`);
      } else {
        insights.push(`Your weight is holding steady at ${user.currentWeight} kg. Let's create a deficit. Power through your target rep exercises today to spike your daily caloric burn.`);
      }

      // Insight 2: Exercises
      if (completedExercises > 0) {
        insights.push(`Excellent work crushing ${completedExercises} of your daily movement targets. High-volume consistency is key to athletic conditioning.`);
      } else {
        insights.push(`Your rep tracker is sitting at zero. Set aside just 10 minutes to hit a quick set of pushups or pullups. Start small, finish strong.`);
      }

      // Insight 3: Habits
      if (habitsChecked === 5) {
        insights.push("PERFECT execution on habits today! 5/5 checklist checked. You've earned today's orange calendar sticker. Keep this momentum!");
      } else if (habitsChecked >= 3) {
        insights.push(`You've checked off ${habitsChecked}/5 habits. Focus on closing out the remainder. Don't skip on hydration (3L) or sleep hygiene.`);
      } else {
        insights.push("Your habit checklist is looking light. Remember: habits are the compounding interest of self-discipline. Lock in early sleep and clean meals.");
      }

      // Insight 4: Steps & Sleep
      if (bodyComp.steps > 9000) {
        insights.push(`Daily steps look fantastic at ${bodyComp.steps.toLocaleString()}. That's excellent active recovery.`);
      }
      if (bodyComp.sleepDuration < 7.0) {
        insights.push(`Your sleep duration clocked in at ${bodyComp.sleepDuration} hours. Consider backing off intensive workouts slightly or crawling into bed before 10:30 PM to optimize muscle rebuilding.`);
      } else {
        insights.push(`Solid rest of ${bodyComp.sleepDuration} hours registered. Deep sleep is when natural growth hormones peak.`);
      }

      // Choose a motivational athletic closing quote
      const quotes = [
        "Remember: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.' - Aristotle",
        "As Nike coaches say: 'Run the day. Don't let the day run you.' Let's execute.",
        "Discipline is choosing between what you want now and what you want most.",
        "Your only competition is the version of you that woke up yesterday. Beat them.",
      ];
      const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

      const combinedText = `[GEMINI-COACH-ANALYTICS] -> Hello ${user.name}. ${insights.join(' ')} ${selectedQuote}`;
      
      setCoachingText(combinedText);
      setIsGenerating(false);
    }, 1500); // Simulate API latency
  };

  return (
    <div className="journey-card" style={{
      border: '1px solid rgba(255, 94, 0, 0.3)',
      background: 'linear-gradient(135deg, rgba(28, 28, 30, 0.95) 0%, rgba(20, 20, 22, 0.98) 100%)',
      position: 'relative',
    }}>
      {/* Decorative top grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--accent-orange) 0%, var(--accent-green) 100%)',
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BrainCircuit size={20} color="var(--accent-orange)" />
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.95rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-primary)',
          }}>
            Gemini Coach Execution Engine
          </h3>
        </div>
        <button
          onClick={generateTip}
          disabled={isGenerating || !user}
          className="btn-icon"
          style={{
            width: '32px',
            height: '32px',
            cursor: !user ? 'not-allowed' : 'pointer',
            opacity: !user ? 0.3 : 1
          }}
          title="Regenerate Advice"
        >
          <RefreshCw size={14} className={isGenerating ? 'spin-animation' : ''} style={{
            animation: isGenerating ? 'spin-slow 1.5s linear infinite' : 'none'
          }} />
        </button>
      </div>

      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '14px',
        minHeight: '110px',
        fontFamily: 'monospace',
        fontSize: '0.82rem',
        color: '#f1f1f1',
        lineHeight: '1.4',
        whiteSpace: 'pre-wrap',
        marginBottom: '14px',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
      }}>
        {isGenerating ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: 'var(--text-secondary)'
          }}>
            <span>&gt; Connecting to Google Gemini API...</span>
            <span>&gt; Compiling user execution vectors...</span>
            <div style={{
              width: '100%',
              height: '3px',
              backgroundColor: 'var(--border-color)',
              borderRadius: '2px',
              overflow: 'hidden',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: '60%',
                backgroundColor: 'var(--accent-orange)',
                borderRadius: '2px',
                animation: 'pulse-glow 1s infinite alternate'
              }} />
            </div>
          </div>
        ) : (
          <>
            <span style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>&gt;&gt; </span>
            {typedText}
            {typedText.length < coachingText.length && (
              <span style={{
                display: 'inline-block',
                width: '6px',
                height: '14px',
                backgroundColor: 'var(--accent-orange)',
                marginLeft: '2px',
                animation: 'pulse-glow 0.8s infinite alternate'
              }} />
            )}
          </>
        )}
      </div>

      <button
        onClick={generateTip}
        disabled={isGenerating || !user}
        className="btn btn-primary"
        style={{
          fontSize: '0.8rem',
          padding: '10px 16px',
          cursor: !user ? 'not-allowed' : 'pointer',
        }}
      >
        <Sparkles size={14} /> {isGenerating ? 'Generating...' : 'Request AI Coach Insight'}
      </button>
      {!user && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          textAlign: 'center',
          marginTop: '6px'
        }}>
          Complete onboarding first to enable AI insights.
        </p>
      )}
    </div>
  );
};
export default GeminiCoach;

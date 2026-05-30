import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, Lock, CheckCircle, ChevronDown } from 'lucide-react';

interface BadgesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BadgesDrawer: React.FC<BadgesDrawerProps> = ({ isOpen, onClose }) => {
  const { user, currentStreak, exercises, meals, getTodayDateString } = useApp();

  if (!isOpen) return null;

  // Calculate statistics
  const weightLost = user ? user.startWeight - user.currentWeight : 0;
  
  const today = getTodayDateString();
  const hasLoggedMeal = meals[today] && meals[today].log.trim().length > 0;
  
  const completedAnyExercise = exercises.some(ex => ex.completed >= ex.target);

  // Badge list with unlock condition and description
  const badges = [
    {
      id: 'onboard',
      name: 'Athlete Registered',
      desc: 'Create your custom athletic profile.',
      icon: Award,
      unlocked: !!user,
      progressText: user ? 'Unlocked' : 'Onboard in settings',
      progressPercent: user ? 100 : 0,
    },
    {
      id: '5kg',
      name: '5kg Dropped',
      desc: 'Lose 5 kg or more from starting weight.',
      icon: Award,
      unlocked: weightLost >= 5,
      progressText: `${Math.max(0, weightLost).toFixed(1)}kg / 5kg`,
      progressPercent: Math.min(100, (Math.max(0, weightLost) / 5) * 100),
    },
    {
      id: '10kg',
      name: '10kg Club',
      desc: 'Lose 10 kg or more from starting weight.',
      icon: Award,
      unlocked: weightLost >= 10,
      progressText: `${Math.max(0, weightLost).toFixed(1)}kg / 10kg`,
      progressPercent: Math.min(100, (Math.max(0, weightLost) / 10) * 100),
    },
    {
      id: 'streak',
      name: '7-Day Streak Master',
      desc: 'Check off all daily habits for 7 consecutive days.',
      icon: Award,
      unlocked: currentStreak >= 7,
      progressText: `${currentStreak} / 7 Days`,
      progressPercent: Math.min(100, (currentStreak / 7) * 100),
    },
    {
      id: 'reps',
      name: 'Iron Reps',
      desc: 'Smash your daily target on at least one movement.',
      icon: Award,
      unlocked: completedAnyExercise,
      progressText: completedAnyExercise ? 'Smashed' : '0 / 1 Completed',
      progressPercent: completedAnyExercise ? 100 : 0,
    },
    {
      id: 'meal',
      name: 'Clean Fuel',
      desc: 'Log a nutritious daily meal diary.',
      icon: Award,
      unlocked: hasLoggedMeal,
      progressText: hasLoggedMeal ? 'Logged' : 'Incomplete',
      progressPercent: hasLoggedMeal ? 100 : 0,
    },
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--bg-panel)',
        borderTop: '2px solid var(--accent-orange)',
        borderTopLeftRadius: 'var(--radius-xl)',
        borderTopRightRadius: 'var(--radius-xl)',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '24px 16px 40px 16px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.9)',
        animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Pull Drawer indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '16px',
          cursor: 'pointer'
        }} onClick={onClose}>
          <div style={{
            width: '48px',
            height: '4px',
            backgroundColor: 'var(--border-color)',
            borderRadius: '2px',
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.4rem',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}>
              Milestone Badge Gallery
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Unlocked {unlockedCount} of {badges.length} achievements
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-icon"
            style={{ width: '32px', height: '32px' }}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Badge Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.id}
                className="journey-card"
                style={{
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderColor: badge.unlocked ? 'var(--accent-orange)' : 'var(--border-color)',
                  backgroundColor: badge.unlocked ? 'rgba(255, 94, 0, 0.05)' : 'var(--bg-card)',
                  boxShadow: badge.unlocked ? '0 2px 12px var(--accent-orange-glow)' : 'none',
                }}
              >
                {/* Badge Icon circle */}
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: badge.unlocked ? 'var(--accent-orange)' : 'var(--bg-dark)',
                  border: badge.unlocked ? 'none' : '1px solid var(--border-color)',
                  position: 'relative'
                }}>
                  {badge.unlocked ? (
                    <Icon size={24} color="var(--text-primary)" />
                  ) : (
                    <Lock size={20} color="var(--text-muted)" />
                  )}
                  {badge.unlocked && (
                    <div style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      backgroundColor: 'var(--accent-green-dark)',
                      borderRadius: '50%',
                      padding: '1px'
                    }}>
                      <CheckCircle size={12} color="var(--bg-dark)" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}>
                    <h4 style={{
                      fontSize: '0.95rem',
                      fontFamily: 'var(--font-display)',
                      color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)'
                    }}>
                      {badge.name}
                    </h4>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-display)',
                      color: badge.unlocked ? 'var(--accent-orange)' : 'var(--text-muted)'
                    }}>
                      {badge.progressText}
                    </span>
                  </div>
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    marginBottom: '8px'
                  }}>
                    {badge.desc}
                  </p>
                  
                  {/* Small progress bar */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'var(--bg-dark)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${badge.progressPercent}%`,
                      backgroundColor: badge.unlocked ? 'var(--accent-green-dark)' : 'var(--text-muted)',
                      borderRadius: '2px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="btn btn-secondary">
          Close Cabinet
        </button>
      </div>
    </div>
  );
};
export default BadgesDrawer;

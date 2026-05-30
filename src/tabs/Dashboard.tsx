import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CircularProgress from '@/components/CircularProgress';
import GeminiCoach from '@/components/GeminiCoach';
import BadgesDrawer from '@/components/BadgesDrawer';
import { Trophy, TrendingDown, User, Edit3, Award } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, xp, level, updateWeight, updateUser } = useApp();
  const [isBadgesOpen, setIsBadgesOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [logError, setLogError] = useState('');
  const [isLoggingWeight, setIsLoggingWeight] = useState(false);

  // Profile Edit states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAge, setEditAge] = useState(String(user?.age || ''));
  const [editHeight, setEditHeight] = useState(String(user?.height || ''));
  const [editGoalWeight, setEditGoalWeight] = useState(String(user?.goalWeight || ''));
  const [editStartDate, setEditStartDate] = useState(user?.startDate || '');
  const [editError, setEditError] = useState('');

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) return setEditError('Please enter your name.');
    
    const parsedAge = parseInt(editAge, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) return setEditError('Please enter a valid age.');
    
    const parsedHeight = parseFloat(editHeight);
    if (isNaN(parsedHeight) || parsedHeight <= 0) return setEditError('Please enter a valid height (cm).');
    
    const parsedGoalWeight = parseFloat(editGoalWeight);
    if (isNaN(parsedGoalWeight) || parsedGoalWeight <= 0) return setEditError('Please enter a valid goal weight.');

    if (user) {
      updateUser({
        ...user,
        name: editName.trim(),
        age: parsedAge,
        height: parsedHeight,
        goalWeight: parsedGoalWeight,
        startDate: editStartDate
      });
    }
    setIsEditProfileOpen(false);
  };

  if (!user) return null;

  // Weight progress calculations
  const totalToLose = user.startWeight - user.goalWeight;
  const lostSoFar = user.startWeight - user.currentWeight;
  
  // Calculate percentage progress towards goal weight
  let progressPercentage = 0;
  if (totalToLose > 0) {
    // Weight loss goal
    progressPercentage = (lostSoFar / totalToLose) * 100;
  } else if (totalToLose < 0) {
    // Weight gain goal
    progressPercentage = (lostSoFar / totalToLose) * 100; // negative / negative = positive
  } else {
    progressPercentage = 100; // Goal is same as start
  }

  // Cap between 0 and 100
  const displayPercentage = Math.max(0, Math.min(100, Math.round(progressPercentage)));

  // BMI Calculation: weight (kg) / height(m)^2
  const heightInMeters = user.height / 100;
  const bmi = user.currentWeight / (heightInMeters * heightInMeters);
  
  // BMI Category
  let bmiCategory = 'Normal';
  let bmiColor = 'var(--accent-green)';
  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiColor = '#0a84ff';
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'Normal Weight';
    bmiColor = 'var(--accent-green)';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiColor = 'var(--accent-orange)';
  } else {
    bmiCategory = 'Obese';
    bmiColor = '#ef4444';
  }

  // Gamification progress bar percentage
  const levelProgress = xp % 100;

  const handleWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    setLogError('');
    const weightVal = parseFloat(newWeight);
    if (isNaN(weightVal) || weightVal <= 0) {
      setLogError('Please enter a valid weight.');
      return;
    }
    updateWeight(weightVal);
    setNewWeight('');
    setIsLoggingWeight(false);
  };

  return (
    <div className="anim-fade-up">
      {/* Athlete Welcome Card */}
      <div 
        className="journey-card interactive" 
        onClick={() => {
          setEditName(user.name);
          setEditAge(String(user.age));
          setEditHeight(String(user.height));
          setEditGoalWeight(String(user.goalWeight));
          setEditStartDate(user.startDate);
          setEditError('');
          setIsEditProfileOpen(true);
        }}
        style={{
          background: 'linear-gradient(to right, rgba(28,28,30,0.9), rgba(20,20,22,0.95))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        title="Edit Profile"
      >
        <div>
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--accent-orange)',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            ATHLETE PROFILE (TAP TO EDIT)
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 900,
            textTransform: 'uppercase'
          }}>
            {user.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Age: {user.age} yrs | Height: {user.height} cm
          </p>
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <User size={20} color="var(--accent-orange)" />
        </div>
      </div>

      {/* Gamification Bar */}
      <div className="journey-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              backgroundColor: 'var(--accent-orange-glow)',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Award size={16} color="var(--accent-orange)" />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                Athlete Level
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                LEVEL {level}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsBadgesOpen(true)}
            className="btn btn-secondary"
            style={{
              width: 'auto',
              padding: '6px 12px',
              fontSize: '0.75rem',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <Trophy size={12} color="var(--accent-orange)" /> Cabinet
          </button>
        </div>

        {/* XP Progress Slider */}
        <div style={{ position: 'relative', marginTop: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '4px'
          }}>
            <span>XP Progress</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{levelProgress} / 100 XP</span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{
              height: '100%',
              width: `${levelProgress}%`,
              backgroundColor: 'var(--accent-orange)',
              borderRadius: '4px',
              transition: 'width 0.4s ease',
              boxShadow: '0 0 10px rgba(255, 94, 0, 0.5)'
            }} />
          </div>
        </div>
      </div>

      {/* Target Progress Wheel & Weight Card */}
      <div className="journey-card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px'
      }}>
        <h3 className="heading-section" style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
          <TrendingDown size={20} color="var(--accent-orange)" />
          Target Progress Wheel
        </h3>

        <CircularProgress
          percentage={displayPercentage}
          size={200}
          strokeWidth={16}
          primaryColor={displayPercentage >= 100 ? 'var(--accent-green)' : 'var(--accent-orange)'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Progress
            </span>
            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
              {displayPercentage}%
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Goal: {user.goalWeight} kg
            </span>
          </div>
        </CircularProgress>

        {/* Weights & BMI Details */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          width: '100%',
          gap: '16px',
          marginTop: '24px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px'
        }}>
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Log weight
            </span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0' }}>
              {user.currentWeight} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>kg</span>
            </h4>
            <button
              onClick={() => setIsLoggingWeight(!isLoggingWeight)}
              className="btn btn-secondary"
              style={{
                width: 'auto',
                padding: '4px 10px',
                fontSize: '0.7rem',
                borderRadius: '4px',
                marginTop: '4px'
              }}
            >
              <Edit3 size={10} /> Log Weight
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Current BMI
            </span>
            <h4 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0' }}>
              {bmi.toFixed(1)}
            </h4>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: bmiColor,
              backgroundColor: `${bmiColor}1a`,
              padding: '2px 6px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              {bmiCategory}
            </span>
          </div>
        </div>

        {/* Quick Log Weight Drawer Input */}
        {isLoggingWeight && (
          <form onSubmit={handleWeightLog} style={{
            width: '100%',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed var(--border-color)',
            animation: 'fadeInUp 0.3s ease'
          }}>
            {logError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '8px', textAlign: 'center' }}>
                {logError}
              </p>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                step="0.1"
                placeholder="Log Weight (kg)"
                className="form-input"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.9rem' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 16px' }}>
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsLoggingWeight(false)}
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '0 12px' }}
              >
                X
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--accent-green)', textAlign: 'center', marginTop: '6px' }}>
              Log Weight to earn +50 XP
            </p>
          </form>
        )}

        <div style={{
          backgroundColor: 'rgba(255, 94, 0, 0.05)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          padding: '12px',
          marginTop: '16px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)'
        }}>
          Start weight: <strong>{user.startWeight} kg</strong> | Total lost:{' '}
          <strong style={{ color: 'var(--accent-green)' }}>{Math.max(0, lostSoFar).toFixed(1)} kg</strong>
        </div>
      </div>

      {/* Live AI Coaching Container */}
      <GeminiCoach />

      {/* Milestone Badges Cabinet Drawer */}
      <BadgesDrawer isOpen={isBadgesOpen} onClose={() => setIsBadgesOpen(false)} />

      {/* Edit Profile Modal Dialog */}
      {isEditProfileOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }} onClick={() => setIsEditProfileOpen(false)}>
          <div className="journey-card anim-scale-in" style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'var(--bg-panel)',
            padding: '24px',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1.1rem',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)',
              marginBottom: '16px',
              color: 'var(--text-primary)'
            }}>
              Edit Athlete Profile
            </h3>

            {editError && (
              <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px', textAlign: 'center' }}>
                {editError}
              </p>
            )}

            <form onSubmit={handleEditProfileSubmit}>
              <div className="form-group">
                <label className="form-label">Athlete Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Age (Years)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editHeight}
                    onChange={(e) => setEditHeight(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Goal Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={editGoalWeight}
                  onChange={(e) => setEditGoalWeight(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '10px 0', fontSize: '0.82rem' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

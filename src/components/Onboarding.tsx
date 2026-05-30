import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { UserProfile } from '../context/AppContext';
import { Zap, Award } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { updateUser, getTodayDateString } = useApp();
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!name.trim()) return setError('Please enter your name.');
    
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge <= 0) return setError('Please enter a valid age.');
    
    const parsedHeight = parseFloat(height);
    if (isNaN(parsedHeight) || parsedHeight <= 0) return setError('Please enter a valid height (cm).');
    
    const parsedCurrentWeight = parseFloat(currentWeight);
    if (isNaN(parsedCurrentWeight) || parsedCurrentWeight <= 0) return setError('Please enter your current weight.');
    
    const parsedGoalWeight = parseFloat(goalWeight);
    if (isNaN(parsedGoalWeight) || parsedGoalWeight <= 0) return setError('Please enter a valid goal weight.');
    
    if (!startDate) return setError('Please select a start date.');

    const profile: UserProfile = {
      name: name.trim(),
      age: parsedAge,
      height: parsedHeight,
      startWeight: parsedCurrentWeight,
      currentWeight: parsedCurrentWeight,
      goalWeight: parsedGoalWeight,
      startDate,
    };

    updateUser(profile);
  };

  return (
    <div className="onboarding-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--bg-dark)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      overflowY: 'auto'
    }}>
      <div className="journey-card anim-scale-in" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '32px 24px',
        border: '1px solid var(--accent-orange)',
        boxShadow: '0 10px 40px var(--accent-orange-glow)',
        backgroundColor: 'var(--bg-panel)',
      }}>
        {/* Header Icon */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-orange-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-orange)',
          }}>
            <Zap size={32} color="var(--accent-orange)" />
          </div>
        </div>

        <h1 style={{
          textAlign: 'center',
          fontSize: '2rem',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}>
          Begin <span style={{ color: 'var(--accent-orange)' }}>MyJourney</span>
        </h1>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          marginBottom: '24px',
        }}>
          Set up your athletic profile to customize targets, track progression, and unlock achievements.
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Athlete Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Mercer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                className="form-input"
                placeholder="28"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                type="number"
                className="form-input"
                placeholder="178"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Current Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="85.4"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Goal Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="75.0"
                value={goalWeight}
                onChange={(e) => setGoalWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button type="submit" className="btn btn-primary" style={{ height: '50px' }}>
              Create Athlete Profile
            </button>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'var(--accent-green)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              <Award size={14} /> Earn +100 XP On Registration
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Onboarding;

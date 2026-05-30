import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Exercise } from '../context/AppContext';
import CircularProgress from '../components/CircularProgress';
import QuickLogModal from '../components/QuickLogModal';
import { Dumbbell, Plus, Trash2, Award } from 'lucide-react';

export const ExerciseTracker: React.FC = () => {
  const { exercises, addExerciseTarget, logExerciseProgress, deleteExercise } = useApp();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExTarget, setNewExTarget] = useState('');
  const [formError, setFormError] = useState('');
  
  const [activeExerciseForLog, setActiveExerciseForLog] = useState<Exercise | null>(null);

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newExName.trim()) {
      setFormError('Please enter a movement name.');
      return;
    }

    const targetVal = parseInt(newExTarget, 10);
    if (isNaN(targetVal) || targetVal <= 0) {
      setFormError('Target must be a number greater than 0.');
      return;
    }

    addExerciseTarget(newExName.trim(), targetVal);
    setNewExName('');
    setNewExTarget('');
    setShowAddForm(false);
  };

  return (
    <div className="anim-fade-up">
      {/* Header bar with Add Trigger */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 className="heading-section">
          <Dumbbell size={22} color="var(--accent-orange)" />
          Rep targets
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '8px 16px', fontSize: '0.8rem' }}
        >
          <Plus size={16} /> Add Movement
        </button>
      </div>

      {/* Add Custom Movement Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddExercise} className="journey-card glow-orange" style={{
          animation: 'fadeInUp 0.3s ease',
          marginBottom: '20px'
        }}>
          <h3 style={{
            fontSize: '1rem',
            marginBottom: '12px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display)'
          }}>
            Set New Movement Target
          </h3>
          
          {formError && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '8px' }}>{formError}</p>
          )}

          <div className="form-group">
            <label className="form-label">Movement Name</label>
            <input
              type="text"
              placeholder="e.g. Pushups, Pullups, Squats, Planks (sec)"
              className="form-input"
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Daily Target (Reps/Sec)</label>
            <input
              type="number"
              placeholder="e.g. 50"
              className="form-input"
              value={newExTarget}
              onChange={(e) => setNewExTarget(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Lock Target
            </button>
          </div>
        </form>
      )}

      {/* Exercises Grid List */}
      {exercises.length === 0 ? (
        <div className="journey-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            No exercises targets set. Hit the "Add Movement" button to build your daily workout plan.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {exercises.map((ex) => {
            const remaining = Math.max(0, ex.target - ex.completed);
            const percentage = (ex.completed / ex.target) * 100;
            const isCompleted = ex.completed >= ex.target;
            
            return (
              <div
                key={ex.id}
                className={`journey-card ${isCompleted ? 'glow-green' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 20px',
                }}
              >
                {/* SVG Progress Circle */}
                <CircularProgress
                  percentage={percentage}
                  size={90}
                  strokeWidth={8}
                  primaryColor={isCompleted ? 'var(--accent-green-dark)' : 'var(--accent-orange)'}
                  glow={false}
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {Math.round(percentage)}%
                  </span>
                </CircularProgress>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontFamily: 'var(--font-display)',
                        textTransform: 'uppercase',
                        fontWeight: 800,
                        color: 'var(--text-primary)'
                      }}>
                        {ex.name}
                      </h3>
                      <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                        marginTop: '2px'
                      }}>
                        Target: {ex.target} reps | Done: {ex.completed}
                      </p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={() => deleteExercise(ex.id)}
                      className="btn-icon"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                        color: 'var(--text-muted)'
                      }}
                      title={`Remove ${ex.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Calculations text */}
                  <p style={{
                    fontSize: '0.82rem',
                    color: isCompleted ? 'var(--accent-green)' : 'var(--text-secondary)',
                    fontWeight: 500,
                    margin: '8px 0 12px 0',
                    lineHeight: '1.3'
                  }}>
                    {isCompleted
                      ? `Target achieved! Excellent effort.`
                      : `You've done ${ex.completed} of ${ex.target} ${ex.name.toLowerCase()} — ${remaining} left. Push harder!`}
                  </p>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => setActiveExerciseForLog(ex)}
                      className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                      style={{
                        fontSize: '0.75rem',
                        padding: '8px 12px',
                        width: 'auto',
                        height: '32px',
                        borderRadius: '6px'
                      }}
                    >
                      + Log Reps
                    </button>
                    {!isCompleted && (
                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--accent-green)',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        textTransform: 'uppercase'
                      }}>
                        <Award size={10} /> +20 XP on goal
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Log Modal Overlay */}
      <QuickLogModal
        exercise={activeExerciseForLog}
        isOpen={activeExerciseForLog !== null}
        onClose={() => setActiveExerciseForLog(null)}
        onLog={logExerciseProgress}
      />
    </div>
  );
};

export default ExerciseTracker;

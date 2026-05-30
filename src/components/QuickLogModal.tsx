import React, { useState } from 'react';
import type { Exercise } from '@/context/AppContext';
import { Dumbbell, Plus, X } from 'lucide-react';

interface QuickLogModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onLog: (id: string, reps: number) => void;
}

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  exercise,
  isOpen,
  onClose,
  onLog,
}) => {
  const [reps, setReps] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !exercise) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const count = parseInt(reps, 10);
    if (isNaN(count) || count <= 0) {
      setError('Please enter a number greater than 0.');
      return;
    }

    onLog(exercise.id, count);
    setReps('');
    onClose();
  };

  const handleQuickAdd = (value: number) => {
    onLog(exercise.id, value);
    onClose();
  };

  const remaining = Math.max(0, exercise.target - exercise.completed);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      zIndex: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }} onClick={onClose}>
      <div className="journey-card anim-scale-in" style={{
        width: '100%',
        maxWidth: '380px',
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border-color)',
        padding: '24px',
        margin: 0
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Dumbbell size={18} color="var(--accent-orange)" />
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              textTransform: 'uppercase'
            }}>
              Log {exercise.name}
            </h3>
          </div>
          <button onClick={onClose} className="btn-icon" style={{ width: '28px', height: '28px' }}>
            <X size={16} />
          </button>
        </div>

        {/* Dynamic calculation indicator */}
        <div style={{
          backgroundColor: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Today's Progress:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              {exercise.completed} / {exercise.target} reps
            </span>
          </div>
          <p style={{
            color: remaining === 0 ? 'var(--accent-green)' : 'var(--accent-orange)',
            fontWeight: 500
          }}>
            {remaining === 0
              ? `Daily goal smashed! Keep pushing limits.`
              : `You've done ${exercise.completed} of ${exercise.target} ${exercise.name.toLowerCase()} — ${remaining} left. Push harder!`}
          </p>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '10px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {/* Quick tap buttons */}
          <div style={{ marginBottom: '16px' }}>
            <span className="form-label" style={{ marginBottom: '8px' }}>Quick Add Reps</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 10, 15, 20].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 0',
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Custom Rep Count</label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                className="form-input"
                placeholder="Enter reps completed"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
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
              <Plus size={16} /> Log Reps
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default QuickLogModal;

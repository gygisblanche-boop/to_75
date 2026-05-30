import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Activity, Scale, Dumbbell, Moon, Heart, RefreshCw, Smartphone, Award } from 'lucide-react';

export const BodyComp: React.FC = () => {
  const { bodyComp, syncStatus, syncGoogleFit, updateBodyCompDirect } = useApp();
  const [activeManualMetric, setActiveManualMetric] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState('');
  
  const metrics = [
    {
      id: 'weight',
      name: 'Body Weight',
      value: `${bodyComp.weight} kg`,
      desc: 'Overall mass',
      icon: Scale,
      color: 'var(--accent-orange)'
    },
    {
      id: 'fat',
      name: 'Body Fat %',
      value: `${bodyComp.fatPercent}%`,
      desc: 'Adipose ratio',
      icon: Activity,
      color: '#bf5af2' // purple
    },
    {
      id: 'muscle',
      name: 'Muscle Mass',
      value: `${bodyComp.muscleMass} kg`,
      desc: 'Skeletal mass',
      icon: Dumbbell,
      color: '#0a84ff' // blue
    },
    {
      id: 'steps',
      name: 'Daily Steps',
      value: `${bodyComp.steps.toLocaleString()} / 10,000`,
      desc: 'Active baseline',
      icon: Heart,
      color: 'var(--accent-green-dark)'
    },
    {
      id: 'sleep',
      name: 'Sleep Duration',
      value: `${bodyComp.sleepDuration} hrs`,
      desc: `Slept at ${bodyComp.sleepTime}`,
      icon: Moon,
      color: '#ffd60a' // yellow
    }
  ];

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(manualValue);
    if (isNaN(val) || val <= 0) return;

    if (activeManualMetric === 'weight') updateBodyCompDirect({ weight: val });
    if (activeManualMetric === 'fat') updateBodyCompDirect({ fatPercent: val });
    if (activeManualMetric === 'muscle') updateBodyCompDirect({ muscleMass: val });
    if (activeManualMetric === 'steps') updateBodyCompDirect({ steps: Math.floor(val) });
    if (activeManualMetric === 'sleep') updateBodyCompDirect({ sleepDuration: val });

    setManualValue('');
    setActiveManualMetric(null);
  };

  return (
    <div className="anim-fade-up">
      {/* Google Fit Integration Panel */}
      <div className="journey-card" style={{
        background: 'linear-gradient(to right, rgba(28,28,30,0.9), rgba(20,20,22,0.95))',
        border: '1px solid var(--border-color)',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
            backgroundColor: 'rgba(10, 132, 255, 0.1)',
            border: '1px solid #0a84ff',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Smartphone size={20} color="#0a84ff" />
          </div>
          <div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.05rem',
              textTransform: 'uppercase',
              letterSpacing: '0.02em'
            }}>
              Google Fit API Pipeline
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              Sync weight, steps, sleep cycles, and composition.
            </p>
          </div>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={syncGoogleFit}
          disabled={syncStatus === 'syncing'}
          className="btn btn-primary"
          style={{
            backgroundColor: syncStatus === 'connected' ? 'var(--accent-green-dark)' : 'var(--accent-orange)',
            boxShadow: syncStatus === 'connected' ? '0 4px 12px var(--accent-green-glow)' : '0 4px 12px var(--accent-orange-glow)',
            fontSize: '0.82rem',
            padding: '12px 0'
          }}
        >
          <RefreshCw size={14} style={{
            animation: syncStatus === 'syncing' ? 'spin-slow 1.5s linear infinite' : 'none'
          }} />
          {syncStatus === 'idle' && 'Sync Google Fit'}
          {syncStatus === 'syncing' && 'Syncing REST Endpoints...'}
          {syncStatus === 'connected' && 'Google Fit Connected & Synced'}
        </button>

        {syncStatus === 'connected' && (
          <div className="anim-fade-up" style={{
            backgroundColor: 'rgba(57, 255, 20, 0.05)',
            border: '1px solid var(--accent-green-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginTop: '14px',
            fontSize: '0.8rem',
            color: 'var(--text-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', color: 'var(--accent-green)' }}>
              <Award size={14} /> Automation Trigger Fired:
            </div>
            Sleep time registered at <strong>{bodyComp.sleepTime}</strong> (before 10:30 PM limit). Habit <strong>"Sleep on Time"</strong> has been automatically logged and toggled to true! (+10 XP awarded).
          </div>
        )}
      </div>

      {/* Metrics Cards List */}
      <h3 className="heading-section" style={{ marginBottom: '16px', fontSize: '1.1rem' }}>
        Biometric Dashboards
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '12px',
        marginBottom: '24px'
      }}>
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              className="journey-card"
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 20px',
              }}
            >
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: `${metric.color}1a`,
                  border: `1px solid ${metric.color}4d`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: metric.color
                }}>
                  <Icon size={20} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-display)',
                    color: 'var(--text-primary)'
                  }}>
                    {metric.name}
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {metric.desc}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <span style={{
                  fontSize: '1.2rem',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  color: 'var(--text-primary)'
                }}>
                  {metric.value}
                </span>
                
                {metric.id !== 'steps' && (
                  <button
                    onClick={() => setActiveManualMetric(metric.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-orange)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'uppercase'
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Input overlay modal */}
      {activeManualMetric && (
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
        }} onClick={() => setActiveManualMetric(null)}>
          <div className="journey-card" style={{
            width: '100%',
            maxWidth: '320px',
            backgroundColor: 'var(--bg-panel)',
            padding: '24px',
            margin: 0
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: '1rem',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-display)',
              marginBottom: '16px'
            }}>
              Update {activeManualMetric.toUpperCase()}
            </h3>

            <form onSubmit={handleManualSave}>
              <div className="form-group">
                <label className="form-label">New Value</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  placeholder="Enter numeric value"
                  value={manualValue}
                  onChange={(e) => setManualValue(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveManualMetric(null)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.8rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '8px 0', fontSize: '0.8rem' }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyComp;

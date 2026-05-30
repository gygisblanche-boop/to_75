import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Activity, 
  Scale, 
  Dumbbell, 
  Moon, 
  Heart, 
  RefreshCw, 
  Smartphone, 
  Award, 
  Camera, 
  Upload, 
  Trash2, 
  Image,
  Eye,
  Sparkles
} from 'lucide-react';

export const BodyComp: React.FC = () => {
  const { bodyComp, syncStatus, syncGoogleFit, updateBodyCompDirect, user } = useApp();
  const [activeManualMetric, setActiveManualMetric] = useState<string | null>(null);
  const [manualValue, setManualValue] = useState('');
  
  // Local storage for body photos
  const [photos, setPhotos] = useState<{ front?: string; side?: string; back?: string }>(() => {
    try {
      const cached = localStorage.getItem('myjourney_body_photos_v1');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePhotoUpload = (angle: 'front' | 'side' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limit size to ~1.5MB to avoid localStorage quota exceed issues
    if (file.size > 2 * 1024 * 1024) {
      alert("File is too large! Please upload an image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        const updated = { ...photos, [angle]: base64 };
        setPhotos(updated);
        try {
          localStorage.setItem('myjourney_body_photos_v1', JSON.stringify(updated));
        } catch (err) {
          alert("Storage full! Try a smaller compressed photo.");
          console.warn("Storage write failed", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = (angle: 'front' | 'side' | 'back') => {
    const updated = { ...photos };
    delete updated[angle];
    setPhotos(updated);
    try {
      localStorage.setItem('myjourney_body_photos_v1', JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
  };

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

  // Calculations for simulated AI visualization values
  const hasPhotos = photos.front || photos.side || photos.back;
  const userWeight = user?.currentWeight || bodyComp.weight;
  const userFat = bodyComp.fatPercent;
  const userAge = user?.age || 30;
  const userHeight = user?.height || 175;

  const targetBf = 12;
  const ffm = userWeight * (1 - userFat / 100);
  const targetWeight = ffm / (1 - targetBf / 100);
  const milestoneWeight = userWeight - 5;
  const milestoneBf = userFat - ((userFat - targetBf) * (5 / (userWeight - targetWeight)));

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

      {/* Body Photos / Transformation Tracker */}
      <h3 className="heading-section" style={{ marginTop: '24px', marginBottom: '16px', fontSize: '1.1rem' }}>
        Transformation Gallery
      </h3>

      <div className="journey-card" style={{
        background: 'linear-gradient(145deg, rgba(28,28,30,0.95), rgba(18,18,22,0.98))',
        border: '1px solid var(--border-color)',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Current Checkpoint Photos
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', margin: '2px 0 0 0' }}>
              Upload views to activate body shape predictive AI.
            </p>
          </div>
          {hasPhotos && (
            <button
              onClick={() => setIsPreviewOpen(true)}
              style={{
                background: 'rgba(255, 94, 0, 0.1)',
                border: '1px solid var(--accent-orange)',
                borderRadius: '8px',
                color: 'var(--accent-orange)',
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <Eye size={12} /> View Prompts
            </button>
          )}
        </div>

        {/* 3-Column Upload Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {(['front', 'side', 'back'] as const).map((angle) => {
            const photoUrl = photos[angle];
            return (
              <div key={angle} style={{
                position: 'relative',
                width: '100%',
              }}>
                <input
                  type="file"
                  id={`upload-${angle}`}
                  accept="image/*"
                  onChange={(e) => handlePhotoUpload(angle, e)}
                  style={{ display: 'none' }}
                />
                
                {photoUrl ? (
                  /* Photo slot filled */
                  <div style={{
                    width: '100%',
                    aspectRatio: '3/4',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    position: 'relative',
                  }}>
                    <img 
                      src={photoUrl} 
                      alt={`${angle} view`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Delete overlay */}
                    <button
                      onClick={() => deletePhoto(angle)}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        border: 'none',
                        color: '#ff4d4d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                      title={`Remove ${angle} view`}
                    >
                      <Trash2 size={12} />
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      padding: '3px 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}>
                      {angle}
                    </div>
                  </div>
                ) : (
                  /* Photo slot empty / Upload Box */
                  <label 
                    htmlFor={`upload-${angle}`}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      aspectRatio: '3/4',
                      borderRadius: '12px',
                      border: '1.5px dashed var(--border-color)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: 'rgba(255,255,255,0.01)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-orange)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 94, 0, 0.02)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                    }}
                  >
                    <Camera size={18} color="var(--text-secondary)" style={{ marginBottom: '6px' }} />
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      textTransform: 'capitalize'
                    }}>
                      {angle}
                    </span>
                    <span style={{
                      fontSize: '0.55rem',
                      color: 'var(--text-muted)',
                      marginTop: '2px'
                    }}>
                      Tap to upload
                    </span>
                  </label>
                )}
              </div>
            );
          })}
        </div>
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

      {/* AI Transformation Preview Modal */}
      {isPreviewOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }} onClick={() => setIsPreviewOpen(false)}>
          <div className="journey-card" style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: 'var(--bg-panel)',
            maxHeight: '85vh',
            overflowY: 'auto',
            padding: '24px',
            margin: 0,
            border: '1px solid var(--accent-orange)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                backgroundColor: 'rgba(255, 94, 0, 0.1)',
                padding: '6px',
                borderRadius: '8px',
                color: 'var(--accent-orange)'
              }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{
                fontSize: '1rem',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-display)',
                margin: 0
              }}>
                AI Transformation Pipeline
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <p>
                Based on your uploaded photos and active biometrics, here is your generated **Stable Diffusion / Imagen** visualization payload.
              </p>

              {/* Goal Prompts Info */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Target Goal ({targetWeight.toFixed(1)} kg | 12% Body Fat)
                </strong>
                <code style={{ fontSize: '0.72rem', color: 'var(--accent-orange)', display: 'block', wordBreak: 'break-word', userSelect: 'all', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px' }}>
                  A realistic, high-detail full-body studio photograph of a {userAge}-year-old male, {userHeight} cm tall, weighing {targetWeight.toFixed(1)} kg. He has a visibly lean, athletic physique with 12% body fat, defined abdominal muscles, and a flat stomach...
                </code>
              </div>

              {/* Milestone Prompts Info */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                borderRadius: '10px',
                padding: '12px'
              }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Next Milestone Preview ({milestoneWeight.toFixed(1)} kg | {milestoneBf.toFixed(1)}% BF)
                </strong>
                <code style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', display: 'block', wordBreak: 'break-word', userSelect: 'all', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px', marginBottom: '6px' }}>
                  [Front Angle] A realistic full-body studio photograph of a {userAge}-year-old male, {userHeight} cm tall, weighing {milestoneWeight.toFixed(1)} kg with {milestoneBf.toFixed(1)}% body fat...
                </code>
                <span style={{ fontSize: '0.68rem', fontStyle: 'italic', display: 'block' }}>
                  (Includes Front, 45° Side, and Back views for the milestone checkpoint)
                </span>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                Close Pipeline View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyComp;

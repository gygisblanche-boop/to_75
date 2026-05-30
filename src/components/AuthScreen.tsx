import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { isSupabaseEnabled } from '@/supabase';
import { Zap, Eye, EyeOff, AlertTriangle, ShieldCheck, Mail, Lock } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { loginWithEmail, registerWithEmail, enableDemoMode } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (isRegister && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await registerWithEmail(email.trim(), password);
      } else {
        await loginWithEmail(email.trim(), password);
      }
    } catch (err: any) {
      let friendlyError = 'Authentication failed. Please check credentials.';
      // Friendly Supabase Auth error mapping
      if (err.message) {
        friendlyError = err.message;
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  // Password complexity helper for Sign Up
  const getPasswordStrength = () => {
    if (password.length === 0) return { score: 0, text: '', color: 'transparent' };
    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
        return { score, text: 'Weak (Must be 6+ characters)', color: '#ef4444' };
      case 2:
        return { score, text: 'Medium (Include numbers/symbols)', color: 'var(--accent-orange)' };
      case 3:
      case 4:
        return { score, text: 'Strong Athlete Password', color: 'var(--accent-green-dark)' };
      default:
        return { score: 0, text: '', color: 'transparent' };
    }
  };

  const strength = getPasswordStrength();

  return (
    <div style={{
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
        maxWidth: '400px',
        padding: '32px 24px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-panel)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Logo Header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-orange-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--accent-orange)',
            animation: 'pulse-glow 2s infinite ease-in-out'
          }}>
            <Zap size={28} color="var(--accent-orange)" />
          </div>
        </div>

        <h2 style={{
          textAlign: 'center',
          fontSize: '1.75rem',
          fontFamily: 'var(--font-display)',
          fontWeight: 900,
          textTransform: 'uppercase',
          marginBottom: '6px',
          letterSpacing: '-0.02em'
        }}>
          {isRegister ? 'Create Athlete Account' : 'Lace Up & Sign In'}
        </h2>
        <p style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem',
          marginBottom: '20px'
        }}>
          {isRegister
            ? 'Track your habits, log weights, and back up metrics in the cloud.'
            : 'Access your global training state from any browser origin.'}
        </p>

        {/* Supabase Environment Status message */}
        {!isSupabaseEnabled && (
          <div style={{
            backgroundColor: 'rgba(255, 94, 0, 0.08)',
            border: '1px solid rgba(255, 94, 0, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            <AlertTriangle size={18} color="var(--accent-orange)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase' }}>
                Local Mode Active
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.3', marginTop: '2px' }}>
                Supabase configuration keys not detected in `.env.local`. Run in local Demo Mode to test the client interface instantly.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {isSupabaseEnabled ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Athlete Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@athlete.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '42px' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Secret Key (Password)</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '42px', paddingRight: '42px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '12px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {isRegister && strength.text && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    flex: 1,
                    height: '3px',
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${(strength.score / 4) * 100}%`,
                      backgroundColor: strength.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: strength.color, fontWeight: 600 }}>
                    {strength.text}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ height: '48px', marginTop: '8px' }}
            >
              {loading
                ? 'Connecting servers...'
                : isRegister
                ? 'Create Cloud Account'
                : 'Sign In to Arena'}
            </button>
          </form>
        ) : (
          <button
            onClick={enableDemoMode}
            className="btn btn-primary"
            style={{
              height: '50px',
              backgroundColor: 'var(--accent-orange)',
              boxShadow: '0 4px 12px var(--accent-orange-glow)',
              marginBottom: '10px'
            }}
          >
            <ShieldCheck size={18} /> Launch local Demo Mode
          </button>
        )}

        {/* Swappers and Backups */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginTop: '20px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          fontSize: '0.85rem'
        }}>
          {isSupabaseEnabled && (
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : 'New athlete? Create account'}
            </button>
          )}

          {isSupabaseEnabled && (
            <button
              onClick={enableDemoMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.78rem'
              }}
            >
              Or bypass and run locally in Demo Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AuthScreen;

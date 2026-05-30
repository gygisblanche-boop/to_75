import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import AuthScreen from '@/components/AuthScreen';
import Onboarding from '@/components/Onboarding';
import Navigation from '@/components/Navigation';
import type { TabType } from '@/components/Navigation';
import Dashboard from '@/tabs/Dashboard';
import ExerciseTracker from '@/tabs/ExerciseTracker';
import HabitLog from '@/tabs/HabitLog';
import BodyComp from '@/tabs/BodyComp';
import TodoList from '@/tabs/TodoList';
import { Zap, RotateCcw, Smartphone, LogOut, Cloud } from 'lucide-react';


interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

function App() {
  const { 
    user, 
    levelUpPopup, 
    closeLevelUpPopup, 
    resetApp,
    authLoading,
    authUser,
    isDemoMode,
    logout
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPromo, setShowInstallPromo] = useState(false);

  // Capture PWA Install prompt event
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPromo(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallPromo(false);
  };

  // Switch tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'exercises':
        return <ExerciseTracker />;
      case 'habits':
        return <HabitLog />;
      case 'bodycomp':
        return <BodyComp />;
      case 'todos':
        return <TodoList />;
      default:
        return <Dashboard />;
    }
  };

  // 1. Loading State: Checking authentication status
  if (authLoading) {
    return (
      <div className="app-container" style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-dark)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--accent-orange)',
          animation: 'spin-slow 1s linear infinite',
          marginBottom: '20px'
        }} />
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.25rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          Syncing Athlete Key...
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
          Connecting to Supabase database
        </p>
      </div>
    );
  }

  // 2. Authentication Gate: Force Login Screen if not authenticated AND not in Demo Mode
  const isUserAuthenticated = !!authUser;
  const showAuthGate = !isUserAuthenticated && !isDemoMode;

  if (showAuthGate) {
    return (
      <div className="app-container">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Show Onboarding screen if user profile doesn't exist */}
      {!user && <Onboarding />}

      {/* Header bar */}
      {user && (
        <header style={{
          height: '64px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 16px',
          flexShrink: 0,
          background: 'rgba(10,10,10,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} color="var(--accent-orange)" style={{ filter: 'var(--glow-orange-filter)' }} />
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.15rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              My<span style={{ color: 'var(--accent-orange)' }}>Journey</span>
            </h1>
          </div>

          {/* Connection Details and Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Status indicator badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: isUserAuthenticated ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 94, 0, 0.1)',
              color: isUserAuthenticated ? 'var(--accent-green)' : 'var(--accent-orange)',
              border: isUserAuthenticated ? '1px solid rgba(57, 255, 20, 0.2)' : '1px solid rgba(255, 94, 0, 0.2)'
            }} title={isUserAuthenticated ? `Cloud Backup Active: ${authUser?.email}` : 'Local storage fallback'}>
              {isUserAuthenticated ? (
                <>
                  <Cloud size={10} /> Cloud Sync
                </>
              ) : (
                'Local Demo'
              )}
            </div>

            {/* Logout button */}
            <button
              onClick={() => {
                if (window.confirm(isUserAuthenticated ? 'Sign out of MyJourney cloud?' : 'Exit local Demo Mode?')) {
                  logout();
                  setActiveTab('dashboard');
                }
              }}
              className="btn-icon"
              style={{ width: '32px', height: '32px', color: 'var(--text-secondary)' }}
              title="Sign Out / Exit Demo"
            >
              <LogOut size={14} />
            </button>

            {/* Developer Reset button */}
            <button
              onClick={() => {
                if (window.confirm('Reset all tracking stats, user profile parameters, and current database records?')) {
                  resetApp();
                  setActiveTab('dashboard');
                }
              }}
              className="btn-icon"
              style={{ width: '32px', height: '32px', color: 'rgba(239, 68, 68, 0.6)', borderColor: 'rgba(239, 68, 68, 0.15)' }}
              title="Reset All Data"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </header>
      )}

      {/* Scrollable Main tab contents */}
      {user && (
        <main className="tab-content-container">
          {renderTabContent()}
        </main>
      )}

      {/* PWA Install Promotion Banner */}
      {showInstallPromo && user && (
        <div className="pwa-promo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={16} color="var(--accent-orange)" />
            <span className="pwa-promo-text">Install MyJourney on home screen?</span>
          </div>
          <div className="pwa-promo-actions">
            <button onClick={handleInstallClick} className="pwa-promo-btn pwa-promo-install">
              Install
            </button>
            <button onClick={() => setShowInstallPromo(false)} className="pwa-promo-btn pwa-promo-close">
              Later
            </button>
          </div>
        </div>
      )}

      {/* Navigation bottom menu */}
      {user && (
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Gamified Level Up Celebration Modal */}
      {levelUpPopup && levelUpPopup.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div className="journey-card glow-orange anim-pulse-glow" style={{
            width: '100%',
            maxWidth: '360px',
            backgroundColor: 'var(--bg-panel)',
            padding: '32px 24px',
            textAlign: 'center',
            border: '2px solid var(--accent-orange)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-orange-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--accent-orange)',
              margin: '0 auto 20px auto',
              animation: 'bounce-subtle 1s infinite alternate'
            }}>
              <Zap size={40} color="var(--accent-orange)" />
            </div>

            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2rem',
              textTransform: 'uppercase',
              fontWeight: 900,
              color: 'var(--text-primary)',
              margin: '0 0 8px 0'
            }}>
              Level Up!
            </h2>
            <p style={{
              color: 'var(--accent-green)',
              fontSize: '1rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}>
              Level {levelUpPopup.oldLevel} &rarr; Level {levelUpPopup.newLevel}
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              marginBottom: '24px'
            }}>
              You are pushing boundaries and training with discipline. New milestones are locked in your badge drawer!
            </p>

            <button onClick={closeLevelUpPopup} className="btn btn-primary">
              Continue Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

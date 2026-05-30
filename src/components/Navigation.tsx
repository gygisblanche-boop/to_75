import React from 'react';
import { LayoutDashboard, Dumbbell, Flame, Activity, ListTodo } from 'lucide-react';

export type TabType = 'dashboard' | 'exercises' | 'habits' | 'bodycomp' | 'todos';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exercises' as TabType, label: 'Exercises', icon: Dumbbell },
    { id: 'habits' as TabType, label: 'Habits', icon: Flame },
    { id: 'bodycomp' as TabType, label: 'Metrics', icon: Activity },
    { id: 'todos' as TabType, label: 'Tasks', icon: ListTodo },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`nav-item ${isActive ? 'active' : ''}`}
            aria-label={`Go to ${item.label}`}
            id={`nav-tab-${item.id}`}
          >
            <IconComponent />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;

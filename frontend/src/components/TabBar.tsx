/**
 * Компонент TabBar для нижней навигации
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Типы
import { TabType } from '@/types';

// Утилиты
import { hapticImpact } from '@/utils/telegram';

const tabs: Array<{
  id: TabType;
  label: string;
  icon: string;
  path: string;
}> = [
  { id: 'dashboard', label: 'Главная', icon: '🏠', path: '/dashboard' },
  { id: 'plans', label: 'Планы', icon: '📦', path: '/plans' },
  { id: 'analytics', label: 'Аналитика', icon: '📊', path: '/analytics' },
  { id: 'settings', label: 'Настройки', icon: '⚙️', path: '/settings' },
];

interface TabBarProps {
  className?: string;
}

const TabBar: React.FC<TabBarProps> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTabClick = (tabId: TabType, path: string) => {
    hapticImpact('light');
    navigate(path);
  };

  const isActiveTab = (path: string): boolean => {
    return location.pathname === path;
  };

  return (
    <div className={`border-t border-tg-hint bg-tg-secondary-bg ${className}`}>
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id, tab.path)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200
              ${isActiveTab(tab.path)
                ? 'text-tg-accent'
                : 'text-tg-hint hover:text-tg-text'
              }
            `}
          >
            <span className="text-xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabBar;

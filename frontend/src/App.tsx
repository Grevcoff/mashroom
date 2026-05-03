/**
 * Главный компонент приложения Mushroom Mini App
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Telegram WebApp утилиты
import { 
  initTelegramApp, 
  getTelegramUser, 
  getThemeColors, 
  applyThemeToCSS,
  setupBackButton,
  hideBackButton,
  closeTelegramApp
} from '@/utils/telegram';

// Store
import { useAppStore } from '@/store';

// Экраны
import DashboardScreen from '@/screens/DashboardScreen';
import PlansScreen from '@/screens/PlansScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

// UI компоненты
import TabBar from '@/components/TabBar';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';

// Типы
import { TelegramUser, ThemeColors } from '@/types';

function App() {
  const { 
    user, 
    theme, 
    setUser, 
    setTheme, 
    isLoading, 
    error,
    initializeApp 
  } = useAppStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  // Инициализация Telegram WebApp
  useEffect(() => {
    const initApp = async () => {
      try {
        // Проверяем, что приложение запущено в Telegram
        if (!window.Telegram?.WebApp) {
          console.warn('Приложение запущено вне Telegram');
          // Для разработки можно продолжить без Telegram
          setIsInitialized(true);
          return;
        }

        // Инициализация Telegram WebApp
        const webApp = initTelegramApp();
        
        // Получаем данные пользователя
        const tgUser = getTelegramUser();
        setTelegramUser(tgUser);
        setUser(tgUser);

        // Получаем и применяем тему
        const themeColors = getThemeColors(webApp.themeParams);
        setTheme(themeColors);
        applyThemeToCSS(themeColors);

        // Настройка кнопки "Назад"
        setupBackButton(() => {
          // Обработка нажатия на кнопку "Назад"
          window.history.back();
        });

        // Скрываем кнопку "Назад" при первом запуске
        hideBackButton();

        // Инициализация данных приложения
        await initializeApp();

        setIsInitialized(true);
      } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        setIsInitialized(true);
      }
    };

    initApp();
  }, [setUser, setTheme, initializeApp]);

  // Обработка изменений темы
  useEffect(() => {
    if (theme) {
      applyThemeToCSS(theme);
    }
  }, [theme]);

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('Ошибка приложения:', error);
    }
  }, [error]);

  // Показываем загрузочный экран во время инициализации
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  // Показываем экран ошибки, если есть критическая ошибка
  if (error && !user) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-tg-bg text-tg-text">
      <Router>
        <div className="flex flex-col h-screen">
          {/* Основной контент */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route 
                path="/" 
                element={<Navigate to="/dashboard" replace />} 
              />
              <Route 
                path="/dashboard" 
                element={<DashboardScreen />} 
              />
              <Route 
                path="/plans" 
                element={<PlansScreen />} 
              />
              <Route 
                path="/analytics" 
                element={<AnalyticsScreen />} 
              />
              <Route 
                path="/settings" 
                element={<SettingsScreen />} 
              />
              <Route 
                path="*" 
                element={<Navigate to="/dashboard" replace />} 
              />
            </Routes>
          </main>

          {/* Нижняя навигация */}
          <TabBar />

          {/* Toast уведомления */}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--tg-theme-secondary-bg-color)',
                color: 'var(--tg-theme-text-color)',
                border: '1px solid var(--tg-theme-hint-color)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'var(--tg-theme-secondary-bg-color)',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'var(--tg-theme-secondary-bg-color)',
                },
              },
            }}
          />
        </div>
      </Router>
    </div>
  );
}

export default App;

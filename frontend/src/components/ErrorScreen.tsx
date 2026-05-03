/**
 * Компонент экрана ошибок
 */

import React from 'react';

// Утилиты
import { closeTelegramApp } from '@/utils/telegram';

interface ErrorScreenProps {
  error: string;
  onRetry?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ 
  error, 
  onRetry 
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Перезагрузка страницы
      window.location.reload();
    }
  };

  const handleClose = () => {
    closeTelegramApp();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-tg-bg text-tg-text p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        {/* Иконка ошибки */}
        <div className="text-6xl">😵</div>
        
        {/* Заголовок */}
        <h1 className="text-xl font-bold text-tg-destructive">
          Ошибка приложения
        </h1>
        
        {/* Описание ошибки */}
        <div className="space-y-2">
          <p className="text-tg-text">
            Произошла ошибка при работе приложения
          </p>
          <p className="text-tg-hint text-sm">
            {error}
          </p>
        </div>
        
        {/* Кнопки действий */}
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={handleRetry}
              className="w-full py-3 px-4 bg-tg-button text-tg-button-text rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Попробовать снова
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-tg-secondary-bg text-tg-text rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Закрыть приложение
          </button>
        </div>
        
        {/* Подсказка */}
        <p className="text-tg-hint text-xs">
          Если ошибка повторяется, обратитесь к администратору
        </p>
      </div>
    </div>
  );
};

export default ErrorScreen;

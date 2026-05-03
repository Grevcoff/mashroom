/**
 * Компонент экрана загрузки
 */

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Загрузка...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-tg-bg text-tg-text">
      <div className="flex flex-col items-center space-y-4">
        {/* Спиннер */}
        <div className="relative">
          <div className="w-12 h-12 border-4 border-tg-hint border-t-tg-accent rounded-full animate-spin"></div>
        </div>
        
        {/* Сообщение */}
        <div className="text-center">
          <p className="text-tg-text font-medium">{message}</p>
          <p className="text-tg-hint text-sm mt-2">Пожалуйста, подождите...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;

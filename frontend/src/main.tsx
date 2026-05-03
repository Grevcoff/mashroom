/**
 * Точка входа в приложение Mushroom Mini App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Удаляем индикатор загрузки
const loadingElement = document.querySelector('.loading');
if (loadingElement) {
  loadingElement.remove();
}

// Создаем корневой элемент
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Рендерим приложение
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

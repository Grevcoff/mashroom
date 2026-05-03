/**
 * Утилиты для работы с Telegram WebApp SDK
 */

import { TelegramWebApp, TelegramThemeParams, ThemeColors, TelegramUser } from '@/types';

// Получение доступа к Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/**
 * Инициализация Telegram WebApp
 */
export const initTelegramApp = (): TelegramWebApp => {
  if (!window.Telegram?.WebApp) {
    throw new Error('Telegram WebApp SDK не загружен');
  }

  const webApp = window.Telegram.WebApp;
  
  // Расширяем на полный экран
  webApp.expand();
  
  // Сообщаем о готовности
  webApp.ready();
  
  return webApp;
};

/**
 * Получение цветов темы из Telegram
 */
export const getThemeColors = (themeParams: TelegramThemeParams): ThemeColors => {
  return {
    bg: themeParams.bg_color || '#ffffff',
    text: themeParams.text_color || '#000000',
    hint: themeParams.hint_color || '#999999',
    link: themeParams.link_color || '#2481cc',
    button: themeParams.button_color || '#007bff',
    buttonText: themeParams.button_text_color || '#ffffff',
    secondaryBg: themeParams.secondary_bg_color || '#f8f9fa',
    headerBg: themeParams.header_bg_color || '#ffffff',
    accent: themeParams.accent_text_color || '#007bff',
    destructive: themeParams.destructive_text_color || '#dc3545',
  };
};

/**
 * Применение темы к CSS переменным
 */
export const applyThemeToCSS = (colors: ThemeColors): void => {
  const root = document.documentElement;
  
  root.style.setProperty('--tg-theme-bg-color', colors.bg);
  root.style.setProperty('--tg-theme-text-color', colors.text);
  root.style.setProperty('--tg-theme-hint-color', colors.hint);
  root.style.setProperty('--tg-theme-link-color', colors.link);
  root.style.setProperty('--tg-theme-button-color', colors.button);
  root.style.setProperty('--tg-theme-button-text-color', colors.buttonText);
  root.style.setProperty('--tg-theme-secondary-bg-color', colors.secondaryBg);
  root.style.setProperty('--tg-theme-header-bg-color', colors.headerBg);
  root.style.setProperty('--tg-theme-accent-text-color', colors.accent);
  root.style.setProperty('--tg-theme-destructive-text-color', colors.destructive);
};

/**
 * Получение данных пользователя из Telegram
 */
export const getTelegramUser = (): TelegramUser => {
  const webApp = getTelegramWebApp();
  
  if (!webApp.initUnsafe) {
    throw new Error('Данные пользователя недоступны');
  }
  
  return webApp.initUnsafe;
};

/**
 * Получение initData для аутентификации
 */
export const getInitData = (): string => {
  const webApp = getTelegramWebApp();
  
  if (!webApp.initData) {
    throw new Error('InitData недоступен');
  }
  
  return webApp.initData;
};

/**
 * Безопасное получение Telegram WebApp
 */
export const getTelegramWebApp = (): TelegramWebApp => {
  if (!window.Telegram?.WebApp) {
    throw new Error('Telegram WebApp SDK недоступен');
  }
  
  return window.Telegram.WebApp;
};

/**
 * Настройка MainButton
 */
export const setupMainButton = (
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
  }
): void => {
  const webApp = getTelegramWebApp();
  
  webApp.MainButton.setText(text);
  
  if (options?.color) {
    webApp.MainButton.setParams({ color: options.color });
  }
  
  if (options?.textColor) {
    webApp.MainButton.setParams({ text_color: options.textColor });
  }
  
  webApp.MainButton.onClick(onClick);
  webApp.MainButton.show();
};

/**
 * Скрытие MainButton
 */
export const hideMainButton = (): void => {
  const webApp = getTelegramWebApp();
  webApp.MainButton.hide();
};

/**
 * Настройка BackButton
 */
export const setupBackButton = (onClick: () => void): void => {
  const webApp = getTelegramWebApp();
  
  webApp.BackButton.onClick(onClick);
  webApp.BackButton.show();
};

/**
 * Скрытие BackButton
 */
export const hideBackButton = (): void => {
  const webApp = getTelegramWebApp();
  webApp.BackButton.hide();
};

/**
 * Тактильная отдача
 */
export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light'): void => {
  try {
    const webApp = getTelegramWebApp();
    webApp.HapticFeedback.impactOccurred(style);
  } catch (error) {
    // Игнорируем ошибки, если устройство не поддерживает
  }
};

/**
 * Уведомление
 */
export const hapticNotification = (type: 'error' | 'success' | 'warning'): void => {
  try {
    const webApp = getTelegramWebApp();
    webApp.HapticFeedback.notificationOccurred(type);
  } catch (error) {
    // Игнорируем ошибки, если устройство не поддерживает
  }
};

/**
 * Изменение выбора
 */
export const hapticSelectionChanged = (): void => {
  try {
    const webApp = getTelegramWebApp();
    webApp.HapticFeedback.selectionChanged();
  } catch (error) {
    // Игнорируем ошибки, если устройство не поддерживает
  }
};

/**
 * Закрытие Mini App
 */
export const closeTelegramApp = (): void => {
  const webApp = getTelegramWebApp();
  webApp.close();
};

/**
 * Проверка, запущено ли приложение в Telegram
 */
export const isTelegramEnvironment = (): boolean => {
  return !!window.Telegram?.WebApp;
};

/**
 * Получение безопасной зоны для мобильных устройств
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
    right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
    bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
    left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0'),
  };
};

/**
 * Форматирование суммы в рублях
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Форматирование веса
 */
export const formatWeight = (kg: number): string => {
  if (kg < 1) {
    return `${(kg * 1000).toFixed(0)} г`;
  }
  return `${kg.toFixed(2)} кг`;
};

/**
 * Форматирование процента
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

/**
 * Форматирование даты
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Форматирование времени
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Получение цвета для типа транзакции
 */
export const getTransactionTypeColor = (type: 'expense' | 'income'): string => {
  return type === 'expense' ? '#ef4444' : '#10b981';
};

/**
 * Получение иконки для типа транзакции
 */
export const getTransactionTypeIcon = (type: 'expense' | 'income'): string => {
  return type === 'expense' ? '↓' : '↑';
};

/**
 * Валидация суммы
 */
export const validateAmount = (amount: string): boolean => {
  const regex = /^\d+([.,]\d{1,2})?$/;
  return regex.test(amount);
};

/**
 * Конвертация строки в число
 */
export const parseAmount = (amount: string): number => {
  const cleaned = amount.replace(',', '.');
  const parsed = parseFloat(cleaned);
  
  if (isNaN(parsed)) {
    throw new Error('Неверный формат суммы');
  }
  
  return parsed;
};

/**
 * Получение сегодняшней даты в формате YYYY-MM-DD
 */
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Проверка, является ли дата сегодняшней
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * Получение относительной даты
 */
export const getRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = today.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дня назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} мес. назад`;
  return `${Math.floor(diffDays / 365)} г. назад`;
};

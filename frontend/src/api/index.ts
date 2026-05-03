/**
 * API клиент для Mushroom Mini App
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';

// Типы для API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status_code?: number;
}

export interface ApiError {
  error: string;
  status_code: number;
}

// Базовый URL API с улучшенным fallback
const getApiBaseUrl = (): string => {
  // 1. Переменная окружения (высший приоритет)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // 2. Для разработки
  if (import.meta.env.DEV) {
    return 'http://localhost:8000/api';
  }
  
  // 3. Для продакшена на Vercel (прокси через /api)
  if (import.meta.env.MODE === 'production') {
    return '/api';
  }
  
  // 4. Fallback
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Создание Axios инстанса с настройками для Telegram WebApp
 */
export const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Интерцептор для добавления заголовка авторизации
  instance.interceptors.request.use(
    (config) => {
      try {
        // Получаем initData из Telegram WebApp
        const initData = window.Telegram?.WebApp?.initData;
        if (initData) {
          config.headers.Authorization = `tma ${initData}`;
        }
      } catch (error) {
        console.error('Ошибка при получении initData:', error);
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Интерцептор для обработки ошибок
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      const errorMessage = error.response?.data?.error || 'Произошла ошибка';
      
      // Показываем toast уведомление об ошибке
      toast.error(errorMessage);
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Создание API инстанса
export const api = createApiInstance();

/**
 * Обертка для API запросов с обработкой ошибок
 */
export const apiRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>
): Promise<T> => {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Ошибка авторизации - возможно, нужно перезагрузить приложение
      toast.error('Ошибка авторизации. Перезапустите приложение.');
      throw error;
    }
    
    if (error.response?.status === 404) {
      toast.error('Данные не найдены');
      throw error;
    }
    
    if (error.response?.status >= 500) {
      toast.error('Ошибка сервера. Попробуйте позже.');
      throw error;
    }
    
    throw error;
  }
};

// ===== ПЛАНЫ =====

export interface Plan {
  id: number;
  name: string;
  status: 'active' | 'completed';
  start_date: string;
  end_date?: string;
  revenue: number;
  yield_kg: number;
  created_at: string;
}

export interface PlanCreate {
  name: string;
}

export interface PlanUpdate {
  name?: string;
  revenue?: number;
  yield_kg?: number;
}

export interface PlanComplete {
  revenue: number;
  yield_kg: number;
}

export interface PlanStats {
  plan_id: number;
  plan_name: string;
  plan_status: string;
  start_date: string;
  end_date?: string;
  total_expenses: number;
  total_income: number;
  revenue: number;
  profit: number;
  roi: number;
  days: number;
  yield_kg: number;
  cost_per_kg: number;
  transactions_count: number;
}

export const plansApi = {
  // Получить все планы
  getPlans: (status?: string) =>
    apiRequest(() => api.get<{ plans: Plan[] }>('/plans', { params: { status } })),

  // Получить план по ID
  getPlan: (id: number) =>
    apiRequest(() => api.get<Plan>(`/plans/${id}`)),

  // Создать план
  createPlan: (data: PlanCreate) =>
    apiRequest(() => api.post<Plan>('/plans', data)),

  // Обновить план
  updatePlan: (id: number, data: PlanUpdate) =>
    apiRequest(() => api.put<Plan>(`/plans/${id}`, data)),

  // Завершить план
  completePlan: (id: number, data: PlanComplete) =>
    apiRequest(() => api.post<Plan>(`/plans/${id}/complete`, data)),

  // Удалить план
  deletePlan: (id: number) =>
    apiRequest(() => api.delete<{ message: string }>(`/plans/${id}`)),

  // Получить статистику плана
  getPlanStats: (id: number) =>
    apiRequest(() => api.get<PlanStats>(`/plans/${id}/stats`)),
};

// ===== КАТЕГОРИИ =====

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  created_at: string;
}

export interface CategoryCreate {
  name: string;
  type: 'expense' | 'income';
}

export const categoriesApi = {
  // Получить все категории
  getCategories: (type?: string) =>
    apiRequest(() => api.get<{ categories: Category[] }>('/categories', { params: { type } })),

  // Поиск категорий
  searchCategories: (query: string, type?: string) =>
    apiRequest(() => api.get<{ categories: Category[] }>('/categories/search', { 
      params: { q: query, type } 
    })),

  // Создать категорию
  createCategory: (data: CategoryCreate) =>
    apiRequest(() => api.post<Category>('/categories', data)),

  // Удалить категорию
  deleteCategory: (id: number) =>
    apiRequest(() => api.delete<{ message: string }>(`/categories/${id}`)),
};

// ===== ТРАНЗАКЦИИ =====

export interface Transaction {
  id: number;
  plan_id: number;
  category_id: number;
  category_name: string;
  category_type: string;
  amount: number;
  type: 'expense' | 'income';
  comment?: string;
  date: string;
  created_at: string;
}

export interface TransactionCreate {
  plan_id: number;
  category_id: number;
  amount: number;
  type: 'expense' | 'income';
  comment?: string;
  date?: string;
}

export interface TransactionUpdate {
  amount?: number;
  comment?: string;
  date?: string;
}

export const transactionsApi = {
  // Получить транзакции
  getTransactions: (planId?: number, recent?: boolean) =>
    apiRequest(() => api.get<{ transactions: Transaction[] }>('/transactions', { 
      params: { plan_id: planId, recent } 
    })),

  // Создать транзакцию
  createTransaction: (data: TransactionCreate) =>
    apiRequest(() => api.post<Transaction>('/transactions', data)),

  // Обновить транзакцию
  updateTransaction: (id: number, data: TransactionUpdate) =>
    apiRequest(() => api.put<Transaction>(`/transactions/${id}`, data)),

  // Удалить транзакцию
  deleteTransaction: (id: number) =>
    apiRequest(() => api.delete<{ message: string }>(`/transactions/${id}`)),
};

// ===== СТАТИСТИКА =====

export interface UserStats {
  total_plans: number;
  active_plans: number;
  completed_plans: number;
  total_expenses: number;
  total_income: number;
  total_profit: number;
  total_yield: number;
  avg_roi: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
}

export interface TimeSeriesData {
  date: string;
  expenses: number;
  income: number;
}

export const statsApi = {
  // Получить общую статистику
  getUserStats: () =>
    apiRequest(() => api.get<UserStats>('/stats')),

  // Получить расходы по категориям
  getCategoryStats: (planId?: number) =>
    apiRequest(() => api.get<{ categories: CategoryExpense[] }>('/stats/categories', { 
      params: { plan_id: planId } 
    })),

  // Получить данные для графика
  getTimeSeriesStats: (days: number = 30) =>
    apiRequest(() => api.get<{ data: TimeSeriesData[] }>('/stats/time-series', { 
      params: { days } 
    })),
};

// ===== HEALTH CHECK =====

export const healthApi = {
  // Проверка здоровья API
  checkHealth: () =>
    apiRequest(() => api.get<{ status: string; timestamp: string }>('/health')),
};

// ===== УТИЛИТЫ =====

/**
 * Проверка доступности API
 */
export const checkApiAvailability = async (): Promise<boolean> => {
  try {
    await healthApi.checkHealth();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Получение базового URL
 */
export const getApiBaseUrl = (): string => API_BASE_URL;

/**
 * Обработка ошибок API
 */
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};

/**
 * Создание debounce функции для поиска
 */
export const createDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Экспорт по умолчанию
export default api;

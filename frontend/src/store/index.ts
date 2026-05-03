/**
 * Zustand store для управления состоянием приложения
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AppState, 
  AppActions, 
  Plan, 
  Category, 
  Transaction, 
  UserStats,
  TelegramUser,
  ThemeColors 
} from '@/types';
import { plansApi, categoriesApi, transactionsApi, statsApi } from '@/api';
import toast from 'react-hot-toast';

// Тип для store
export type AppStore = AppState & AppActions;

/**
 * Создание store с persist для сохранения данных между сессиями
 */
export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      user: null,
      theme: {
        bg: '#ffffff',
        text: '#000000',
        hint: '#999999',
        link: '#2481cc',
        button: '#007bff',
        buttonText: '#ffffff',
        secondaryBg: '#f8f9fa',
        headerBg: '#ffffff',
        accent: '#007bff',
        destructive: '#dc3545',
      },
      isLoading: false,
      error: null,
      plans: [],
      categories: [],
      transactions: [],
      stats: null,

      // Actions
      setUser: (user: TelegramUser) => set({ user }),

      setTheme: (theme: ThemeColors) => set({ theme }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setError: (error: string | null) => set({ error }),

      setPlans: (plans: Plan[]) => set({ plans }),

      setCategories: (categories: Category[]) => set({ categories }),

      setTransactions: (transactions: Transaction[]) => set({ transactions }),

      setStats: (stats: UserStats) => set({ stats }),

      reset: () => set({
        user: null,
        plans: [],
        categories: [],
        transactions: [],
        stats: null,
        error: null,
        isLoading: false,
      }),

      // Async actions
      loadPlans: async (status?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await plansApi.getPlans(status);
          set({ plans: response.plans });
        } catch (error: any) {
          set({ error: error.message || 'Ошибка загрузки планов' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadCategories: async (type?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await categoriesApi.getCategories(type);
          set({ categories: response.categories });
        } catch (error: any) {
          set({ error: error.message || 'Ошибка загрузки категорий' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadTransactions: async (planId?: number, recent?: boolean) => {
        set({ isLoading: true, error: null });
        try {
          const response = await transactionsApi.getTransactions(planId, recent);
          set({ transactions: response.transactions });
        } catch (error: any) {
          set({ error: error.message || 'Ошибка загрузки транзакций' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      loadStats: async () => {
        set({ isLoading: true, error: null });
        try {
          const stats = await statsApi.getUserStats();
          set({ stats });
        } catch (error: any) {
          set({ error: error.message || 'Ошибка загрузки статистики' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      createPlan: async (name: string) => {
        set({ isLoading: true, error: null });
        try {
          const plan = await plansApi.createPlan({ name });
          set(state => ({ plans: [plan, ...state.plans] }));
          toast.success('План создан');
          return plan;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка создания плана' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updatePlan: async (id: number, data: any) => {
        set({ isLoading: true, error: null });
        try {
          const plan = await plansApi.updatePlan(id, data);
          set(state => ({
            plans: state.plans.map(p => p.id === id ? plan : p)
          }));
          toast.success('План обновлен');
          return plan;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка обновления плана' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      completePlan: async (id: number, revenue: number, yieldKg: number) => {
        set({ isLoading: true, error: null });
        try {
          const plan = await plansApi.completePlan(id, { revenue, yield_kg: yieldKg });
          set(state => ({
            plans: state.plans.map(p => p.id === id ? plan : p)
          }));
          toast.success('План завершен');
          return plan;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка завершения плана' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deletePlan: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await plansApi.deletePlan(id);
          set(state => ({
            plans: state.plans.filter(p => p.id !== id),
            transactions: state.transactions.filter(t => t.plan_id !== id)
          }));
          toast.success('План удален');
        } catch (error: any) {
          set({ error: error.message || 'Ошибка удаления плана' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      createCategory: async (name: string, type: 'expense' | 'income') => {
        set({ isLoading: true, error: null });
        try {
          const category = await categoriesApi.createCategory({ name, type });
          set(state => ({ categories: [...state.categories, category] }));
          toast.success('Категория создана');
          return category;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка создания категории' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteCategory: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await categoriesApi.deleteCategory(id);
          set(state => ({
            categories: state.categories.filter(c => c.id !== id)
          }));
          toast.success('Категория удалена');
        } catch (error: any) {
          set({ error: error.message || 'Ошибка удаления категории' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      createTransaction: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
          const transaction = await transactionsApi.createTransaction(data);
          set(state => ({
            transactions: [transaction, ...state.transactions]
          }));
          toast.success('Транзакция добавлена');
          return transaction;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка создания транзакции' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateTransaction: async (id: number, data: any) => {
        set({ isLoading: true, error: null });
        try {
          const transaction = await transactionsApi.updateTransaction(id, data);
          set(state => ({
            transactions: state.transactions.map(t => t.id === id ? transaction : t)
          }));
          toast.success('Транзакция обновлена');
          return transaction;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка обновления транзакции' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteTransaction: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await transactionsApi.deleteTransaction(id);
          set(state => ({
            transactions: state.transactions.filter(t => t.id !== id)
          }));
          toast.success('Транзакция удалена');
        } catch (error: any) {
          set({ error: error.message || 'Ошибка удаления транзакции' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Поиск категорий с debounce
      searchCategories: async (query: string, type?: string) => {
        try {
          const response = await categoriesApi.searchCategories(query, type);
          return response.categories;
        } catch (error: any) {
          console.error('Ошибка поиска категорий:', error);
          return [];
        }
      },

      // Получение статистики по плану
      getPlanStats: async (planId: number) => {
        set({ isLoading: true, error: null });
        try {
          const stats = await plansApi.getPlanStats(planId);
          return stats;
        } catch (error: any) {
          set({ error: error.message || 'Ошибка загрузки статистики плана' });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Получение расходов по категориям
      getCategoryExpenses: async (planId?: number) => {
        try {
          const response = await statsApi.getCategoryStats(planId);
          return response.categories;
        } catch (error: any) {
          console.error('Ошибка загрузки расходов по категориям:', error);
          return [];
        }
      },

      // Получение данных для графиков
      getTimeSeriesData: async (days: number = 30) => {
        try {
          const response = await statsApi.getTimeSeriesStats(days);
          return response.data;
        } catch (error: any) {
          console.error('Ошибка загрузки данных для графиков:', error);
          return [];
        }
      },

      // Обновление всех данных
      refreshAllData: async () => {
        const store = get();
        try {
          await Promise.all([
            store.loadPlans(),
            store.loadCategories(),
            store.loadTransactions(undefined, true),
            store.loadStats(),
          ]);
          toast.success('Данные обновлены');
        } catch (error: any) {
          toast.error('Ошибка обновления данных');
        }
      },
    }),
    {
      name: 'mushroom-app-storage',
      partialize: (state) => ({
        // Сохраняем только определенные поля
        user: state.user,
        theme: state.theme,
        plans: state.plans,
        categories: state.categories,
        stats: state.stats,
      }),
    }
  )
);

/**
 * Селекторы для удобного доступа к данным
 */
export const useUser = () => useAppStore((state) => state.user);
export const useTheme = () => useAppStore((state) => state.theme);
export const usePlans = () => useAppStore((state) => state.plans);
export const useCategories = () => useAppStore((state) => state.categories);
export const useTransactions = () => useAppStore((state) => state.transactions);
export const useStats = () => useAppStore((state) => state.stats);
export const useLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);

/**
 * Селекторы для активных планов
 */
export const useActivePlans = () => useAppStore((state) => 
  state.plans.filter(plan => plan.status === 'active')
);

/**
 * Селекторы для завершенных планов
 */
export const useCompletedPlans = () => useAppStore((state) => 
  state.plans.filter(plan => plan.status === 'completed')
);

/**
 * Селекторы для категорий расходов
 */
export const useExpenseCategories = () => useAppStore((state) => 
  state.categories.filter(cat => cat.type === 'expense')
);

/**
 * Селекторы для категорий доходов
 */
export const useIncomeCategories = () => useAppStore((state) => 
  state.categories.filter(cat => cat.type === 'income')
);

/**
 * Селекторы для недавних транзакций
 */
export const useRecentTransactions = (limit: number = 10) => useAppStore((state) => 
  state.transactions.slice(0, limit)
);

/**
 * Селекторы для транзакций по плану
 */
export const usePlanTransactions = (planId: number) => useAppStore((state) => 
  state.transactions.filter(tx => tx.plan_id === planId)
);

/**
 * Селекторы для текущего активного плана
 */
export const useCurrentPlan = () => useAppStore((state) => 
  state.plans.find(plan => plan.status === 'active')
);

/**
 * Хук для инициализации приложения
 */
export const useAppInitialization = () => {
  const { user, theme, setUser, setTheme, loadPlans, loadCategories, loadTransactions, loadStats } = useAppStore();

  const initializeApp = async () => {
    try {
      // Загрузка начальных данных
      await Promise.all([
        loadPlans(),
        loadCategories(),
        loadTransactions(undefined, true),
        loadStats(),
      ]);
    } catch (error) {
      console.error('Ошибка инициализации приложения:', error);
    }
  };

  return {
    user,
    theme,
    setUser,
    setTheme,
    initializeApp,
  };
};

export default useAppStore;

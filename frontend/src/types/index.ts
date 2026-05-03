// Типы для Telegram WebApp и приложения

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initUnsafe: TelegramUser;
  themeParams: TelegramThemeParams;
  viewportChanged: () => void;
  expand: () => void;
  ready: () => void;
  close: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    setParams: (params: { color?: string; text_color?: string }) => void;
  };
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  destructive_text_color?: string;
}

// Типы для данных приложения

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

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  created_at: string;
}

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

// Типы для форм

export interface TransactionFormData {
  plan_id: number;
  category_id: number;
  amount: string;
  type: 'expense' | 'income';
  comment?: string;
  date: string;
}

export interface PlanFormData {
  name: string;
}

export interface CategoryFormData {
  name: string;
  type: 'expense' | 'income';
}

// Типы для навигации

export type TabType = 'dashboard' | 'plans' | 'analytics' | 'settings';

export interface NavigationItem {
  id: TabType;
  label: string;
  icon: string;
  path: string;
}

// Типы для UI компонентов

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface FormErrors {
  [key: string]: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status_code?: number;
}

// Типы для стилей

export interface ThemeColors {
  bg: string;
  text: string;
  hint: string;
  link: string;
  button: string;
  buttonText: string;
  secondaryBg: string;
  headerBg: string;
  accent: string;
  destructive: string;
}

// Типы для store (Zustand)

export interface AppState {
  user: TelegramUser | null;
  theme: ThemeColors;
  isLoading: boolean;
  error: string | null;
  plans: Plan[];
  categories: Category[];
  transactions: Transaction[];
  stats: UserStats | null;
}

export interface AppActions {
  setUser: (user: TelegramUser) => void;
  setTheme: (theme: ThemeColors) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPlans: (plans: Plan[]) => void;
  setCategories: (categories: Category[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setStats: (stats: UserStats) => void;
  reset: () => void;
}

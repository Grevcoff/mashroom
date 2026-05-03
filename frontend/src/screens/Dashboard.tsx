import React, { useEffect, useState } from 'react';

// Простая версия Dashboard без строгой типизации
export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Временные моковые данные
        const mockStats = {
          totalPlans: 3,
          activePlans: 2,
          totalRevenue: 15000,
          totalExpenses: 8500,
          profit: 6500,
          recentTransactions: [
            {
              id: 1,
              comment: 'Продажа грибов',
              date: '2024-01-15',
              amount: 5000,
              type: 'income'
            },
            {
              id: 2,
              comment: 'Покупка субстрата',
              date: '2024-01-14',
              amount: 3500,
              type: 'expense'
            },
            {
              id: 3,
              comment: 'Мицелий',
              date: '2024-01-13',
              amount: 1200,
              type: 'expense'
            }
          ]
        };

        // Имитация загрузки
        setTimeout(() => {
          setStats(mockStats);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Не удалось загрузить данные дашборда');
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl mb-4">🍄</div>
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl mb-4">😵</div>
        <div className="text-lg">Ошибка загрузки</div>
        <div className="text-sm text-gray-600 mt-2">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">
            🍄 Дашборд
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Обзор вашего грибного бизнеса
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalPlans}
            </div>
            <div className="text-sm text-gray-600">
              Всего планов
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {stats.activePlans}
            </div>
            <div className="text-sm text-gray-600">
              Активных планов
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">
              Доходы
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <div className="text-sm text-gray-600">
              Расходы
            </div>
          </div>
        </div>

        {/* Profit Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-6 text-white">
          <div className="text-sm font-medium mb-2">Чистая прибыль</div>
          <div className="text-3xl font-bold">
            {formatCurrency(stats.profit)}
          </div>
          <div className="text-sm mt-2 opacity-90">
            {stats.profit >= 0 ? '📈 Положительная динамика' : '📉 Требует внимания'}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Последние транзакции
            </h2>
          </div>
          
          <div className="divide-y">
            {stats.recentTransactions.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="text-2xl mb-2">💰</div>
                <div>Нет транзакций</div>
                <div className="text-sm mt-1">Добавьте первую транзакцию</div>
              </div>
            ) : (
              stats.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.comment || 'Транзакция'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                  <div className={`text-sm font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

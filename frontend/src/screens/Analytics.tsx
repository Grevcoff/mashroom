import React, { useEffect, useState } from 'react';

// Простая версия Analytics без строгой типизации
export const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        
        // Временные моковые данные
        const mockAnalytics = {
          summary: {
            totalRevenue: 65000,
            totalExpenses: 42000,
            profit: 23000,
            growth: 15.5,
            plansCount: 8
          },
          monthlyData: [
            { month: 'Авг', revenue: 12000, expenses: 8000, profit: 4000 },
            { month: 'Сен', revenue: 15000, expenses: 9000, profit: 6000 },
            { month: 'Окт', revenue: 18000, expenses: 11000, profit: 7000 },
            { month: 'Ноя', revenue: 20000, expenses: 12000, profit: 8000 }
          ],
          topProducts: [
            { name: 'Вешенки', revenue: 35000, percentage: 53.8 },
            { name: 'Шиитаке', revenue: 20000, percentage: 30.8 },
            { name: 'Опята', revenue: 10000, percentage: 15.4 }
          ],
          efficiency: {
            yieldRate: 85,
            costEfficiency: 78,
            timeEfficiency: 92
          }
        };

        // Имитация загрузки
        setTimeout(() => {
          setAnalytics(mockAnalytics);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Не удалось загрузить аналитику');
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl mb-4">📊</div>
        <div className="text-lg">Загрузка аналитики...</div>
      </div>
    );
  }

  if (error || !analytics) {
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
            📊 Аналитика
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Статистика и анализ вашего бизнеса
          </p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="px-4 py-4">
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}
            >
              {p === 'day' ? 'День' : p === 'week' ? 'Неделя' : p === 'month' ? 'Месяц' : 'Год'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-gray-600">Общий доход</div>
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(analytics.summary.totalRevenue)}
            </div>
            <div className="text-xs text-green-600 mt-1">
              ↑ {analytics.summary.growth}%
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-gray-600">Расходы</div>
            <div className="text-xl font-bold text-red-600">
              {formatCurrency(analytics.summary.totalExpenses)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-gray-600">Чистая прибыль</div>
            <div className="text-xl font-bold text-blue-600">
              {formatCurrency(analytics.summary.profit)}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-sm text-gray-600">Планов</div>
            <div className="text-xl font-bold text-purple-600">
              {analytics.summary.plansCount}
            </div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Динамика по месяцам
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {analytics.monthlyData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-12 text-sm font-medium text-gray-700">
                    {item.month}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="relative h-6 bg-gray-200 rounded">
                      <div
                        className="absolute h-full bg-gradient-to-r from-green-500 to-blue-500 rounded"
                        style={{ width: `${(item.revenue / 20000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.profit)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Топ продукты
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.percentage}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Эффективность
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Урожайность</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.efficiency.yieldRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analytics.efficiency.yieldRate}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Эффективность затрат</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.efficiency.costEfficiency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${analytics.efficiency.costEfficiency}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700">Эффективность времени</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.efficiency.timeEfficiency}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${analytics.efficiency.timeEfficiency}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Button */}
        <div className="flex justify-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            📥 Экспорт отчета
          </button>
        </div>
      </div>
    </div>
  );
};

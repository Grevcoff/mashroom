import React, { useEffect, useState } from 'react';

// Простая версия Plans без строгой типизации
export const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setLoading(true);
        
        // Временные моковые данные
        const mockPlans = [
          {
            id: 1,
            name: 'Вешенки - Январь 2024',
            description: 'Выращивание вешенок на субстрате',
            status: 'active',
            startDate: '2024-01-01',
            expectedRevenue: 20000,
            currentRevenue: 15000,
            progress: 75
          },
          {
            id: 2,
            name: 'Шиитаке - Февраль 2024',
            description: 'Выращивание шиитаке на бревнах',
            status: 'active',
            startDate: '2024-02-01',
            expectedRevenue: 35000,
            currentRevenue: 12000,
            progress: 34
          },
          {
            id: 3,
            name: 'Опята - Декабрь 2023',
            description: 'Зимний цикл опят',
            status: 'completed',
            startDate: '2023-12-01',
            expectedRevenue: 15000,
            currentRevenue: 16500,
            progress: 100
          }
        ];

        // Имитация загрузки
        setTimeout(() => {
          setPlans(mockPlans);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Не удалось загрузить планы');
        setLoading(false);
      }
    };

    loadPlans();
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'paused':
        return 'Приостановлен';
      default:
        return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl mb-4">🍄</div>
        <div className="text-lg">Загрузка...</div>
      </div>
    );
  }

  if (error) {
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
            📋 План производства
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Управление планами выращивания грибов
          </p>
        </div>
      </div>

      {/* Plans List */}
      <div className="px-4 py-6">
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="text-2xl mb-4">🌱</div>
            <div className="text-lg font-medium text-gray-900">Нет планов</div>
            <div className="text-sm text-gray-600 mt-2">
              Создайте свой первый план производства
            </div>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Создать план
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* Plan Header */}
                <div className="px-4 py-3 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {plan.description}
                  </p>
                </div>

                {/* Plan Details */}
                <div className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Начало</div>
                      <div className="font-medium text-gray-900">
                        {formatDate(plan.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Прогресс</div>
                      <div className="font-medium text-gray-900">
                        {plan.progress}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">План дохода</div>
                      <div className="font-medium text-green-600">
                        {formatCurrency(plan.expectedRevenue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Текущий доход</div>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(plan.currentRevenue)}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${plan.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                      Подробнее
                    </button>
                    <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                      Редактировать
                    </button>
                    {plan.status === 'active' && (
                      <button className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors">
                        Приостановить
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Plan Button */}
        <div className="fixed bottom-20 right-4">
          <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>
    </div>
  );
};

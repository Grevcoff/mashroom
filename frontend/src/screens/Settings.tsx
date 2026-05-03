import React, { useEffect, useState } from 'react';

// Простая версия Settings без строгой типизации
export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        
        // Временные моковые данные
        const mockSettings = {
          profile: {
            name: 'Грибной фермер',
            email: 'farmer@mushroom.com',
            phone: '+7 (999) 123-45-67',
            avatar: '🍄'
          },
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            planReminders: true,
            weeklyReports: false
          },
          business: {
            businessName: 'Моя Грибная Ферма',
            currency: 'RUB',
            timezone: 'Europe/Moscow',
            language: 'ru'
          },
          appearance: {
            theme: 'light',
            compactMode: false,
            showCharts: true
          }
        };

        // Имитация загрузки
        setTimeout(() => {
          setSettings(mockSettings);
          setLoading(false);
        }, 1000);

      } catch (err) {
        setError('Не удалось загрузить настройки');
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Имитация сохранения
      setTimeout(() => {
        setSaving(false);
        alert('Настройки сохранены!');
      }, 1000);

    } catch (err) {
      setSaving(false);
      alert('Ошибка сохранения настроек');
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-2xl mb-4">⚙️</div>
        <div className="text-lg">Загрузка настроек...</div>
      </div>
    );
  }

  if (error || !settings) {
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
            ⚙️ Настройки
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Управление вашим профилем и приложением
          </p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              👤 Профиль
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl mr-4">
                {settings.profile.avatar}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {settings.profile.name}
                </div>
                <div className="text-sm text-gray-500">
                  {settings.profile.email}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                value={settings.profile.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={settings.profile.phone}
                onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              🏢 Бизнес
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название бизнеса
              </label>
              <input
                type="text"
                value={settings.business.businessName}
                onChange={(e) => handleSettingChange('business', 'businessName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Валюта
              </label>
              <select
                value={settings.business.currency}
                onChange={(e) => handleSettingChange('business', 'currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RUB">Российский рубль (₽)</option>
                <option value="USD">Доллар США ($)</option>
                <option value="EUR">Евро (€)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Часовой пояс
              </label>
              <select
                value={settings.business.timezone}
                onChange={(e) => handleSettingChange('business', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Europe/Moscow">Москва (GMT+3)</option>
                <option value="Europe/Kiev">Киев (GMT+2)</option>
                <option value="Europe/Minsk">Минск (GMT+3)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              🔔 Уведомления
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Email уведомления
                </div>
                <div className="text-sm text-gray-500">
                  Получать уведомления по email
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Push уведомления
                </div>
                <div className="text-sm text-gray-500">
                  Push уведомления в приложении
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.pushNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Напоминания о планах
                </div>
                <div className="text-sm text-gray-500">
                  Напоминать о важных сроках
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', 'planReminders', !settings.notifications.planReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.planReminders ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.planReminders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Еженедельные отчеты
                </div>
                <div className="text-sm text-gray-500">
                  Получать еженедельную статистику
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('notifications', 'weeklyReports', !settings.notifications.weeklyReports)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications.weeklyReports ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              🎨 Внешний вид
            </h2>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Тема
              </label>
              <select
                value={settings.appearance.theme}
                onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">Светлая</option>
                <option value="dark">Темная</option>
                <option value="auto">Автоматически</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Компактный режим
                </div>
                <div className="text-sm text-gray-500">
                  Более компактный интерфейс
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('appearance', 'compactMode', !settings.appearance.compactMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.appearance.compactMode ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.appearance.compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">
                  Показывать графики
                </div>
                <div className="text-sm text-gray-500">
                  Отображать графики в дашборде
                </div>
              </div>
              <button
                onClick={() => handleSettingChange('appearance', 'showCharts', !settings.appearance.showCharts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.appearance.showCharts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.appearance.showCharts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
          
          <button
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Сбросить настройки
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            ⚠️ Опасная зона
          </h3>
          <p className="text-sm text-red-700 mb-4">
            Эти действия необратимы. Будьте осторожны.
          </p>
          <div className="space-y-2">
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Удалить аккаунт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

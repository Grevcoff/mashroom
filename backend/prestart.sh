#!/bin/bash

# Pre-start script для применения миграций перед запуском
# Используется в продакшене для автоматического применения миграций

set -e

echo "🚀 Pre-start script для Mushroom Mini App"

# Проверяем переменные окружения
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL не установлен"
    exit 1
fi

echo "📊 Database URL: ${DATABASE_URL:0:20}..."

# Применяем миграции
echo "🔄 Применение миграций Alembic..."
python migrate.py upgrade head

if [ $? -eq 0 ]; then
    echo "✅ Миграции успешно применены"
else
    echo "❌ Ошибка применения миграций"
    exit 1
fi

# Опционально: создаем тестовые данные для development
if [ "$DEBUG" = "true" ]; then
    echo "🌱 Создание тестовых данных (development mode)..."
    python seed.py
fi

echo "🎉 Pre-start завершен, запуск приложения..."

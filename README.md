# 🍄 Mushroom Mini App

Telegram Mini App для учета домашнего грибоводства с аналитикой и статистикой.

## 📋 Обзор

Приложение помогает вести учет расходов и доходов при выращивании грибов в домашних условиях. Включает в себя:
- Управление планами выращивания
- Учет расходов по категориям
- Аналитику и расчет прибыли
- Экспорт данных в CSV
- Адаптивный интерфейс под Telegram
- **Поддержка SQLite (локально) и PostgreSQL (продакшен)**

## 🛠 Технологический стек

### Backend (FastAPI)
- **Python 3.10+**
- **FastAPI** - веб-фреймворк
- **SQLAlchemy 2.0** - ORM
- **aiosqlite** - асинхронный драйвер SQLite (локально)
- **asyncpg** - асинхронный драйвер PostgreSQL (продакшен)
- **Pydantic** - валидация данных
- **Telegram WebApp Auth** - аутентификация через Telegram

### Frontend (React + TypeScript)
- **React 18** + **TypeScript** - основной стек
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **Zustand** - управление состоянием
- **React Router** - навигация
- **Recharts** - графики
- **@twa-dev/sdk** - Telegram WebApp SDK

## 📁 Структура проекта

```
tgmushroom/
├── backend/                 # FastAPI сервер
│   ├── main.py             # Основной файл приложения
│   ├── database.py         # Модели SQLAlchemy
│   ├── auth.py             # Аутентификация Telegram
│   ├── crud.py             # CRUD операции
│   ├── requirements.txt    # Зависимости Python
│   ├── Dockerfile          # Docker образ
│   └── docker-compose.yml  # Docker-compose конфиг
├── frontend/               # React приложение
│   ├── src/
│   │   ├── components/     # UI компоненты
│   │   ├── screens/        # Экраны приложения
│   │   ├── store/          # Zustand store
│   │   ├── api/            # API клиент
│   │   ├── utils/          # Утилиты
│   │   └── types/          # TypeScript типы
│   ├── package.json        # Зависимости Node.js
│   ├── vite.config.ts      # Конфигурация Vite
│   └── tailwind.config.js  # Конфигурация Tailwind
└── README.md               # Этот файл
```

## 🚀 Быстрый старт

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd tgmushroom
```

### 2. Настройка Backend

#### Локальная разработка (SQLite)

```bash
cd backend

# Создание виртуального окружения
python -m venv venv

# Активация (Windows)
venv\Scripts\activate

# Активация (Linux/Mac)
source venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Создание .env файла
cp .env.example .env

# Настройка переменных окружения
# Откройте .env и добавьте TELEGRAM_BOT_TOKEN
# DATABASE_URL оставьте как есть для SQLite

# Быстрая настройка БД (рекомендуется)
python setup_database.py full-dev

# Или по шагам:
# Инициализация миграций Alembic
python migrate.py init

# Создание первой миграции
python migrate.py create "initial migration"

# Применение миграций
python migrate.py upgrade
```

#### Продакшен (PostgreSQL)

```bash
# Для разработки с PostgreSQL локально
docker-compose up -d postgres

# Или настройте DATABASE_URL в .env:
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 3. Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Создание .env файла
cp .env.example .env

# Настройка переменных окружения
# Откройте .env и установите правильный API URL
```

### 4. Запуск приложения

#### Запуск Backend

```bash
cd backend
python main.py
```

Сервер будет доступен по адресу: http://localhost:8000

#### Запуск Frontend

```bash
cd frontend
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### 5. Настройка Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен бота
3. Добавьте токен в `.env` файл: `TELEGRAM_BOT_TOKEN=your_token_here`
4. Настройте Mini App в [@BotFather] командой `/setapp`

## 🐳 Docker развертывание

### 1. Полный стек (Frontend + Backend + PostgreSQL)

```bash
# В корневой директории
docker-compose up -d
```

Запустятся:
- **Frontend** на http://localhost:3000
- **Backend API** на http://localhost:8000
- **PostgreSQL** на localhost:5432
- **Данные сохранятся** в volume `postgres_data`

### 2. Только Backend + PostgreSQL

```bash
# В backend директории
docker-compose up -d
```

### 3. Остановка

```bash
docker-compose down
# С удалением данных
docker-compose down -v
```

### 4. Создание тестовых данных

```bash
# В контейнере backend
docker-compose exec backend python seed.py

# Очистка данных
docker-compose exec backend python seed.py --clear
```

### 5. Health Checks

```bash
# Проверка статуса сервисов
docker-compose ps

# Логи
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📱 Использование в Telegram

1. Откройте бота в Telegram
2. Нажмите на кнопку Mini App
3. Приложение откроется с адаптацией под тему Telegram

## 🔧 API документация

После запуска backend доступна Swagger документация:
- http://localhost:8000/docs

### Основные эндпоинты

- `GET /api/plans` - получение планов
- `POST /api/plans` - создание плана
- `GET /api/categories` - получение категорий
- `POST /api/transactions` - создание транзакции
- `GET /api/stats` - получение статистики

## 🗄 База данных и миграции

### Поддерживаемые БД
- **SQLite** - для локальной разработки
- **PostgreSQL** - для продакшена

### Схема

```sql
users          -- Пользователи Telegram
plans          -- Планы выращивания
categories     -- Категории расходов/доходов
transactions   -- Транзакции
```

### Модели

- **User**: id, tg_user_id, created_at
- **Plan**: id, user_id, name, status, start_date, end_date, revenue, yield_kg
- **Category**: id, user_id, name, type
- **Transaction**: id, plan_id, category_id, amount, type, comment, date

### Управление миграциями (Alembic)

#### Основные команды
```bash
# Инициализация Alembic (один раз)
python migrate.py init

# Создание новой миграции
python migrate.py create "add new field to users"

# Применение миграций
python migrate.py upgrade

# Откат миграций
python migrate.py downgrade -1

# История миграций
python migrate.py history

# Текущая ревизия
python migrate.py current
```

#### В разработке
- Таблицы создаются автоматически при `DEBUG=true`
- Для изменения структуры используйте миграции

#### В продакшене
- Используйте только миграции: `python migrate.py upgrade head`
- Никогда не используйте автоматическое создание таблиц

## 🎨 Особенности UI/UX

### Адаптация под Telegram
- Автоматическое определение темы (темная/светлая)
- Использование цветов Telegram
- Интеграция с MainButton и BackButton
- Тактильная отдача (haptic feedback)

### Интерфейс
- TabBar навигация внизу
- Карточки для планов и транзакций
- Графики и аналитика
- Формы с валидацией
- Pull-to-refresh и свайпы

## 📊 Функциональность

### Управление планами
- Создание планов выращивания
- Отслеживание статуса (активный/завершенный)
- Добавление дохода и веса урожая

### Учет транзакций
- Добавление расходов по категориям
- Автодополнение категорий
- Форматирование сумм
- Комментарии к транзакциям

### Аналитика
- График расходов по категориям
- Динамика доходов и расходов
- Расчет ROI и прибыли
- Себестоимость кг продукции

### Экспорт данных
- Выгрузка в CSV
- Фильтрация по периодам
- Детальная статистика

## 🔒 Безопасность

- Валидация Telegram WebApp initData
- HMAC-SHA256 подпись
- Фильтрация по user_id
- Нет хранения паролей

## 🚀 Развертывание в продакшене

### Backend (Render с PostgreSQL)

1. **Подготовка GitHub**
   ```bash
   git add .
   git commit -m "feat: Add PostgreSQL support"
   git push
   ```

2. **Создание PostgreSQL на Render**
   - Зайдите в Render Dashboard
   - "New" → "PostgreSQL"
   - Имя: `mushroom-db`
   - Plan: Free (включено 90 дней)
   - Сохраните credentials

3. **Создание Web Service**
   - "New" → "Web Service"
   - Connect GitHub репозиторий
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:**
     ```
     TELEGRAM_BOT_TOKEN=your_token
     DATABASE_URL=postgresql://user:password@host:5432/dbname
     CORS_ORIGINS=https://your-app.vercel.app
     DEBUG=false
     ```

### Frontend (Vercel)

1. **Создание проекта**
   - Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
   - `Add New` → `Project`
   - Выберите GitHub репозиторий
   - Root Directory: `frontend`

2. **Environment Variables**
   ```
   VITE_API_URL=https://your-app-name.onrender.com/api
   ```

3. **Автоматический деплой**
   - Каждый push в main ветку
   - Автоматическое обновление

4. **Локальная разработка**
   ```bash
   cd frontend
   cp .env.example .env
   # Отредактируйте .env для локального API
   npm install
   npm run dev
   ```

### Railway (альтернатива Render)

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин
railway login

# Создание проекта
railway new mushroom-app

# Добавление PostgreSQL
railway add postgresql

# Деплой
railway up
```

## 🐛 Отладка

### Локальная разработка

Для тестирования вне Telegram:
```bash
# Frontend
npm run dev

# Backend
python main.py
```

### Проверка API

```bash
# Health check
curl http://localhost:8000/api/health

# Получение планов
curl -H "Authorization: tma <init_data>" \
     http://localhost:8000/api/plans
```

## 📝 TODO

- [ ] Резервное копирование данных
- [ ] Синхронизация между устройствами
- [ ] Push-уведомления
- [ ] Расширенная аналитика
- [ ] Мультиязычность

## 🤝 Вклад

1. Fork проекта
2. Создайте ветку `feature/your-feature`
3. Сделайте коммиты
4. Отправьте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Если возникли вопросы или проблемы:
- Создайте Issue в GitHub
- Напишите в Telegram: @username

---

**Создано с ❤️ для грибоводов** 🍄

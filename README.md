# 🍄 Mushroom Mini App

Telegram Mini App для учета домашнего грибоводства с аналитикой и статистикой.

## 📋 Обзор

Приложение помогает вести учет расходов и доходов при выращивании грибов в домашних условиях. Включает в себя:
- Управление планами выращивания
- Учет расходов по категориям
- Аналитику и расчет прибыли
- Экспорт данных в CSV
- Адаптивный интерфейс под Telegram

## 🛠 Технологический стек

### Backend (FastAPI)
- **Python 3.10+**
- **FastAPI** - веб-фреймворк
- **SQLAlchemy 2.0** - ORM
- **aiosqlite** - асинхронный драйвер SQLite
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
```

### 3. Настройка Frontend

```bash
cd frontend

# Установка зависимостей
npm install

# Создание .env файла
echo "VITE_API_URL=http://localhost:8000/api" > .env
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

### 1. Сборка и запуск

```bash
# В корневой директории
docker-compose up -d
```

### 2. Остановка

```bash
docker-compose down
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

## 🗄 База данных

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

## 🚀 Развертывание

### Backend (Render)
1. Загрузите код на GitHub
2. Создайте сервис на Render
3. Настройте переменные окружения
4. Подключите базу данных PostgreSQL

### Frontend (Vercel)
1. Загрузите код на GitHub
2. Создайте проект на Vercel
3. Настройте переменные окружения
4. Автоматический деплой

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

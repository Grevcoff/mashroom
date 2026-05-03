# 🚀 Продакшен развертывание Mushroom Mini App

## 📋 Обзор

Полное руководство по развертыванию Telegram Mini App на современных облачных платформах:
- **Render** - Backend API + PostgreSQL
- **Supabase** - Альтернативная PostgreSQL база данных  
- **Vercel** - Frontend хостинг
- **GitHub Actions** - CI/CD автоматизация

## 🏗️ Архитектура продакшена

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │    Render       │    │   Supabase      │
│                 │    │                 │    │                 │
│  Frontend       │◄──►│  Backend API    │◄──►│  PostgreSQL     │
│  (React/Vite)   │    │  (FastAPI)      │    │  (Database)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Подготовка к деплою

### 1. Переменные окружения

#### **Backend (.env)**
```bash
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Database (Render PostgreSQL - автоматически)
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Database (Supabase Pooler URL - альтернатива)
# DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require

# CORS origins (через запятую)
CORS_ORIGINS=https://mushroom-app.vercel.app,https://localhost:3000

# Production settings
DEBUG=false
ENVIRONMENT=production
PORT=8000
```

#### **Frontend (.env)**
```bash
# API URL (Render)
VITE_API_URL=https://mushroom-api.onrender.com/api
```

### 2. Секреты для GitHub

В GitHub Repository Settings → Secrets and variables → Actions:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id  
VERCEL_PROJECT_ID=your_vercel_project_id
GITHUB_TOKEN=auto_generated
```

## 🗄️ Supabase настройка

### 1. Создание проекта

1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. "New Project" → выберите организацию
3. Настройте проект:
   - Database Name: `mushroom`
   - Password: создайте надежный пароль
   - Region: выберите ближайший регион

### 2. Получение URL

После создания проекта найдите:
- **Project URL**: `https://[project-ref].supabase.co`
- **Database Password**: из настроек проекта
- **Pooler URL**: в Settings → Database → Connection string → Pooler

### 3. Применение миграций

```bash
# Установка Supabase CLI
npm install -g supabase

# Логин
supabase login

# Подключение к проекту
supabase link --project-ref [project-ref]

# Применение миграций
supabase db push
```

## 🚀 Render развертывание

### 1. Через Web Interface

1. Зайдите в [Render Dashboard](https://dashboard.render.com)
2. "New" → "Web Service"
3. Connect GitHub репозиторий
4. Настройте:
   - Name: `mushroom-api`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `bash prestart.sh && uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2. Через render.yaml

```bash
# Автоматический деплой через render.yaml
# Файл уже настроен в backend/render.yaml
# Render автоматически применит конфигурацию
```

### 3. Environment Variables в Render

```bash
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# CORS origins
CORS_ORIGINS=https://mushroom-app.vercel.app,https://localhost:3000

# Production settings
DEBUG=false
ENVIRONMENT=production
```

### 4. PostgreSQL на Render

1. **Создание БД**:
   - "New" → "PostgreSQL"
   - Name: `mushroom-db`
   - Database Name: `mushroom`
   - User: `mushroom_user`

2. **Автоматическое подключение**:
   - Render автоматически создаст `DATABASE_URL`
   - База данных будет связана с веб-сервисом

## 🌐 Vercel развертывание

### 1. Через Web Interface

1. Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
2. "Add New" → "Project"
3. Выберите GitHub репозиторий
4. Настройте:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2. Environment Variables

```bash
VITE_API_URL=https://mushroom-api.onrender.com/api
```

### 3. Custom Domain (опционально)

1. В настройках проекта → "Domains"
2. Добавьте свой домен: `mushroom.yourdomain.com`
3. Настройте DNS в вашем доменном регистраторе

## 🔄 GitHub Actions CI/CD

### Автоматический деплой

При пуше в `main` ветку:

1. **Тестирование**: проверка кода и миграций
2. **Сборка Docker образа**: создание оптимизированного образа
3. **Деплой Backend**: автоматический деплой на Render
4. **Деплой Frontend**: автоматический деплой на Vercel

### Мониторинг

```bash
# Проверка статуса workflow
gh workflow list

# Просмотр логов
gh workflow view deploy

# Запуск вручную
gh workflow run deploy
```

## 🔒 Безопасность в продакшене

### 1. Rate Limiting

```python
# Health endpoint ограничен 100 запросов в минуту
@app.get("/api/health")
@limiter.limit("100/minute")
async def health_check(request: Request):
    pass
```

### 2. JSON Логи

В продакшене логи автоматически форматируются в JSON:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "logger": "main",
  "message": "API request processed",
  "module": "main",
  "function": "get_plans",
  "line": 245
}
```

### 3. Graceful Shutdown

Приложение корректно обрабатывает сигналы `SIGINT` и `SIGTERM`.

## 📊 Мониторинг и логи

### 1. Render Logs

```bash
# Просмотр логов в Render Dashboard
# https://dashboard.render.com/logs

# Просмотр логов конкретного деплоя
# В веб-интерфейсе Render
```

### 2. Vercel Logs

```bash
# Просмотр логов функции
vercel logs [function-url]

# Просмотр логов сборки
vercel logs [build-id]
```

### 3. Supabase Logs

```bash
# Просмотр логов базы данных
supabase logs db

# Просмотр логов функций
supabase logs functions
```

## 🧪 Тестирование продакшена

### 1. Health Checks

```bash
# Backend health
curl https://mushroom-api.onrender.com/api/health

# Frontend доступность
curl https://mushroom-app.vercel.app

# Database подключение
curl -H "Authorization: tma test_data" \
     https://mushroom-api.onrender.com/api/plans
```

### 2. Telegram Mini App

1. Настройте Mini App в @BotFather:
   - URL: `https://mushroom-app.vercel.app`
2. Откройте бота в Telegram
3. Проверьте функциональность

## 🚨 Troubleshooting

### Проблема: CORS ошибки

**Решение:**
```bash
# Проверьте CORS_ORIGINS в Render
echo $CORS_ORIGINS

# Убедитесь что домен добавлен в Vercel
vercel domains add mushroom-app.vercel.app
```

### Проблема: База данных не подключается

**Решение:**
```bash
# Проверьте DATABASE_URL
echo $DATABASE_URL

# Проверьте SSL соединение
psql "postgresql://postgres:password@db.project-ref.supabase.co:5432/postgres?sslmode=require"

# Примените миграции
# Render автоматически применит через prestart.sh
# Или вручную через Render Shell
```

### Проблема: Фронтенд не подключается к API

**Решение:**
```bash
# Проверьте VITE_API_URL
echo $VITE_API_URL

# Проверьте проксирование в Vercel
curl https://mushroom-app.vercel.app/api/health
```

### Проблема: Telegram не загружается

**Решение:**
```bash
# Проверьте HTTPS
curl -I https://mushroom-app.vercel.app

# Проверьте Mini App URL в @BotFather
# URL должен быть HTTPS и доступен
```

## 📈 Масштабирование

### 1. Render Scaling

```yaml
# В render.yaml
services:
  - type: web
    plan: starter  # $7/месяц для автоматического масштабирования
    # или pro для большей производительности
```

### 2. Supabase Scaling

- **Free Tier**: 500MB БД, 2GB bandwidth
- **Pro Tier**: 8GB БД, 250GB bandwidth
- Автоматическое масштабирование подключений

### 3. Vercel Scaling

- **Hobby**: 100GB bandwidth
- **Pro**: 200GB bandwidth  
- **Enterprise**: неограниченно

## 💰 Стоимость продакшена

### Бесплатные тарифы (месяц):
- **Render**: $0 (free tier - 750 часов)
- **Supabase**: $0 (free tier)
- **Vercel**: $0 (hobby tier)
- **GitHub Actions**: 2000 минут бесплатно

**Итого**: $0/месяц (бесплатно!)

### Платные тарифы (при росте):
- **Render Starter**: $7/месяц
- **Render Pro**: $25/месяц
- **Supabase Pro**: $25/месяц  
- **Vercel Pro**: $20/месяц

## 🔄 Обновление продакшена

### 1. Backend обновление

```bash
# Пуш в main ветку
git push origin main

# Автоматический деплой через GitHub Actions
# Render автоматически деплоится при пуше
# Или ручной триггер через Render Dashboard
```

### 2. Frontend обновление

```bash
# Пуш в main ветку
git push origin main

# Автоматический деплой через Vercel
# или ручной деплой:
vercel --prod
```

### 3. Database обновление

```bash
# Создание миграции
python migrate.py create "add new feature"

# Применение в продакшене
# Render автоматически применит через prestart.sh
# Или через Render Shell в веб-интерфейсе
```

## 📞 Поддержка

### Мониторинг

1. **Uptime**: Используйте UptimeRobot для мониторинга API
2. **Errors**: Sentry для отслеживания ошибок
3. **Performance**: Vercel Analytics для фронтенда

### Резервное копирование

```bash
# Supabase бэкапы автоматические
# Дополнительно:
supabase db dump --data-only > backup.sql
```

---

**Готово к продакшену! 🚀**

Проект полностью настроен для надежной работы в продакшенной среде с автоматическим масштабированием и мониторингом.

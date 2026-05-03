# 🚀 Деплоймент Mushroom Mini App

## 📋 Варианты развертывания

### 1. **Render + Vercel (Рекомендуется)**
- ✅ Бесплатный тариф
- ✅ Автоматический деплой
- ✅ PostgreSQL включен
- ✅ Легко настроить

### 2. **Railway**
- ✅ Бесплатный тариф
- ✅ Все в одном месте
- ✅ PostgreSQL встроен
- ✅ CLI для управления

### 3. **DigitalOcean App Platform**
- ✅ Профессиональный хостинг
- ✅ Высокая доступность
- ✅ Масштабирование
- ❌ Платный

---

## 🎯 Render + Vercel развертывание

### Шаг 1: Подготовка репозитория

```bash
# Добавляем изменения в Git
git add .
git commit -m "feat: Add PostgreSQL and deployment configs"
git push origin main
```

### Шаг 2: Backend на Render

1. **Создание PostgreSQL**
   - Зайдите в [Render Dashboard](https://dashboard.render.com)
   - `New` → `PostgreSQL`
   - Имя: `mushroom-db`
   - Database Name: `mushroom_db`
   - User: `mushroom_user`
   - Plan: Free
   - Нажмите `Create Database`

2. **Копирование credentials**
   После создания базы данных скопируйте **External Database URL**:
   ```
   postgresql://mushroom_user:password@host:5432/mushroom_db
   ```

3. **Создание Web Service**
   - `New` → `Web Service`
   - Connect GitHub репозиторий
   - Name: `mushroom-api`
   - Root Directory: `backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

4. **Environment Variables**
   ```
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   DATABASE_URL=postgresql://mushroom_user:password@host:5432/mushroom_db
   CORS_ORIGINS=https://your-app.vercel.app
   DEBUG=false
   ```

5. **Нажмите `Create Web Service`**

### Шаг 3: Frontend на Vercel

1. **Создание проекта**
   - Зайдите в [Vercel Dashboard](https://vercel.com/dashboard)
   - `Add New` → `Project`
   - Выберите GitHub репозиторий
   - Root Directory: `frontend`

2. **Environment Variables**
   ```
   VITE_API_URL=https://mushroom-api.onrender.com/api
   ```

3. **Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Нажмите `Deploy`**

---

## 🐳 Railway развертывание

### Установка и настройка

```bash
# Установка Railway CLI
npm install -g @railway/cli

# Логин в Railway
railway login

# Создание нового проекта
railway new mushroom-app

# Переход в директорию проекта
cd tgmushroom

# Добавление PostgreSQL
railway add postgresql

# Настройка переменных окружения
railway variables set TELEGRAM_BOT_TOKEN=your_token
railway variables set CORS_ORIGINS=https://your-app.vercel.app
railway variables set DEBUG=false

# Деплой
railway up
```

### Получение URL

После деплоя:
```bash
railway status
# Скопируйте URL вашего приложения
```

---

## 🔧 Environment Variables

### Backend Variables
```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
DATABASE_URL=postgresql://user:password@host:5432/dbname
CORS_ORIGINS=https://your-app.vercel.app
DEBUG=false
```

### Frontend Variables
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```

---

## 📱 Настройка Telegram Mini App

### 1. Создание бота
1. Найдите [@BotFather](https://t.me/BotFather)
2. `/newbot` → имя бота → username
3. Сохраните токен

### 2. Настройка Mini App
1. `/setapp` → выберите бота
2. Вставьте URL: `https://your-app.vercel.app`
3. Название: `Mushroom Tracker`
4. Описание: `Учет грибоводства`

---

## 🧪 Тестирование деплоя

### 1. Проверка API
```bash
# Health check
curl https://your-api.onrender.com/api/health

# Проверка планов
curl -H "Authorization: tma test_data" \
     https://your-api.onrender.com/api/plans
```

### 2. Проверка Frontend
- Откройте https://your-app.vercel.app
- Проверьте загрузку приложения
- Проверьте подключение к API

### 3. Тестирование в Telegram
- Откройте бота
- Нажмите на Mini App кнопку
- Проверьте функциональность

---

## 🔍 Troubleshooting

### Проблема: CORS ошибки
**Решение:**
```bash
# Убедитесь что CORS_ORIGINS содержит правильный URL
CORS_ORIGINS=https://your-app.vercel.app
```

### Проблема: База данных не подключается
**Решение:**
```bash
# Проверьте DATABASE_URL
# Убедитесь что база данных создана и доступна
# Проверьте логи в Render/Railway
```

### Проблема: Telegram не загружается
**Решение:**
```bash
# Проверьте что URL в настройках бота правильный
# Убедитесь что HTTPS работает
# Проверьте логи в браузере
```

### Проблема: Фронтенд не подключается к API
**Решение:**
```bash
# Проверьте VITE_API_URL
# Убедитесь что API работает
# Проверьте CORS настройки
```

---

## 📊 Мониторинг

### Render
- Автоматические health checks
- Логи в dashboard
- Метрики производительности

### Vercel
- Analytics dashboard
- Build logs
- Performance metrics

### Railway
- Railway logs
- Metrics dashboard
- Status page

---

## 💰 Стоимость

### Бесплатные тарифы
- **Render**: $0/мес (750 часов/мес)
- **Vercel**: $0/мес (100GB bandwidth)
- **Railway**: $0/мес (500 часов/мес)

### Ограничения бесплатных тарифов
- Render: спит после 15 минут бездействия
- Vercel: ограничение на bandwidth
- Railway: ограничение на время работы

---

## 🔄 CI/CD

### GitHub Actions (опционально)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python -m pytest
```

---

## 📝 Чек-лист перед деплоем

- [ ] Telegram бот создан и токен получен
- [ ] Репозиторий загружен на GitHub
- [ ] Environment variables настроены
- [ ] PostgreSQL база данных создана
- [ ] API развернут и работает
- [ ] Frontend развернут и подключен
- [ ] Mini App настроен в Telegram
- [ ] Тестирование пройдено успешно

---

## 🆘 Поддержка

Если возникли проблемы:
1. Проверьте логи развертывания
2. Убедитесь что все environment variables правильные
3. Проверьте connectivity между frontend и backend
4. Создайте Issue в GitHub репозитории

---

**Готово к продакшену! 🚀**

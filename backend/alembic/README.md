# 🗄️ Alembic Миграции Базы Данных

## 📋 Обзор

Alembic используется для управления миграциями базы данных в Mushroom Mini App. Это обеспечивает:
- **Версионирование схемы БД**
- **Безопасные изменения структуры**
- **Откат изменений**
- **Работа с разными БД (SQLite/PostgreSQL)**

## 🚀 Быстрый старт

### Первоначальная настройка

```bash
# 1. Установка Alembic (уже в requirements.txt)
pip install alembic

# 2. Инициализация Alembic
python migrate.py init

# 3. Создание первой миграции
python migrate.py create "initial migration"

# 4. Применение миграций
python migrate.py upgrade
```

## 📝 Ежедневная работа

### Изменение моделей

1. **Измените модели в `database.py`**
2. **Создайте миграцию:**
   ```bash
   python migrate.py create "add new field to plans"
   ```
3. **Примените миграцию:**
   ```bash
   python migrate.py upgrade
   ```

### Примеры изменений

#### Добавление нового поля
```python
# В database.py
class Plan(Base):
    # ... существующие поля
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
```

#### Изменение типа поля
```python
# В database.py
class Transaction(Base):
    # Было:
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    # Стало:
    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
```

#### Добавление новой таблицы
```python
# В database.py
class Note(Base):
    __tablename__ = "notes"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
```

## 🔧 Команды управления

### Создание миграций
```bash
# Автоматическая генерация
python migrate.py create "migration message"

# Ручная миграция (если autogenerate не работает)
# Отредактируйте файл в alembic/versions/
```

### Применение миграций
```bash
# До последней версии
python migrate.py upgrade

# До конкретной версии
python migrate.py upgrade 1234abcd5678

# На одну версию вперед
python migrate.py upgrade +1
```

### Откат миграций
```bash
# На одну версию назад
python migrate.py downgrade -1

# До конкретной версии
python migrate.py downgrade 1234abcd5678

# До базы (откат всех)
python migrate.py downgrade base
```

### Информация о миграциях
```bash
# История всех миграций
python migrate.py history

# Текущая версия
python migrate.py current

# Сравнение версий
alembic diff head
```

## 🐳 Docker и миграции

### В Docker Compose
```yaml
services:
  api:
    build: .
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/mushroom_db
    depends_on:
      postgres:
        condition: service_healthy
  postgres:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Применение миграций в Docker
```bash
# Запуск с миграциями
docker-compose up -d

# Применение миграций вручную
docker-compose exec api python migrate.py upgrade
```

## 🌍 Разные окружения

### Локальная разработка (SQLite)
```bash
# .env
DEBUG=true
DATABASE_URL=sqlite+aiosqlite:///mushroom_app.db

# Таблицы создаются автоматически
# Миграции для изменений структуры
```

### Продакшен (PostgreSQL)
```bash
# .env
DEBUG=false
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Только миграции!
python migrate.py upgrade head
```

## ⚠️ Важные правила

### ✅ Что делать
- Всегда создавайте миграцию перед изменением моделей
- Проверяйте сгенерированные миграции
- Используйте понятные сообщения
- Тестируйте миграции на тестовой БД

### ❌ Чего не делать
- Не изменяйте БД напрямую в продакшене
- Не используйте `Base.metadata.create_all()` в продакшене
- Не удаляйте миграционные файлы
- Не изменяйте уже примененные миграции

## 🔍 Отладка миграций

### Проверка сгенерированной миграции
```bash
# Показать SQL без выполнения
alembic upgrade head --sql

# Сравнение моделей с БД
alembic check
```

### Проблемы и решения

#### Autogenerate не работает
```bash
# Ручное создание миграции
python migrate.py create "manual migration"
# Отредактируйте файл в alembic/versions/
```

#### Ошибка в миграции
```bash
# Откатите проблемную миграцию
python migrate.py downgrade -1

# Исправьте миграцию
# Примените снова
python migrate.py upgrade
```

#### Конфликт в продакшене
```bash
# Показать различия
alembic diff head

# Создать миграцию вручную
python migrate.py create "fix production schema"
```

## 📁 Структура файлов

```
backend/
├── alembic/
│   ├── versions/          # Файлы миграций
│   ├── env.py            # Конфигурация Alembic
│   ├── script.py.mako    # Шаблон миграций
│   └── README.md          # Этот файл
├── alembic.ini           # Конфигурация (в .gitignore)
├── database.py           # Модели SQLAlchemy
└── migrate.py            # Скрипт управления
```

## 🔄 CI/CD интеграция

### GitHub Actions
```yaml
- name: Run database migrations
  run: |
    cd backend
    python migrate.py upgrade head
```

### Render
```yaml
# Build Command
pip install -r requirements.txt && python migrate.py upgrade head
```

## 📚 Дополнительные ресурсы

- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [SQLAlchemy 2.0](https://docs.sqlalchemy.org/)
- [PostgreSQL vs SQLite](https://www.postgresql.org/about/)

---

**Помните: миграции - это история изменений вашей БД!** 🗄️

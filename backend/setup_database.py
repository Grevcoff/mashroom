"""
Скрипт для настройки и инициализации базы данных
"""

import os
import sys
import asyncio
from pathlib import Path

# Добавляем текущую директорию в Python path
sys.path.append(str(Path(__file__).parent))

from database import init_db
from dotenv import load_dotenv

async def setup_development():
    """Настройка БД для разработки"""
    print("🔧 Настройка БД для разработки (SQLite)...")
    
    # Загружаем .env
    load_dotenv()
    
    # Проверяем настройки
    database_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///mushroom_app.db")
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"📊 Database URL: {database_url}")
    print(f"🐛 Debug mode: {debug}")
    
    # Инициализация с созданием таблиц
    await init_db(create_tables=True)
    
    print("✅ БД для разработки готова!")
    print("📁 Файл БД: mushroom_app.db")
    print("🚀 Запускайте: python main.py")

async def setup_production():
    """Настройка БД для продакшена"""
    print("🏗️ Настройка БД для продакшена (PostgreSQL)...")
    
    # Загружаем .env
    load_dotenv()
    
    # Проверяем настройки
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("❌ DATABASE_URL не найден в .env")
        return False
    
    if not database_url.startswith("postgresql"):
        print("❌ Для продакшена нужна PostgreSQL база данных")
        return False
    
    print(f"📊 Database URL: {database_url}")
    
    # Инициализация без создания таблиц (миграции)
    await init_db(create_tables=False)
    
    print("✅ Подключение к БД настроено!")
    print("🔄 Теперь примените миграции:")
    print("   python migrate.py upgrade")
    
    return True

async def create_sample_data():
    """Создание тестовых данных"""
    print("📝 Создание тестовых данных...")
    
    from database import get_session
    from database import User, Category, Plan, Transaction
    from datetime import datetime
    
    async with get_session() as session:
        # Проверяем есть ли данные
        result = await session.execute("SELECT COUNT(*) FROM users")
        user_count = result.scalar()
        
        if user_count > 0:
            print("📊 База данных уже содержит данные")
            return
        
        # Создаем тестового пользователя
        user = User(tg_user_id=123456789)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        print(f"👤 Создан пользователь: {user.id}")
        
        # Создаем категории
        categories = [
            Category(user_id=user.id, name="Субстрат", type="expense"),
            Category(user_id=user.id, name="Мицелий", type="expense"),
            Category(user_id=user.id, name="Электричество", type="expense"),
            Category(user_id=user.id, name="Продажа грибов", type="income"),
        ]
        
        for category in categories:
            session.add(category)
        
        await session.commit()
        print(f"📁 Создано категорий: {len(categories)}")
        
        # Создаем план
        plan = Plan(
            user_id=user.id,
            name="Тестовый план выращивания",
            status="active"
        )
        session.add(plan)
        await session.commit()
        await session.refresh(plan)
        
        print(f"📦 Создан план: {plan.id}")
        
        # Создаем транзакции
        transactions = [
            Transaction(
                plan_id=plan.id,
                category_id=categories[0].id,  # Субстрат
                amount=1500.0,
                type="expense",
                date=datetime.utcnow(),
                comment="Покупка субстрата"
            ),
            Transaction(
                plan_id=plan.id,
                category_id=categories[1].id,  # Мицелий
                amount=800.0,
                type="expense",
                date=datetime.utcnow(),
                comment="Мицелий шампиньонов"
            ),
            Transaction(
                plan_id=plan.id,
                category_id=categories[3].id,  # Продажа
                amount=5000.0,
                type="income",
                date=datetime.utcnow(),
                comment="Продажа первого урожая"
            ),
        ]
        
        for transaction in transactions:
            session.add(transaction)
        
        await session.commit()
        print(f"💰 Создано транзакций: {len(transactions)}")
        
        print("✅ Тестовые данные созданы!")
        print("👤 Telegram ID: 123456789")
        print("📊 Проверьте API: http://localhost:8000/api/plans")

async def main():
    """Главная функция"""
    if len(sys.argv) < 2:
        print("""
🗄️ Настройка базы данных Mushroom Mini App

Использование:
  python setup_database.py <команда>

Команды:
  dev         - Настройка для разработки (SQLite)
  prod        - Настройка для продакшена (PostgreSQL)
  sample      - Создание тестовых данных
  full-dev    - Полная настройка для разработки + данные
  full-prod   - Полная настройка для продакшена

Примеры:
  python setup_database.py dev
  python setup_database.py sample
  python setup_database.py full-dev
        """)
        return
    
    command = sys.argv[1]
    
    match command:
        case "dev":
            await setup_development()
        case "prod":
            await setup_production()
        case "sample":
            await create_sample_data()
        case "full-dev":
            await setup_development()
            await create_sample_data()
        case "full-prod":
            if await setup_production():
                print("🔄 Теперь примените миграции:")
                print("   python migrate.py upgrade")
                print("📝 Затем создайте данные:")
                print("   python setup_database.py sample")
        case _:
            print(f"❌ Неизвестная команда: {command}")

if __name__ == "__main__":
    asyncio.run(main())

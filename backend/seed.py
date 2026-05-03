"""
Скрипт для создания тестовых данных
"""

import asyncio
import sys
import os
from pathlib import Path
from datetime import datetime, timedelta

# Добавляем текущую директорию в Python path
sys.path.append(str(Path(__file__).parent))

from database import init_db, close_db, get_session
from database import User, Category, Plan, Transaction
from dotenv import load_dotenv

async def seed_database():
    """Создание тестовых данных"""
    print("🌱 Создание тестовых данных...")
    
    # Загружаем .env
    load_dotenv()
    
    try:
        # Инициализация БД
        await init_db(create_tables=True)
        
        async with get_session() as session:
            # Проверяем есть ли данные
            result = await session.execute("SELECT COUNT(*) FROM users")
            user_count = result.scalar()
            
            if user_count > 0:
                print("📊 База данных уже содержит данные")
                print("🗑️ Для очистки данных используйте: python seed.py --clear")
                return
            
            # Создаем тестового пользователя
            user = User(tg_user_id=123456789)
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            print(f"👤 Создан пользователь: {user.id} (TG ID: {user.tg_user_id})")
            
            # Создаем категории расходов
            expense_categories = [
                Category(user_id=user.id, name="Субстрат", type="expense"),
                Category(user_id=user.id, name="Мицелий", type="expense"),
                Category(user_id=user.id, name="Электричество", type="expense"),
                Category(user_id=user.id, name="Вода", type="expense"),
                Category(user_id=user.id, name="Упаковка", type="expense"),
                Category(user_id=user.id, name="Транспорт", type="expense"),
                Category(user_id=user.id, name="Оборудование", type="expense"),
                Category(user_id=user.id, name="Прочее", type="expense"),
            ]
            
            # Создаем категории доходов
            income_categories = [
                Category(user_id=user.id, name="Продажа грибов", type="income"),
                Category(user_id=user.id, name="Другие доходы", type="income"),
            ]
            
            all_categories = expense_categories + income_categories
            
            for category in all_categories:
                session.add(category)
            
            await session.commit()
            print(f"📁 Создано категорий: {len(all_categories)}")
            
            # Создаем активный план
            active_plan = Plan(
                user_id=user.id,
                name="План выращивания шампиньонов #1",
                status="active",
                start_date=datetime.utcnow() - timedelta(days=30)
            )
            session.add(active_plan)
            await session.commit()
            await session.refresh(active_plan)
            
            print(f"📦 Создан активный план: {active_plan.id}")
            
            # Создаем завершенный план
            completed_plan = Plan(
                user_id=user.id,
                name="План выращивания вешенок #1",
                status="completed",
                start_date=datetime.utcnow() - timedelta(days=90),
                end_date=datetime.utcnow() - timedelta(days=30),
                revenue=25000.0,
                yield_kg=15.5
            )
            session.add(completed_plan)
            await session.commit()
            await session.refresh(completed_plan)
            
            print(f"📦 Создан завершенный план: {completed_plan.id}")
            
            # Создаем транзакции для активного плана
            active_transactions = [
                Transaction(
                    plan_id=active_plan.id,
                    category_id=expense_categories[0].id,  # Субстрат
                    amount=3500.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=28),
                    comment="Покупка компоста для шампиньонов"
                ),
                Transaction(
                    plan_id=active_plan.id,
                    category_id=expense_categories[1].id,  # Мицелий
                    amount=1200.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=25),
                    comment="Мицелий шампиньонов голландский"
                ),
                Transaction(
                    plan_id=active_plan.id,
                    category_id=expense_categories[2].id,  # Электричество
                    amount=800.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=20),
                    comment="Электричество за месяц роста"
                ),
                Transaction(
                    plan_id=active_plan.id,
                    category_id=expense_categories[4].id,  # Упаковка
                    amount=500.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=15),
                    comment="Пакеты и пленка"
                ),
                Transaction(
                    plan_id=active_plan.id,
                    category_id=income_categories[0].id,  # Продажа
                    amount=8500.0,
                    type="income",
                    date=datetime.utcnow() - timedelta(days=10),
                    comment="Продажа первой партии грибов"
                ),
            ]
            
            for transaction in active_transactions:
                session.add(transaction)
            
            await session.commit()
            print(f"💰 Создано транзакций для активного плана: {len(active_transactions)}")
            
            # Создаем транзакции для завершенного плана
            completed_transactions = [
                Transaction(
                    plan_id=completed_plan.id,
                    category_id=expense_categories[0].id,  # Субстрат
                    amount=2800.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=88),
                    comment="Субстрат для вешенок"
                ),
                Transaction(
                    plan_id=completed_plan.id,
                    category_id=expense_categories[1].id,  # Мицелий
                    amount=1500.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=85),
                    comment="Мицелий вешенок"
                ),
                Transaction(
                    plan_id=completed_plan.id,
                    category_id=expense_categories[2].id,  # Электричество
                    amount=1200.0,
                    type="expense",
                    date=datetime.utcnow() - timedelta(days=60),
                    comment="Электричество за 2 месяца"
                ),
                Transaction(
                    plan_id=completed_plan.id,
                    category_id=income_categories[0].id,  # Продажа
                    amount=15000.0,
                    type="income",
                    date=datetime.utcnow() - timedelta(days=35),
                    comment="Продажа всего урожая вешенок"
                ),
                Transaction(
                    plan_id=completed_plan.id,
                    category_id=income_categories[0].id,  # Продажа
                    amount=10000.0,
                    type="income",
                    date=datetime.utcnow() - timedelta(days=32),
                    comment="Вторая партия продажи"
                ),
            ]
            
            for transaction in completed_transactions:
                session.add(transaction)
            
            await session.commit()
            print(f"💰 Создано транзакций для завершенного плана: {len(completed_transactions)}")
            
            # Статистика
            total_expenses = sum(t.amount for t in active_transactions + completed_transactions if t.type == "expense")
            total_income = sum(t.amount for t in active_transactions + completed_transactions if t.type == "income")
            profit = total_income - total_expenses
            
            print("\n📊 Статистика созданных данных:")
            print(f"   👤 Пользователей: 1")
            print(f"   📦 Планов: 2 (1 активный, 1 завершенный)")
            print(f"   📁 Категорий: {len(all_categories)}")
            print(f"   💰 Транзакций: {len(active_transactions + completed_transactions)}")
            print(f"   💸 Всего расходов: {total_expenses:.2f} ₽")
            print(f"   💵 Всего доходов: {total_income:.2f} ₽")
            print(f"   💰 Прибыль: {profit:.2f} ₽")
            
            print("\n✅ Тестовые данные успешно созданы!")
            print("🔑 Telegram ID для теста: 123456789")
            print("🌐 API доступен: http://localhost:8000/api")
            print("📊 Проверьте планы: http://localhost:8000/api/plans")
            
    except Exception as e:
        print(f"❌ Ошибка создания данных: {e}")
        raise
    finally:
        await close_db()

async def clear_database():
    """Очистка базы данных"""
    print("🗑️ Очистка базы данных...")
    
    try:
        await init_db(create_tables=True)
        
        async with get_session() as session:
            # Удаляем все данные в правильном порядке
            await session.execute("DELETE FROM transactions")
            await session.execute("DELETE FROM plans")
            await session.execute("DELETE FROM categories")
            await session.execute("DELETE FROM users")
            await session.commit()
            
            print("✅ База данных очищена")
            
    except Exception as e:
        print(f"❌ Ошибка очистки БД: {e}")
        raise
    finally:
        await close_db()

def main():
    """Главная функция"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--clear":
        asyncio.run(clear_database())
    else:
        asyncio.run(seed_database())

if __name__ == "__main__":
    main()

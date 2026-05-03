"""
CRUD операции для Mushroom Mini App
Create, Read, Update, Delete для всех моделей
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import select, delete, and_, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from database import (
    User, Plan, Category, Transaction, 
    async_session_maker, calculate_plan_stats, format_currency
)


# ===== ПЛАНЫ (PLANS) =====

async def get_user_plans(user_id: int, status: Optional[str] = None) -> List[Plan]:
    """Получить все планы пользователя"""
    async with async_session_maker() as session:
        query = select(Plan).where(Plan.user_id == user_id)
        
        if status:
            query = query.where(Plan.status == status)
        
        query = query.order_by(desc(Plan.created_at))
        result = await session.execute(query)
        return list(result.scalars().all())


async def get_plan_by_id(plan_id: int, user_id: int) -> Optional[Plan]:
    """Получить план по ID с проверкой пользователя"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()


async def create_plan(user_id: int, name: str) -> Plan:
    """Создать новый план"""
    async with async_session_maker() as session:
        plan = Plan(
            user_id=user_id,
            name=name,
            start_date=datetime.utcnow(),
            status="active"
        )
        session.add(plan)
        await session.commit()
        await session.refresh(plan)
        return plan


async def update_plan(plan_id: int, user_id: int, **kwargs) -> Optional[Plan]:
    """Обновить план"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            return None
        
        for key, value in kwargs.items():
            if hasattr(plan, key):
                setattr(plan, key, value)
        
        await session.commit()
        await session.refresh(plan)
        return plan


async def complete_plan(plan_id: int, user_id: int, revenue: float, yield_kg: float) -> Optional[Plan]:
    """Завершить план"""
    return await update_plan(
        plan_id, user_id,
        end_date=datetime.utcnow(),
        revenue=revenue,
        yield_kg=yield_kg,
        status="completed"
    )


async def delete_plan(plan_id: int, user_id: int) -> bool:
    """Удалить план"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        plan = result.scalar_one_or_none()
        
        if not plan:
            return False
        
        await session.delete(plan)
        await session.commit()
        return True


async def get_plan_stats(plan_id: int, user_id: int) -> Optional[Dict[str, Any]]:
    """Получить статистику по плану"""
    async with async_session_maker() as session:
        # Получаем план
        plan_result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        plan = plan_result.scalar_one_or_none()
        
        if not plan:
            return None
        
        # Получаем транзакции
        transactions_result = await session.execute(
            select(Transaction).where(Transaction.plan_id == plan_id)
        )
        transactions = list(transactions_result.scalars().all())
        
        # Расчет статистики
        stats = calculate_plan_stats(
            transactions, plan.revenue, plan.yield_kg, 
            plan.start_date, plan.end_date
        )
        
        # Добавляем информацию о плане
        stats.update({
            "plan_id": plan.id,
            "plan_name": plan.name,
            "plan_status": plan.status,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat() if plan.end_date else None
        })
        
        return stats


# ===== КАТЕГОРИИ (CATEGORIES) =====

async def get_user_categories(user_id: int, category_type: Optional[str] = None) -> List[Category]:
    """Получить все категории пользователя"""
    async with async_session_maker() as session:
        query = select(Category).where(Category.user_id == user_id)
        
        if category_type:
            query = query.where(Category.type == category_type)
        
        query = query.order_by(Category.name)
        result = await session.execute(query)
        return list(result.scalars().all())


async def search_categories(user_id: int, search_term: str, category_type: Optional[str] = None) -> List[Category]:
    """Поиск категорий по названию"""
    async with async_session_maker() as session:
        query = select(Category).where(
            and_(
                Category.user_id == user_id,
                Category.name.ilike(f"%{search_term}%")
            )
        )
        
        if category_type:
            query = query.where(Category.type == category_type)
        
        query = query.order_by(Category.name)
        result = await session.execute(query)
        return list(result.scalars().all())


async def get_category_by_id(category_id: int, user_id: int) -> Optional[Category]:
    """Получить категорию по ID"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Category).where(
                and_(Category.id == category_id, Category.user_id == user_id)
            )
        )
        return result.scalar_one_or_none()


async def get_category_by_name(user_id: int, name: str, category_type: str) -> Optional[Category]:
    """Получить категорию по названию"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Category).where(
                and_(
                    Category.user_id == user_id,
                    Category.name == name,
                    Category.type == category_type
                )
            )
        )
        return result.scalar_one_or_none()


async def create_category(user_id: int, name: str, category_type: str) -> Category:
    """Создать новую категорию"""
    async with async_session_maker() as session:
        category = Category(
            user_id=user_id,
            name=name,
            type=category_type
        )
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category


async def delete_category(category_id: int, user_id: int) -> bool:
    """Удалить категорию"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Category).where(
                and_(Category.id == category_id, Category.user_id == user_id)
            )
        )
        category = result.scalar_one_or_none()
        
        if not category:
            return False
        
        await session.delete(category)
        await session.commit()
        return True


# ===== ТРАНЗАКЦИИ (TRANSACTIONS) =====

async def get_plan_transactions(plan_id: int, user_id: int, limit: int = 50) -> List[Transaction]:
    """Получить транзакции плана"""
    async with async_session_maker() as session:
        # Проверяем, что план принадлежит пользователю
        plan_result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        if not plan_result.scalar_one_or_none():
            return []
        
        # Получаем транзакции
        result = await session.execute(
            select(Transaction)
            .where(Transaction.plan_id == plan_id)
            .order_by(desc(Transaction.date))
            .limit(limit)
        )
        return list(result.scalars().all())


async def get_recent_transactions(user_id: int, limit: int = 10) -> List[Transaction]:
    """Получить последние транзакции пользователя"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Transaction)
            .join(Plan)
            .where(Plan.user_id == user_id)
            .order_by(desc(Transaction.date))
            .limit(limit)
        )
        return list(result.scalars().all())


async def create_transaction(
    user_id: int,
    plan_id: int,
    category_id: int,
    amount: float,
    transaction_type: str,
    comment: Optional[str] = None,
    date: Optional[datetime] = None
) -> Optional[Transaction]:
    """Создать новую транзакцию"""
    async with async_session_maker() as session:
        # Проверяем, что план принадлежит пользователю
        plan_result = await session.execute(
            select(Plan).where(
                and_(Plan.id == plan_id, Plan.user_id == user_id)
            )
        )
        if not plan_result.scalar_one_or_none():
            return None
        
        # Проверяем, что категория принадлежит пользователю
        category_result = await session.execute(
            select(Category).where(
                and_(Category.id == category_id, Category.user_id == user_id)
            )
        )
        if not category_result.scalar_one_or_none():
            return None
        
        transaction = Transaction(
            plan_id=plan_id,
            category_id=category_id,
            amount=amount,
            type=transaction_type,
            comment=comment,
            date=date or datetime.utcnow()
        )
        session.add(transaction)
        await session.commit()
        await session.refresh(transaction)
        return transaction


async def update_transaction(
    transaction_id: int,
    user_id: int,
    **kwargs
) -> Optional[Transaction]:
    """Обновить транзакцию"""
    async with async_session_maker() as session:
        # Получаем транзакцию с проверкой пользователя
        result = await session.execute(
            select(Transaction)
            .join(Plan)
            .where(
                and_(
                    Transaction.id == transaction_id,
                    Plan.user_id == user_id
                )
            )
        )
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            return None
        
        for key, value in kwargs.items():
            if hasattr(transaction, key):
                setattr(transaction, key, value)
        
        await session.commit()
        await session.refresh(transaction)
        return transaction


async def delete_transaction(transaction_id: int, user_id: int) -> bool:
    """Удалить транзакцию"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(Transaction)
            .join(Plan)
            .where(
                and_(
                    Transaction.id == transaction_id,
                    Plan.user_id == user_id
                )
            )
        )
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            return False
        
        await session.delete(transaction)
        await session.commit()
        return True


# ===== СТАТИСТИКА И АНАЛИТИКА =====

async def get_user_stats(user_id: int) -> Dict[str, Any]:
    """Получить общую статистику пользователя"""
    async with async_session_maker() as session:
        # Получаем все планы
        plans_result = await session.execute(
            select(Plan).where(Plan.user_id == user_id)
        )
        plans = list(plans_result.scalars().all())
        
        if not plans:
            return {
                "total_plans": 0,
                "active_plans": 0,
                "completed_plans": 0,
                "total_expenses": 0.0,
                "total_income": 0.0,
                "total_profit": 0.0,
                "total_yield": 0.0,
                "avg_roi": 0.0
            }
        
        # Инициализация счетчиков
        total_expenses = 0.0
        total_income = 0.0
        total_yield = 0.0
        active_count = 0
        completed_count = 0
        roi_values = []
        
        for plan in plans:
            # Получаем транзакции плана
            transactions_result = await session.execute(
                select(Transaction).where(Transaction.plan_id == plan.id)
            )
            transactions = list(transactions_result.scalars().all())
            
            # Расчет статистики плана
            stats = calculate_plan_stats(
                transactions, plan.revenue, plan.yield_kg,
                plan.start_date, plan.end_date
            )
            
            total_expenses += stats["total_expenses"]
            total_income += stats["total_income"]
            total_yield += plan.yield_kg
            
            if plan.status == "active":
                active_count += 1
            else:
                completed_count += 1
                if stats["total_expenses"] > 0:
                    roi_values.append(stats["roi"])
        
        total_profit = total_income - total_expenses
        avg_roi = sum(roi_values) / len(roi_values) if roi_values else 0.0
        
        return {
            "total_plans": len(plans),
            "active_plans": active_count,
            "completed_plans": completed_count,
            "total_expenses": round(total_expenses, 2),
            "total_income": round(total_income, 2),
            "total_profit": round(total_profit, 2),
            "total_yield": round(total_yield, 2),
            "avg_roi": round(avg_roi, 2)
        }


async def get_category_expenses(user_id: int, plan_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Получить расходы по категориям"""
    async with async_session_maker() as session:
        query = select(
            Category.name,
            Category.type,
            Transaction.amount
        ).join(Transaction).join(Plan).where(Plan.user_id == user_id)
        
        if plan_id:
            query = query.where(Transaction.plan_id == plan_id)
        
        query = query.where(Transaction.type == "expense")
        result = await session.execute(query)
        
        # Группировка по категориям
        category_totals = {}
        for row in result:
            category_name = row[0]
            amount = row[2]
            
            if category_name not in category_totals:
                category_totals[category_name] = 0.0
            category_totals[category_name] += amount
        
        # Форматирование результата
        return [
            {"category": name, "amount": round(amount, 2)}
            for name, amount in category_totals.items()
        ]


async def get_time_series_data(user_id: int, days: int = 30) -> List[Dict[str, Any]]:
    """Получить данные для графика динамики"""
    async with async_session_maker() as session:
        from datetime import datetime, timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        result = await session.execute(
            select(
                Transaction.date,
                Transaction.type,
                Transaction.amount
            )
            .join(Plan)
            .where(
                and_(
                    Plan.user_id == user_id,
                    Transaction.date >= start_date
                )
            )
            .order_by(Transaction.date)
        )
        
        # Группировка по дням
        daily_data = {}
        for row in result:
            date = row[0].date().isoformat()
            transaction_type = row[1]
            amount = row[2]
            
            if date not in daily_data:
                daily_data[date] = {"date": date, "expenses": 0.0, "income": 0.0}
            
            if transaction_type == "expense":
                daily_data[date]["expenses"] += amount
            else:
                daily_data[date]["income"] += amount
        
        return list(daily_data.values())

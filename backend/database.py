"""
Модели SQLAlchemy и настройка базы данных для Mushroom Mini App
"""

import os
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///mushroom_app.db")

# Определение драйвера базы данных
if DATABASE_URL.startswith("postgresql"):
    # PostgreSQL для продакшена
    engine_kwargs = {
        "echo": False,
        "future": True,
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }
else:
    # SQLite для локальной разработки
    engine_kwargs = {
        "echo": False,
        "future": True,
    }

# Глобальные переменные для работы с БД
engine = None
async_session_maker = None


class Base(DeclarativeBase):
    """Базовый класс для всех моделей"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )


class User(Base):
    """Модель пользователей"""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    tg_user_id: Mapped[int] = mapped_column(Integer, unique=True, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связи
    plans: Mapped[list["Plan"]] = relationship(
        "Plan", back_populates="user", cascade="all, delete-orphan"
    )
    categories: Mapped[list["Category"]] = relationship(
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, tg_user_id={self.tg_user_id})>"


class Plan(Base):
    """Модель планов выращивания"""
    __tablename__ = "plans"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    revenue: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    yield_kg: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)
    
    # Связи
    user: Mapped["User"] = relationship("User", back_populates="plans")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="plan", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Plan(id={self.id}, name='{self.name}', status='{self.status}')>"


class Category(Base):
    """Модель категорий"""
    __tablename__ = "categories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'expense' или 'income'
    
    # Связи
    user: Mapped["User"] = relationship("User", back_populates="categories")
    transactions: Mapped[list["Transaction"]] = relationship(
        "Transaction", back_populates="category", cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<Category(id={self.id}, name='{self.name}', type='{self.type}')>"


class Transaction(Base):
    """Модель транзакций (расходы/доходы)"""
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    plan_id: Mapped[int] = mapped_column(ForeignKey("plans.id"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    comment: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)  # 'expense' или 'income'
    
    # Связи
    plan: Mapped["Plan"] = relationship("Plan", back_populates="transactions")
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")
    
    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, amount={self.amount}, type='{self.type}')>"


async def init_db(create_tables: bool = False) -> None:
    """Инициализация базы данных
    
    Args:
        create_tables: Если True, создает таблицы автоматически (для разработки)
                      Если False, ожидает что таблицы созданы через миграции
    """
    global engine, async_session_maker
    
    try:
        engine = create_async_engine(DATABASE_URL, **engine_kwargs)
        
        async_session_maker = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Создание таблиц только для разработки
        if create_tables:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                
    except Exception as e:
        print(f"Ошибка инициализации БД: {e}")
        raise


async def close_db() -> None:
    """Закрытие соединения с базой данных"""
    global engine
    if engine:
        await engine.dispose()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Генератор сессий для работы с БД"""
    async with async_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Вспомогательные функции для работы с БД
async def get_user_by_tg_id(tg_user_id: int) -> Optional[User]:
    """Получить пользователя по Telegram ID"""
    async with async_session_maker() as session:
        result = await session.execute(
            select(User).where(User.tg_user_id == tg_user_id)
        )
        return result.scalar_one_or_none()


async def create_user(tg_user_id: int) -> User:
    """Создать нового пользователя"""
    async with async_session_maker() as session:
        user = User(tg_user_id=tg_user_id)
        session.add(user)
        await session.commit()
        await session.refresh(user)
        
        # Создание базовых категорий для пользователя
        await create_default_categories(user.id, session)
        
        return user


async def create_default_categories(user_id: int, session: AsyncSession) -> None:
    """Создание базовых категорий для нового пользователя"""
    default_expense_categories = [
        "Субстрат", "Мицелий", "Электричество", "Вода", 
        "Упаковка", "Транспорт", "Оборудование", "Прочее"
    ]
    
    default_income_categories = [
        "Продажа грибов", "Другие доходы"
    ]
    
    # Создание категорий расходов
    for cat_name in default_expense_categories:
        category = Category(user_id=user_id, name=cat_name, type="expense")
        session.add(category)
    
    # Создание категорий доходов
    for cat_name in default_income_categories:
        category = Category(user_id=user_id, name=cat_name, type="income")
        session.add(category)
    
    await session.commit()


def calculate_plan_stats(transactions: list[Transaction], revenue: float, yield_kg: float, 
                         start_date: datetime, end_date: Optional[datetime] = None) -> dict:
    """Расчет статистики по плану"""
    total_expenses = sum(t.amount for t in transactions if t.type == "expense")
    total_income = sum(t.amount for t in transactions if t.type == "income")
    
    profit = total_income - total_expenses
    roi = (profit / total_expenses * 100) if total_expenses > 0 else 0.0
    
    end = end_date or datetime.utcnow()
    days = (end - start_date).days + 1  # +1 чтобы включить оба дня
    
    cost_per_kg = (total_expenses / yield_kg) if yield_kg > 0 else 0.0
    
    return {
        "total_expenses": round(total_expenses, 2),
        "total_income": round(total_income, 2),
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "roi": round(roi, 2),
        "days": days,
        "yield_kg": round(yield_kg, 2),
        "cost_per_kg": round(cost_per_kg, 2),
        "transactions_count": len(transactions)
    }


def format_currency(amount: float) -> str:
    """Форматирование суммы с разделителями тысяч"""
    return f"{amount:,.2f}".replace(",", " ").replace(".", ",")


def format_number(amount: float) -> str:
    """Форматирование числа с разделителями тысяч"""
    return f"{amount:,.2f}".replace(",", " ").replace(".", ",")

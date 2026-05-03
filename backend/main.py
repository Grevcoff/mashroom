"""
FastAPI приложение для Mushroom Mini App
REST API для Telegram Mini App по учету грибоводства
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from datetime import datetime

from database import init_db, close_db

# Настройка логирования
logging.basicConfig(
    level=logging.INFO if os.getenv("DEBUG", "false").lower() == "true" else logging.WARNING,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
from auth import get_current_user
from crud import (
    # Планы
    get_user_plans, get_plan_by_id, create_plan, update_plan, 
    complete_plan, delete_plan, get_plan_stats,
    # Категории
    get_user_categories, search_categories, get_category_by_id, 
    get_category_by_name, create_category, delete_category,
    # Транзакции
    get_plan_transactions, get_recent_transactions, create_transaction,
    update_transaction, delete_transaction,
    # Статистика
    get_user_stats, get_category_expenses, get_time_series_data
)


# ===== Pydantic модели для API =====

class PlanCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Название плана")

class PlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    revenue: Optional[float] = Field(None, ge=0)
    yield_kg: Optional[float] = Field(None, ge=0)

class PlanComplete(BaseModel):
    revenue: float = Field(..., ge=0, description="Выручка")
    yield_kg: float = Field(..., ge=0, description="Вес урожая в кг")

class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Название категории")
    type: str = Field(..., regex="^(expense|income)$", description="Тип категории")

class TransactionCreate(BaseModel):
    plan_id: int = Field(..., gt=0, description="ID плана")
    category_id: int = Field(..., gt=0, description="ID категории")
    amount: float = Field(..., gt=0, description="Сумма")
    type: str = Field(..., regex="^(expense|income)$", description="Тип транзакции")
    comment: Optional[str] = Field(None, max_length=500, description="Комментарий")
    date: Optional[str] = Field(None, description="Дата в формате YYYY-MM-DD")

class TransactionUpdate(BaseModel):
    amount: Optional[float] = Field(None, gt=0)
    comment: Optional[str] = Field(None, max_length=500)
    date: Optional[str] = Field(None, description="Дата в формате YYYY-MM-DD")


# ===== Управление жизненным циклом приложения =====

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Инициализация и очистка при запуске/остановке"""
    # Запуск
    logger.info("Запуск приложения...")
    
    try:
        # Для разработки создаем таблицы автоматически
        # В продакшене используйте миграции: alembic upgrade head
        create_tables = os.getenv("DEBUG", "false").lower() == "true"
        await init_db(create_tables=create_tables)
        logger.info("База данных инициализирована")
    except Exception as e:
        logger.error(f"Ошибка инициализации БД: {e}")
        raise
    
    yield
    
    # Остановка
    logger.info("Остановка приложения...")
    try:
        await close_db()
        logger.info("Соединения с БД закрыты")
    except Exception as e:
        logger.error(f"Ошибка закрытия БД: {e}")


# ===== Создание FastAPI приложения =====

app = FastAPI(
    title="Mushroom Mini App API",
    description="API для Telegram Mini App по учету домашнего грибоводства",
    version="1.0.0",
    lifespan=lifespan
)

# Настройка CORS
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ===== Обработка ошибок =====

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Обработчик HTTP исключений"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Обработчик общих исключений"""
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "status_code": 500}
    )


# ===== ПЛАНЫ =====

@app.get("/api/plans")
async def get_plans(
    status: Optional[str] = None,
    user_id: int = Depends(get_current_user)
):
    """Получить все планы пользователя"""
    try:
        plans = await get_user_plans(user_id, status)
        return {
            "plans": [
                {
                    "id": plan.id,
                    "name": plan.name,
                    "status": plan.status,
                    "start_date": plan.start_date.isoformat(),
                    "end_date": plan.end_date.isoformat() if plan.end_date else None,
                    "revenue": plan.revenue,
                    "yield_kg": plan.yield_kg,
                    "created_at": plan.created_at.isoformat()
                }
                for plan in plans
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/plans/{plan_id}")
async def get_plan(plan_id: int, user_id: int = Depends(get_current_user)):
    """Получить план по ID"""
    try:
        plan = await get_plan_by_id(plan_id, user_id)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat() if plan.end_date else None,
            "revenue": plan.revenue,
            "yield_kg": plan.yield_kg,
            "created_at": plan.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/plans")
async def create_plan_endpoint(
    plan_data: PlanCreate,
    user_id: int = Depends(get_current_user)
):
    """Создать новый план"""
    try:
        plan = await create_plan(user_id, plan_data.name)
        return {
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "start_date": plan.start_date.isoformat(),
            "end_date": None,
            "revenue": plan.revenue,
            "yield_kg": plan.yield_kg,
            "created_at": plan.created_at.isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/plans/{plan_id}")
async def update_plan_endpoint(
    plan_id: int,
    plan_data: PlanUpdate,
    user_id: int = Depends(get_current_user)
):
    """Обновить план"""
    try:
        update_data = plan_data.dict(exclude_unset=True)
        plan = await update_plan(plan_id, user_id, **update_data)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat() if plan.end_date else None,
            "revenue": plan.revenue,
            "yield_kg": plan.yield_kg,
            "created_at": plan.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/plans/{plan_id}/complete")
async def complete_plan_endpoint(
    plan_id: int,
    complete_data: PlanComplete,
    user_id: int = Depends(get_current_user)
):
    """Завершить план"""
    try:
        plan = await complete_plan(plan_id, user_id, complete_data.revenue, complete_data.yield_kg)
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {
            "id": plan.id,
            "name": plan.name,
            "status": plan.status,
            "start_date": plan.start_date.isoformat(),
            "end_date": plan.end_date.isoformat() if plan.end_date else None,
            "revenue": plan.revenue,
            "yield_kg": plan.yield_kg,
            "created_at": plan.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/plans/{plan_id}")
async def delete_plan_endpoint(plan_id: int, user_id: int = Depends(get_current_user)):
    """Удалить план"""
    try:
        success = await delete_plan(plan_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return {"message": "Plan deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/plans/{plan_id}/stats")
async def get_plan_stats_endpoint(plan_id: int, user_id: int = Depends(get_current_user)):
    """Получить статистику по плану"""
    try:
        stats = await get_plan_stats(plan_id, user_id)
        if not stats:
            raise HTTPException(status_code=404, detail="Plan not found")
        
        return stats
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== КАТЕГОРИИ =====

@app.get("/api/categories")
async def get_categories(
    type: Optional[str] = None,
    user_id: int = Depends(get_current_user)
):
    """Получить все категории пользователя"""
    try:
        categories = await get_user_categories(user_id, type)
        return {
            "categories": [
                {
                    "id": cat.id,
                    "name": cat.name,
                    "type": cat.type,
                    "created_at": cat.created_at.isoformat()
                }
                for cat in categories
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories/search")
async def search_categories_endpoint(
    q: str = Field(..., min_length=2, description="Поисковый запрос"),
    type: Optional[str] = None,
    user_id: int = Depends(get_current_user)
):
    """Поиск категорий"""
    try:
        categories = await search_categories(user_id, q, type)
        return {
            "categories": [
                {
                    "id": cat.id,
                    "name": cat.name,
                    "type": cat.type,
                    "created_at": cat.created_at.isoformat()
                }
                for cat in categories
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/categories")
async def create_category_endpoint(
    category_data: CategoryCreate,
    user_id: int = Depends(get_current_user)
):
    """Создать новую категорию"""
    try:
        # Проверяем, что категория с таким именем уже не существует
        existing = await get_category_by_name(user_id, category_data.name, category_data.type)
        if existing:
            raise HTTPException(status_code=400, detail="Category already exists")
        
        category = await create_category(user_id, category_data.name, category_data.type)
        return {
            "id": category.id,
            "name": category.name,
            "type": category.type,
            "created_at": category.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/categories/{category_id}")
async def delete_category_endpoint(category_id: int, user_id: int = Depends(get_current_user)):
    """Удалить категорию"""
    try:
        success = await delete_category(category_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Category not found")
        
        return {"message": "Category deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== ТРАНЗАКЦИИ =====

@app.get("/api/transactions")
async def get_transactions(
    plan_id: Optional[int] = None,
    recent: bool = False,
    user_id: int = Depends(get_current_user)
):
    """Получить транзакции"""
    try:
        if recent:
            transactions = await get_recent_transactions(user_id)
        elif plan_id:
            transactions = await get_plan_transactions(plan_id, user_id)
        else:
            raise HTTPException(status_code=400, detail="Either plan_id or recent=true required")
        
        return {
            "transactions": [
                {
                    "id": tx.id,
                    "plan_id": tx.plan_id,
                    "category_id": tx.category_id,
                    "category_name": tx.category.name,
                    "category_type": tx.category.type,
                    "amount": tx.amount,
                    "type": tx.type,
                    "comment": tx.comment,
                    "date": tx.date.isoformat(),
                    "created_at": tx.created_at.isoformat()
                }
                for tx in transactions
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/transactions")
async def create_transaction_endpoint(
    transaction_data: TransactionCreate,
    user_id: int = Depends(get_current_user)
):
    """Создать новую транзакцию"""
    try:
        # Парсим дату если она указана
        date = None
        if transaction_data.date:
            date = datetime.fromisoformat(transaction_data.date)
        
        transaction = await create_transaction(
            user_id=user_id,
            plan_id=transaction_data.plan_id,
            category_id=transaction_data.category_id,
            amount=transaction_data.amount,
            transaction_type=transaction_data.type,
            comment=transaction_data.comment,
            date=date
        )
        
        if not transaction:
            raise HTTPException(status_code=400, detail="Invalid plan_id or category_id")
        
        return {
            "id": transaction.id,
            "plan_id": transaction.plan_id,
            "category_id": transaction.category_id,
            "category_name": transaction.category.name,
            "category_type": transaction.category.type,
            "amount": transaction.amount,
            "type": transaction.type,
            "comment": transaction.comment,
            "date": transaction.date.isoformat(),
            "created_at": transaction.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/transactions/{transaction_id}")
async def update_transaction_endpoint(
    transaction_id: int,
    transaction_data: TransactionUpdate,
    user_id: int = Depends(get_current_user)
):
    """Обновить транзакцию"""
    try:
        update_data = transaction_data.dict(exclude_unset=True)
        
        # Парсим дату если она указана
        if "date" in update_data and update_data["date"]:
            update_data["date"] = datetime.fromisoformat(update_data["date"])
        
        transaction = await update_transaction(transaction_id, user_id, **update_data)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {
            "id": transaction.id,
            "plan_id": transaction.plan_id,
            "category_id": transaction.category_id,
            "category_name": transaction.category.name,
            "category_type": transaction.category.type,
            "amount": transaction.amount,
            "type": transaction.type,
            "comment": transaction.comment,
            "date": transaction.date.isoformat(),
            "created_at": transaction.created_at.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/transactions/{transaction_id}")
async def delete_transaction_endpoint(transaction_id: int, user_id: int = Depends(get_current_user)):
    """Удалить транзакцию"""
    try:
        success = await delete_transaction(transaction_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return {"message": "Transaction deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== СТАТИСТИКА =====

@app.get("/api/stats")
async def get_stats(user_id: int = Depends(get_current_user)):
    """Получить общую статистику"""
    try:
        stats = await get_user_stats(user_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/categories")
async def get_category_stats(
    plan_id: Optional[int] = None,
    user_id: int = Depends(get_current_user)
):
    """Получить расходы по категориям"""
    try:
        stats = await get_category_expenses(user_id, plan_id)
        return {"categories": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stats/time-series")
async def get_time_series_stats(
    days: int = Field(default=30, ge=1, le=365),
    user_id: int = Depends(get_current_user)
):
    """Получить данные для графика динамики"""
    try:
        stats = await get_time_series_data(user_id, days)
        return {"data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ===== HEALTH CHECK =====

@app.get("/api/health")
async def health_check():
    """Проверка здоровья API"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ===== ЗАПУСК =====

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("DEBUG", "false").lower() == "true" else False
    )

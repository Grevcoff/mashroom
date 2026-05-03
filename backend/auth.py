"""
Модуль аутентификации для Telegram Mini App
Валидация initData и извлечение данных пользователя
"""

import os
import hashlib
import hmac
from typing import Optional, Dict, Any
from urllib.parse import parse_qs, unquote

from fastapi import HTTPException, status
from pydantic import BaseModel

from database import get_user_by_tg_id, create_user


class TelegramUser(BaseModel):
    """Модель данных пользователя из Telegram"""
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None
    photo_url: Optional[str] = None


class AuthData(BaseModel):
    """Модель данных аутентификации"""
    user: TelegramUser
    auth_date: int
    hash: str


def parse_init_data(init_data: str) -> AuthData:
    """
    Парсит initData из Telegram WebApp
    
    Пример initData:
    user=%7B%22id%22%3A123456%2C%22first_name%22%3A%22John%22%7D&auth_date=1234567890&hash=abcdef123456
    """
    try:
        # Декодирование и парсинг query string
        decoded_data = unquote(init_data)
        parsed = parse_qs(decoded_data)
        
        # Извлечение данных пользователя
        user_data = parsed.get("user", [None])[0]
        if not user_data:
            raise ValueError("user data not found")
        
        # Парсинг JSON пользователя
        import json
        user_dict = json.loads(user_data)
        
        # Создание объектов
        user = TelegramUser(**user_dict)
        auth_date = int(parsed.get("auth_date", [0])[0])
        hash_value = parsed.get("hash", [""])[0]
        
        return AuthData(user=user, auth_date=auth_date, hash=hash_value)
        
    except Exception as e:
        raise ValueError(f"Invalid initData format: {e}")


def validate_init_data(init_data: str) -> AuthData:
    """
    Валидация подписи Telegram WebApp initData
    
    Алгоритм:
    1. Получить bot_token из переменных окружения
    2. Создать secret_key = HMAC_SHA256(bot_token, "WebAppData")
    3. Создать data_check_string из initData (без hash)
    4. Вычислить hash = HMAC_SHA256(secret_key, data_check_string)
    5. Сравнить с полученным hash
    """
    
    # Получение bot token
    bot_token = os.getenv("TELEGRAM_BOT_TOKEN")
    if not bot_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TELEGRAM_BOT_TOKEN not configured"
        )
    
    # Парсинг initData
    auth_data = parse_init_data(init_data)
    
    # Создание secret key
    secret_key = hmac.new(
        key="WebAppData".encode(),
        msg=bot_token.encode(),
        digestmod=hashlib.sha256
    ).digest()
    
    # Создание data_check string (все параметры кроме hash)
    parsed_data = parse_qs(unquote(init_data))
    parsed_data.pop("hash", None)  # Удаляем hash из данных для проверки
    
    # Сортировка ключей и создание строки для проверки
    data_check_items = []
    for key in sorted(parsed_data.keys()):
        value = parsed_data[key][0]
        data_check_items.append(f"{key}={value}")
    
    data_check_string = "\n".join(data_check_items)
    
    # Вычисление hash
    computed_hash = hmac.new(
        key=secret_key,
        msg=data_check_string.encode(),
        digestmod=hashlib.sha256
    ).hexdigest()
    
    # Сравнение hash
    if not hmac.compare_digest(computed_hash, auth_data.hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid hash"
        )
    
    # Проверка времени (не старше 24 часов)
    import time
    current_time = int(time.time())
    if current_time - auth_data.auth_date > 86400:  # 24 часа
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Auth data too old"
        )
    
    return auth_data


async def authenticate_user(init_data: str) -> int:
    """
    Аутентификация пользователя и получение/создание user_id
    
    Возвращает внутренний ID пользователя в БД
    """
    # Валидация initData
    auth_data = validate_init_data(init_data)
    
    # Поиск пользователя в БД
    user = await get_user_by_tg_id(auth_data.user.id)
    
    if not user:
        # Создание нового пользователя
        user = await create_user(auth_data.user.id)
    
    return user.id


def extract_user_from_init_data(init_data: str) -> TelegramUser:
    """
    Извлечение данных пользователя из initData без валидации
    (для отладки или когда валидация не требуется)
    """
    auth_data = parse_init_data(init_data)
    return auth_data.user


# Middleware для FastAPI
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)


async def get_current_user(request: Request) -> int:
    """
    Извлечение пользователя из заголовка Authorization
    
    Ожидает формат: "tma <init_data>"
    """
    authorization = request.headers.get("authorization")
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    
    if not authorization.startswith("tma "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization format"
        )
    
    init_data = authorization[4:]  # Удаляем "tma " префикс
    
    try:
        user_id = await authenticate_user(init_data)
        return user_id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


# Утилиты для работы с датами
def format_date(date_int: int) -> str:
    """Форматирует дату из timestamp в строку"""
    from datetime import datetime
    return datetime.fromtimestamp(date_int).strftime("%d.%m.%Y")


def get_user_display_name(user: TelegramUser) -> str:
    """Возвращает отображаемое имя пользователя"""
    if user.first_name and user.last_name:
        return f"{user.first_name} {user.last_name}"
    return user.first_name or "Пользователь"

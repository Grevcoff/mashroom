"""
Скрипты для управления миграциями Alembic
"""

import os
import sys
import subprocess
from pathlib import Path

def run_command(cmd: list[str]) -> int:
    """Выполнение команды"""
    try:
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(result.stdout)
        return result.returncode
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")
        return e.returncode

def init_alembic():
    """Инициализация Alembic"""
    print("🔧 Инициализация Alembic...")
    
    commands = [
        ["alembic", "init", "alembic"],
    ]
    
    for cmd in commands:
        if run_command(cmd) != 0:
            print(f"❌ Ошибка выполнения команды: {' '.join(cmd)}")
            return False
    
    print("✅ Alembic инициализирован")
    return True

def create_migration(message: str):
    """Создание новой миграции"""
    print(f"📝 Создание миграции: {message}")
    
    cmd = ["alembic", "revision", "--autogenerate", "-m", message]
    if run_command(cmd) != 0:
        print("❌ Ошибка создания миграции")
        return False
    
    print("✅ Миграция создана")
    return True

def upgrade_migration(revision: str = "head"):
    """Применение миграций"""
    print(f"⬆️ Применение миграций до {revision}")
    
    cmd = ["alembic", "upgrade", revision]
    if run_command(cmd) != 0:
        print("❌ Ошибка применения миграций")
        return False
    
    print("✅ Миграции применены")
    return True

def downgrade_migration(revision: str):
    """Откат миграций"""
    print(f"⬇️ Откат миграций до {revision}")
    
    cmd = ["alembic", "downgrade", revision]
    if run_command(cmd) != 0:
        print("❌ Ошибка отката миграций")
        return False
    
    print("✅ Миграции откачены")
    return True

def show_history():
    """Показать историю миграций"""
    print("📜 История миграций:")
    
    cmd = ["alembic", "history"]
    if run_command(cmd) != 0:
        print("❌ Ошибка получения истории")
        return False
    
    return True

def show_current():
    """Показать текущую ревизию"""
    print("📍 Текущая ревизия:")
    
    cmd = ["alembic", "current"]
    if run_command(cmd) != 0:
        print("❌ Ошибка получения текущей ревизии")
        return False
    
    return True

def main():
    """Главная функция"""
    if len(sys.argv) < 2:
        print("""
🚀 Управление миграциями Mushroom Mini App

Использование:
  python migrate.py <команда> [аргументы]

Команды:
  init                    - Инициализация Alembic
  create <message>        - Создать новую миграцию
  upgrade [revision]      - Применить миграции (по умолчанию до head)
  downgrade <revision>    - Откатить миграции
  history                 - Показать историю миграций
  current                 - Показать текущую ревизию

Примеры:
  python migrate.py init
  python migrate.py create "initial migration"
  python migrate.py upgrade
  python migrate.py upgrade head
  python migrate.py downgrade -1
  python migrate.py history
        """)
        return
    
    command = sys.argv[1]
    
    # Проверяем наличие .env файла
    if not os.path.exists('.env'):
        print("⚠️ Внимание: .env файл не найден")
        print("Создайте .env файл на основе .env.example")
    
    match command:
        case "init":
            init_alembic()
        case "create":
            if len(sys.argv) < 3:
                print("❌ Укажите сообщение для миграции")
                return
            create_migration(sys.argv[2])
        case "upgrade":
            revision = sys.argv[2] if len(sys.argv) > 2 else "head"
            upgrade_migration(revision)
        case "downgrade":
            if len(sys.argv) < 3:
                print("❌ Укажите ревизию для отката")
                return
            downgrade_migration(sys.argv[2])
        case "history":
            show_history()
        case "current":
            show_current()
        case _:
            print(f"❌ Неизвестная команда: {command}")

if __name__ == "__main__":
    main()

# CoWorkHUB — проект

## Стек
- Frontend: React 19 + TypeScript + Tailwind v4 + TanStack Query + Zustand + React Router
- Backend: FastAPI + SQLAlchemy async (aiomysql) + MySQL + JWT (python-jose) + passlib[bcrypt]

## Статус реализации Auth API

### ✅ Готово
- `app/schemas/auth.py` — Pydantic схемы (LoginRequest, RegisterRequest, RefreshRequest, UserOut, TokenResponse)
- `app/services/auth.py` — hash_password, verify_password, create_token, create_refresh_token, decode_token
- `app/dependencies.py` — get_current_user (извлекает Bearer токен, декодит, ищет пользователя в БД)

### ⚠️ Не доделано в dependencies.py
строка 29: `user = result.scalar_one_or_none` — не хватает `()` (должно быть `scalar_one_or_none()`)

### ⏭ Следующий шаг
Написать `app/routers/auth.py` с эндпоинтами:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me

### 📁 Структура бэкенда
backend/
  main.py                    # FastAPI app (нужно добавить include_router)
  .env                       # DATABASE_URL, JWT_SECRET
  requirements.txt
  app/
    config.py                # Settings
    database.py              # engine, AsyncSessionLocal, get_db
    models/
      user.py                # User + UserRole
      token.py               # RefreshToken, PasswordResetToken
      booking.py, space.py, payment.py, review.py
    schemas/
      __init__.py
      auth.py
    services/
      auth.py                # hash/verify/tokens
    dependencies.py           # get_current_user
    routers/                 # (создать)
      auth.py

# CoWorkHUB — полная документация проекта

## Стек
- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, React Router v7, TanStack Query v5, Zustand v5, Axios, react-hot-toast, dayjs, lucide-react
- **Backend**: Python 3.14+, FastAPI 0.115, SQLAlchemy 2.0 (async, aiomysql), MySQL, Alembic
- **Auth**: JWT (python-jose HS256), bcrypt (passlib), email verification
- **Инфра (planned)**: Redis, Celery, WebSocket

## База данных (MySQL, localhost:3306, CoWorkHub)

### Таблицы (все созданы через Alembic)
| Таблица | Модель | Ключевые поля |
|---|---|---|
| users | user.py | id, email (unique), password, full_name, role (enum: guest/resident/manager/admin), phone, is_active, created_at, updated_at |
| spaces | space.py | id, name, type (meeting_room/hot_desk/office), capacity, price_per_hour, description, address, is_active, owner_id (FK->users) |
| amenities | space.py | id, name (unique), icon. M2M с spaces через space_amenities |
| space_images | space.py | id, space_id (FK), url, position |
| bookings | booking.py | id, user_id (FK), space_id (FK), start_time, end_time, status (pending/confirmed/completed/cancelled), total_price, promo_code |
| payments | payment.py | id, booking_id (FK), amount, status (pending/success/failed/refunded), provider, provider_payment_id, paid_at |
| reviews | review.py | id, booking_id (FK, unique), user_id (FK), space_id (FK), rating, comment |
| refresh_tokens | token.py | id, user_id (FK), token (unique), expires_at, is_revoked |
| password_reset_tokens | token.py | id, user_id (FK), token (unique), expires_at, used |

## Бэкенд — API эндпоинты

### Auth (`/api/auth`) — Готово ✅ (зарегистрирован в main.py)
| Метод | Путь | Описание | Возвращает |
|---|---|---|---|
| POST | /register | Регистрация, отправка кода верификации на email | `{"message": "Verification code sent to email"}` |
| POST | /login | Вход, проверка is_active | TokenResponse |
| POST | /verify | Подтверждение email по коду | TokenResponse |
| POST | /refresh | Ротация refresh-токена | TokenResponse |
| GET | /me | Текущий пользователь (Bearer) | UserOut |
| POST | /forgot_password | Отправить код сброса на email (неавторизован) | `{"msg": "Code is sent"}` |
| POST | /reset_password | Отправить код смены на email (авторизован) | `{"msg": "Code is sent"}` |
| POST | /reset_password/confirm | Принять код + новый пароль, сменить пароль | `{"msg": "Password changed"}` |
| POST | /logout | Отозвать refresh-токен | (no content, 200) |
| PATCH | /update_profile | Обновление full_name / phone | UserOut |
| POST | /resend_code | Повторная отправка кода верификации | `{"msg": "Code is sent"}` |

### Spaces (`/api/spaces`) — Готово
| Метод | Путь | Описание |
|---|---|---|
| GET | / | Список spaces (фильтры: space_type, capacity, date) |
| POST | / | Создание space (manager/admin) |
| GET | /{id} | Детально (с amenities, images) |
| PATCH | /{id} | Обновление (owner/manager/admin) |
| DELETE | /{id} | Удаление (owner/manager/admin) |
| GET | /{id}/availability | Проверка доступности по времени |
| POST | /{id}/images | Загрузка изображения |
| DELETE | /{id}/images/{image_id} | Удаление изображения |
| GET | /{id}/reviews | Отзывы space |
| GET | /amenities | Все amenities |
| GET | /my | Мои spaces (admin — все, manager — свои) |

### Что НЕ сделано в бэкенде

**Spaces ручки:**
- `POST /amenities` — создать amenity (админ/менеджер)
- `POST /{id}/amenities` — добавить amenity к space

**Новые роутеры:**
- **Bookings router** (`/api/bookings`): ✅ зарегистрирован в main.py
  - `POST /` — ✅ создание брони (проверка space, пересечения, расчёт цены)
  - `GET /{id}` — ✅ детали брони (с проверкой владельца)
  - `GET /` — ❌ не сделано
  - `PATCH /{id}/cancel` — ❌ не сделано
- **Payments router** (`/api/payments`): не существует
- **Reviews router** (`/api/reviews`): не существует
- **Admin router** (`/api/admin`): не существует

### Схемы (Pydantic)
```
schemas/
  __init__.py
  users.py     # UserOut, LoginRequest, RegisterRequest, UpdateProfileRequest
  tokens.py    # TokenResponse, RefreshRequest, VerifyRequest, ForgotPasswordRequest, ResetPassword, ConfirmResetRequest
  space.py     # SpaceOut, SpaceCreate, SpaceUpdate, AmenityOut, SpaceImageOut, AvailabilitySlotOut
  booking.py   # BookingCreate, BookingOut, SpaceBriefOut
  # auth.py удалён — дублировал users.py + tokens.py
```

### Баги (все пофикшены)
- ~~`dependincies.py:29` — `scalar_one_or_none` без `()` → `scalar_one_or_none()`~~ ✅ исправлено
- ~~`dependincies.py:21` — `user_id` из JWT строка, не кастится в `int`~~ ✅ исправлено
- ~~`auth.py:207` — `timedelta(15)` без `minutes=`~~ ✅ исправлено

## Фронтенд — структура

### Роутинг (App.tsx)
```
/login                     LoginPage
/register                  RegisterPage

(под MainLayout с Navbar):
/                          HomePage
/spaces                    SpacesListPage
/spaces/:id                SpaceDetailPage

(ProtectedRoute — любой auth):
/bookings                  MyBookingsPage
/bookings/:id              BookingDetailPage
/payments/:bookingId       PaymentPage
/profile                   ProfilePage
/notifications             NotificationsPage

(ProtectedRoute — manager/admin):
/manager/*                 ManagerDashboard

(ProtectedRoute — admin):
/admin/*                   AdminPanel
```

### API слой (src/api/)
| Файл | Сервис | Эндпоинты |
|---|---|---|
| client.ts | Axios instance | Bearer token, auto-refresh на 401, редирект на /login |
| auth.ts | authApi | register, login, refresh, me |
| spaces.ts | spacesApi | list, getById, getAvailability |
| bookings.ts | bookingsApi | create, list, getById, cancel |
| payments.ts | paymentsApi | create |

### Состояние (Zustand + TanStack Query)
- **authStore.ts**: user, isAuthenticated, setAuth, setUser, logout
- **useAuth.ts**: useLogin, useRegister, useLogout
- **useSpaces.ts**: useSpaces, useSpace, useAvailability
- **useBookings.ts**: useBookings, useBooking, useCreateBooking, useCancelBooking

### UI компоненты
- Button (variants: primary/secondary/outline/ghost/danger, sizes: sm/md/lg, loading)
- Input (label, error, ref)
- Card + CardHeader + CardContent
- Badge (StatusBadge, SpaceTypeBadge)
- Navbar (sticky, role-based links)
- ProtectedRoute (auth guard, optional role whitelist)

### Страницы (все готовы)
| Страница | Статус |
|---|---|
| HomePage | Герой, 3 feature cards, популярные spaces |
| LoginPage | Форма email+password |
| RegisterPage | Форма email+password+confirm |
| SpacesListPage | Фильтры, skeleton, карточки |
| SpaceDetailPage | Детали, виджет бронирования |
| MyBookingsPage | Список броней, отмена |
| BookingDetailPage | Детали брони, кнопка оплаты |
| PaymentPage | Mock — редирект на /api/payments/{bookingId}/create |
| ProfilePage | Инфо пользователя, logout |
| ManagerDashboard | **Заглушка** (статы hardcoded, таблица spaces — placeholder) |
| AdminPanel | **Заглушка** (4 карточки-навигации, activity log — placeholder) |
| NotificationsPage | WebSocket клиент к /ws/notifications |

### Несостыковки фронтенда с бэком
1. **RegisterRequest**: фронт шлёт `{ email, password }`, бэк ждёт `{ email, password, full_name }`. Нет поля full_name на форме.
2. **Register response**: бэк возвращает `{"message": "Verification code sent to email"}`, фронт ждёт `AuthResponse` → упадёт в `setAuth`.
3. **Нет страницы verify-code**: после регистрации нужно показать форму ввода кода и вызвать `/auth/verify`.
4. **Нет forgot-password / reset-password / change-password страниц**.

## Коммиты (все локальны, не запушины)
```
b58ef5d (HEAD -> main) make some auth routes
f262f7d make all routers for spaces
b0f6655 CRUD with auth models, DB schema, and frontend API layer
556c6ea change sync to async
41d657e Initial commit
```

## Переменные окружения
Смотри `backend/.env`: DATABASE_URL, JWT_SECRET, SMTP настройки.

## Запуск
- Frontend: `npm run dev` (порт 3000, прокси `/api` → :8000, `/ws` → ws)
- Backend: `uvicorn app.main:app --reload` (порт 8000)

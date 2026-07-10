from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    phone: str | None = None
    avatar: str | None = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

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


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserOut

class VerifyRequest(BaseModel):
    email : EmailStr
    code : str

class ForgotPasswordRequest(BaseModel):
    email : EmailStr

class ResetPassword(BaseModel):
    email : EmailStr
    code : str
    new_password : str

class ConfirmResetRequest(BaseModel):
    code: str
    new_password: str

class UpdateProfileRequest(BaseModel):
    full_name : str | None = None
    phone : str | None = None
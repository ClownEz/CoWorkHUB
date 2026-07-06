from pydantic import BaseModel, EmailStr
from app.schemas.users import UserOut


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserOut


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyRequest(BaseModel):
    email: EmailStr
    code: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    email: EmailStr
    code: str
    new_password: str


class ConfirmResetRequest(BaseModel):
    code: str
    new_password: str

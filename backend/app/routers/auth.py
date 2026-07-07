from fastapi import APIRouter, Depends,HTTPException,Query,File
from sqlalchemy import select,update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
from datetime import datetime,timezone,timedelta
from app.dependincies import get_current_user
from app.database import get_db

from app.schemas.users import UserOut, UserRole, LoginRequest, RegisterRequest, UpdateProfileRequest
from app.schemas.tokens import TokenResponse, VerifyRequest, RefreshRequest, ForgotPasswordRequest, ResetPassword, ConfirmResetRequest
from app.models.user import User
from app.services.auth import hash_password,create_token,create_refresh_token,decode_token,verify_password
from app.services.email import send_verification_code
from app.models.token import RefreshToken,PasswordResetToken

router = APIRouter(prefix="/api/auth",tags=["Auth"])

@router.post("/register",status_code=201)
async def registration(body : RegisterRequest,db:AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(User.email == body.email))
	user_exist = result.scalar_one_or_none()
	if user_exist:
		raise HTTPException(status_code=409,detail="Email already registred")
	user = User(
		email=body.email,
		password=hash_password(body.password),
		full_name=body.full_name,
		is_active = False
	)
	db.add(user)
	await db.commit()
	await db.refresh(user)
	code = send_verification_code(user.email)
	db_code = PasswordResetToken(
		user_id = user.id,
		token = code,
		expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
	)
	db.add(db_code)
	await db.commit()
	return {"message" : "Verification code sent to email"}

@router.post("/login",response_model=TokenResponse)
async def login(body : LoginRequest,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(User.email == body.email))
	user = result.scalar_one_or_none()
	if not user or not verify_password(body.password , user.password):
		raise HTTPException(status_code=401,detail="Invalid password")
	if not user.is_active :
		raise HTTPException(status_code=401,detail="User is not active")
	new_token = create_token({"sub":str(user.id),"role":user.role.value})
	new_refresh_token = create_refresh_token({"sub":str(user.id),"role":user.role.value})
	payload = decode_token(new_refresh_token)
	expires = datetime.fromtimestamp(payload["exp"],tz=timezone.utc)
	db_refresh = RefreshToken(
		user_id=user.id,
		token=new_refresh_token,
		expires_at=expires,
	)
	db.add(db_refresh)
	await db.commit()
	return TokenResponse(
		access_token= new_token,
		refresh_token= new_refresh_token,
		user = UserOut.model_validate(user)
	)

@router.post("/verify",response_model=TokenResponse)
async def verify_user(body : VerifyRequest,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(body.email == User.email))
	user_ver = result.scalar_one_or_none()
	if not user_ver :
		raise HTTPException(status_code=404,detail="User isn't found")
	result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.user_id == user_ver.id,PasswordResetToken.token == body.code,PasswordResetToken.used == False))
	token = result.scalar_one_or_none()
	if not token:
		raise HTTPException(400,"Invalid or expired code")
	if token.expires_at.replace(tzinfo=timezone.utc)< datetime.now(timezone.utc):
		raise HTTPException(400,detail="Code expired")
	token.used = True
	user_ver.is_active = True
	await db.commit()
	new_token = create_token({"sub":str(user_ver.id),"role":user_ver.role.value})
	new_refresh_token = create_refresh_token({"sub":str(user_ver.id),"role":user_ver.role.value})
	payload = decode_token(new_refresh_token)
	expires = datetime.fromtimestamp(payload["exp"],tz=timezone.utc)
	db_refresh = RefreshToken(
		user_id=user_ver.id,
		token=new_refresh_token,
		expires_at=expires,
	)
	db.add(db_refresh)
	await db.commit()
	return TokenResponse(
		access_token= new_token,
		refresh_token= new_refresh_token,
		user = UserOut.model_validate(user_ver)
	)

@router.post("/refresh")
async def refresh_token(body : RefreshRequest,db : AsyncSession = Depends(get_db)):
	try:
		payload = decode_token(body.refresh_token)
	except JWTError:
		raise HTTPException(status_code=401,detail="Invalid refresh token")
	result = await db.execute(select(RefreshToken).where(RefreshToken.token == body.refresh_token,RefreshToken.is_revoked == False))
	token = result.scalar_one_or_none()
	if not token :
		raise HTTPException(401,"Not found")
	user_id = int(payload["sub"])
	result = await db.execute(select(User).where(User.id == user_id))
	user = result.scalar_one_or_none()
	if not user or not user.is_active:
		raise HTTPException(401,"User not found")
	token.is_revoked = True
	new_token = create_token({"sub":str(user.id),"role":user.role.value})
	new_refresh_token = create_refresh_token({"sub":str(user.id),"role":user.role.value})
	payload = decode_token(new_refresh_token)
	expires = datetime.fromtimestamp(payload["exp"],tz=timezone.utc)
	db_refresh = RefreshToken(
		user_id=user.id,
		token=new_refresh_token,
		expires_at=expires,
	)
	db.add(db_refresh)
	await db.commit()
	return TokenResponse(
		access_token= new_token,
		refresh_token= new_refresh_token,
		user = UserOut.model_validate(user)
	)
@router.get("/me",response_model=UserOut)
async def get_user(current_user : User = Depends(get_current_user)):
	return UserOut.model_validate(current_user)

@router.post("/forgot_password")
async def forgot_password(body : ForgotPasswordRequest,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(User.email == body.email))
	user = result.scalar_one_or_none()
	if not user :
		raise HTTPException(status_code=404,detail="User isn't found")
	code = send_verification_code(user.email)
	db_code = PasswordResetToken(
		user_id = user.id,
		token = code,
		expires_at = datetime.now(timezone.utc)+timedelta(minutes=15)
	)
	db.add(db_code)
	await db.commit()
	return {"msg" : "Code is sent"}

@router.post("/reset_password")
async def password_reset(body : ResetPassword,current_user : User = Depends(get_current_user),db : AsyncSession = Depends(get_db)):
	code = send_verification_code(current_user.email)
	db_code = PasswordResetToken(
		user_id = current_user.id,
		token = code,
		expires_at = datetime.now(timezone.utc)+timedelta(minutes=15)
	)
	db.add(db_code)
	await db.commit()
	return {"msg" : "Code is sent"}

@router.post("/reset_password/confirm")
async def confirm_reset(body:ConfirmResetRequest,current_user : User = Depends(get_current_user), db:AsyncSession = Depends(get_db)):
	result = await db.execute(select(PasswordResetToken).where(PasswordResetToken.user_id == current_user.id,PasswordResetToken.token == body.code,PasswordResetToken.used == False))
	token = result.scalar_one_or_none()
	if not token:
		raise HTTPException(400,"Invalid or expired token")
	if token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
		raise HTTPException(400,"Token has expired")
	current_user.password = hash_password(body.new_password)
	token.used = True
	await db.execute(update(RefreshToken).where(RefreshToken.user_id == current_user.id,RefreshToken.is_revoked == False).values(is_revoked = True))
	await db.commit()
	return {"msg":"Password changed"}

@router.post("/logout")
async def logout(body:RefreshRequest,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(RefreshToken).where(RefreshToken.token == body.refresh_token,RefreshToken.is_revoked == False))
	token = result.scalar_one_or_none()
	if not token:
		raise HTTPException(401,"Token not found")
	token.is_revoked = True
	await db.commit()

@router.patch("/update_profile",response_model=UserOut)
async def update_profile(body : UpdateProfileRequest,current_user : User = Depends(get_current_user),db : AsyncSession = Depends(get_db)):
	if body.full_name is not None:
		current_user.full_name = body.full_name
	if body.phone is not None :
		current_user.phone = body.phone
	await db.commit()
	return UserOut.model_validate(current_user)

@router.post("/resend_code")
async def resend_code (body : ForgotPasswordRequest,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(User).where(User.email == body.email))
	user = result.scalar_one_or_none()
	if not user:
		raise HTTPException(401,"User is not found")
	code = send_verification_code(user.email)
	db_code = PasswordResetToken(
		user_id = user.id,
		token = code,
		expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)
	)
	db.add(db_code)
	await db.commit()
	return {"msg" : "code is sent"}


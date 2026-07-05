from passlib.context import CryptContext
from datetime import datetime,timedelta,timezone
from jose import JWTError,jwt
from app.config import settings

pwd_context = CryptContext(schemes = ["bcrypt"])
def hash_password(password: str):
	hashed = pwd_context.hash(password)
	return hashed

def verify_password(plain : str,hashed : str) -> bool:
	return pwd_context.verify(plain,hashed)

def create_token(data:dict) -> str:
	to_encode = data.copy()
	expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

	to_encode.update({"exp":expire, "type":"access"})
	return jwt.encode(to_encode,settings.JWT_SECRET,algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data:dict) -> str:
	to_encode = data.copy()
	expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

	to_encode.update({"exp":expire, "type":"refresh"})
	return jwt.encode(to_encode,settings.JWT_SECRET,algorithm=settings.JWT_ALGORITHM)

def decode_token(token:str)-> dict:
	return jwt.decode(token,settings.JWT_SECRET,algorithms=[settings.JWT_ALGORITHM])
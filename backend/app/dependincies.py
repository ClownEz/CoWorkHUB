from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from jose import JWTError

from app.database import get_db
from app.services.auth import decode_token
from app.models.user import User

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)) -> User:
	try:
		payload = decode_token(credentials.credentials)
	except JWTError:
		raise HTTPException(status_code=401,detail="Invalid or expired Token")

	user_id = int(payload.get("sub"))
	if user_id is None:
		raise HTTPException(
			status_code=401,
			detail="Invalid token payload",
		)

	result = await db.execute(select(User).where(User.id == user_id))
	user = result.scalar_one_or_none()
	if user is None:
		raise HTTPException(
			status_code=401,
			detail="User not found"
		)
	return user

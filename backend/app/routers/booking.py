from fastapi import APIRouter, Depends,HTTPException,Query,File
from sqlalchemy import select,update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime,timezone
from app.dependincies import get_current_user
from app.database import get_db

from app.models.booking import Booking,BookingStatus
from app.models.space import Space
from app.models.user import User
from app.schemas.booking import BookingCreate,BookingOut,BookingStatus

router = APIRouter(prefix="/api/bookings",tags="Booking")

@router.post("/",response_model=BookingOut)
async def create_booking(body : BookingCreate,current_user: User = Depends(get_current_user),db: AsyncSession = Depends(get_db)):
	if body.start_time >= body.end_time:
		raise HTTPException (400,"start_time must be before")
	if body.start_time < datetime.now(timezone.utc):
		raise HTTPException(400,"start_time must be in future")
	result = await db.execute(select(Space).where(Space.id == body.space_id))
	space_exist = result.scalar_one_or_none()
	if not space_exist or space_exist.is_active == False:
		raise HTTPException(400,"Space not active or not found")
	result = await db.execute(select(Booking).where(
		Booking.space_id == body.space_id,
		Booking.start_time < body.end_time,
		Booking.end_time > body.start_time,
		Booking.status != BookingStatus.cancelled
	))
	space_free = result.scalar_one_or_none()
	if space_free:
		raise HTTPException(409,"Space is already booked for this time")
	hours = (body.end_time - body.start_time).total_seconds() / 3600
	total_price = round(hours * space_exist.price_per_hour,2)
	db_date = Booking(
		user_id = current_user.id,
		space_id = body.space_id,
		start_time = body.start_time,
		end_time = body.end_time,
		total_price = total_price,
		promo_code = body.promo_code,
		status = BookingStatus.pending
	)
	db.add(db_date)
	await db.commit()
	await db.refresh(db_date,["space"])
	return db_date

@router.get("/{id}",response_model=BookingOut)
async def get_book_by_id(id:int,db:AsyncSession = Depends(get_db),current_user:User = Depends(get_current_user)):
	result = await db.execute(select(Booking).where(Booking.id == id).options(selectinload(Booking.space)))
	booking = result.scalar_one_or_none()
	if not booking:
		raise HTTPException(404,"Booking not found")
	if booking.user_id != current_user.id and current_user.role != "admin" and booking.space.owner_id != current_user.id:
		raise HTTPException(403,"Not enought permisshions")
	return booking
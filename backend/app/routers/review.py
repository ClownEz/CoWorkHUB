from fastapi import APIRouter, Depends,HTTPException,Query,File
from sqlalchemy import select,update
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime,timezone,timedelta
from app.dependincies import get_current_user
from app.database import get_db

from app.models.review import Review
from app.schemas.review import ReviewCreate,ReviewOut,ReviewUpdate
from app.models.user import User
from app.models.booking import Booking,BookingStatus
from app.models.space import Space

router = APIRouter(prefix="/api/review",tags=["Review"])


@router.post("/",response_model=ReviewOut)
async def create_review(body : ReviewCreate,current_user : User = Depends(get_current_user), db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(Booking).where(Booking.user_id == current_user.id,Booking.status == BookingStatus.completed,Booking.id == body.booking_id))
	booking_exist = result.scalar_one_or_none()
	if not booking_exist:
		raise HTTPException(403,"Booking not found")
	result = await db.execute(select(Review).where(Review.booking_id == body.booking_id))
	existing = result.scalar_one_or_none()
	if existing:
		raise HTTPException(400,"Review already exist")
	db_date = Review(
		booking_id = booking_exist.id,
		user_id = current_user.id,
		space_id = booking_exist.space_id,
		rating = body.rating,
		comment = body.comment
	)
	db.add(db_date)
	await db.commit()
	await db.refresh(db_date)
	return db_date

@router.get("/space/{space_id}",response_model=list[ReviewOut])
async def get_review_by_space(space_id : int ,db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(Space).where(Space.id == space_id,Space.is_active == True))
	space = result.scalar_one_or_none()
	if not space:
		raise HTTPException(404,"Space not found")
	result = await db.execute(select(Review).where(Review.space_id == space_id))
	reviews = result.scalars().all()
	return reviews

@router.get("/{id}",response_model=ReviewOut)
async def get_review_by_id(id:int,db:AsyncSession = Depends(get_db)):
	result = await db.execute(select(Review).where(Review.id == id))
	review = result.scalar_one_or_none()
	if not review:
		raise HTTPException(403,"Review not found")
	return review

@router.patch("/{id}",response_model=ReviewOut)
async def change_review(id:int,body : ReviewUpdate , current_user : User = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
	result =  await db.execute(select(Review).where(Review.id == id))
	review = result.scalar_one_or_none()
	if not review :
		raise HTTPException(404,"Review not found")
	if review.user_id != current_user.id:
		raise HTTPException(403,"Not enough permissions")
	if datetime.now(timezone.utc) - review.created_at.replace(tzinfo=timezone.utc) > timedelta(hours=4):
		raise HTTPException(400,"Time to edit review has expired")
	if body.rating is not None :
		review.rating = body.rating
	if body.comment is not None :
		review.comment = body.comment
	await db.commit()
	await db.refresh(review)
	return review

@router.delete("/{id}")
async def delete_review(id : int , current_user : User = Depends(get_current_user), db : AsyncSession = Depends(get_db)):
	result = await db.execute(select(Review).where(Review.id == id))
	exist = result.scalar_one_or_none()
	if not exist :
		raise HTTPException(403,"Review not found")
	if current_user.role != "admin":
		raise HTTPException(403,"Not enough permissions")
	await db.delete(exist)
	await db.commit()
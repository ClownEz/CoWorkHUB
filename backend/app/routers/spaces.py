from fastapi import APIRouter, Depends,HTTPException,Query
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from datetime import datetime
from app.dependincies import get_current_user
from app.database import get_db
from app.models.space import Space, Amenity, SpaceType
from app.schemas.space import SpaceOut,SpaceCreate,AvailabilitySlotOut,SpaceUpdate
from app.models.user import User

from app.models.booking import Booking

router = APIRouter(prefix="/api/spaces", tags=["Spaces"])


@router.get("/", response_model=list[SpaceOut])
async def list_of_spaces(
	space_type: SpaceType | None = None,
	capacity: int | None = None,
	date: str | None = None,
	db: AsyncSession = Depends(get_db),
):
	conditions = [Space.is_active == True]
	if space_type:
		conditions.append(Space.type == space_type)
	if capacity :
		conditions.append(Space.capacity >= capacity)
	query = await db.execute(select(Space).
	where(*conditions)
	.options(selectinload(Space.amenities),selectinload(Space.images))
	.order_by(Space.created_at.desc()))
	spaces = query.scalars().all()
	return spaces

@router.post("/", response_model=SpaceOut, status_code=201)
async def create_space(body: SpaceCreate,
current_user: User = Depends(get_current_user),
db: AsyncSession = Depends(get_db)):
	if current_user.role not in ("manager", "admin"):
		raise HTTPException(status_code=403, detail="Only manager or admin can create spaces")
	space = Space(**body.model_dump(exclude={"amenity_ids"}))
	if body.amenity_ids:
		amenties = await db.execute(select(Amenity).where(Amenity.id.in_(body.amenity_ids)))
		space.amenities = list(amenties.scalars().all())
	db.add(space)
	await db.commit()
	await db.refresh(space)
	return space

@router.get("/{space_id}/availability",response_model=list[AvailabilitySlotOut])
async def get_available_rooms(
	space_id:int ,
	from_time : datetime = Query(alias="from"),
	to_time : datetime = Query(alias="to"),
	db:AsyncSession = Depends(get_db)):
	available_space = await db.execute(select(Space).where(Space.id == space_id))
	space = available_space.scalar_one_or_none()
	if not space:
		raise HTTPException(status_code=404,detail="Space isn't found")
	query = select(Booking).where(Booking.space_id == space_id,Booking.start_time < to_time,Booking.end_time > from_time,Booking.status != "cancelled")
	result = await db.execute(query)
	overlap = result.scalars().first()
	return [AvailabilitySlotOut(start_time=from_time,end_time=to_time,available=overlap is None)]

@router.get("/{space_id}",response_model=SpaceOut)
async def get_your_space (space_id : int,db:AsyncSession = Depends(get_db)):
	searched = await db.execute(select(Space).where(Space.id == space_id).options(selectinload(Space.amenities),selectinload(Space.images)))
	space = searched.scalar_one_or_none()
	if not space :
		raise HTTPException(status_code=404,detail="Space not founded")
	return space
@router.patch("/{space_id}", response_model=SpaceOut)
async def update_space(
	space_id: int,
	body: SpaceUpdate,
	current_user: User = Depends(get_current_user),
	db: AsyncSession = Depends(get_db),
):
	if current_user.role not in ("manager","admin"):
		raise HTTPException(status_code=403,detail="Only manager / admin can update")
	result = await db.execute(select(Space).where(Space.id == space_id))
	space = result.scalar_one_or_none()
	if not space:
		raise HTTPException(status_code=404,detail="Isn't found")
	for field , value in body.model_dump(exclude_unset=True).items():
		if field == "amenity_ids":
			if value is not None:
				amenities = await db.execute(select(Amenity).where(Amenity.id.in_(value)))
				space.amenities = list(amenities.scalars().all())
		else:
			setattr(space,field,value)
	await db.commit()
	await db.refresh(space)
	return space
from fastapi import APIRouter, Depends,HTTPException,Query,UploadFile,File
from uuid import uuid4
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
import os
import aiofiles

from datetime import datetime
from app.dependincies import get_current_user
from app.database import get_db
from app.models.space import Space, Amenity, SpaceType,SpaceImage
from app.schemas.space import SpaceOut,SpaceCreate,AvailabilitySlotOut,SpaceUpdate,AmenityOut
from app.models.user import User, UserRole
from app.models.review import Review

from app.models.booking import Booking

router = APIRouter(prefix="/api/spaces", tags=["Spaces"])


def _space_to_out(space: Space) -> dict:
    return {
        "id": space.id,
        "name": space.name,
        "type": space.type,
        "capacity": space.capacity,
        "price_per_hour": space.price_per_hour,
        "description": space.description,
        "address": space.address,
        "is_active": space.is_active,
        "owner_id": space.owner_id,
        "owner_name": space.owner.full_name if space.owner else None,
        "amenities": [{"id": a.id, "name": a.name, "icon": a.icon} for a in space.amenities],
        "images": [{"id": i.id, "url": i.url, "position": i.position} for i in space.images],
        "created_at": space.created_at,
        "updated_at": space.updated_at,
    }


@router.get("/", response_model=list[SpaceOut])
async def list_of_spaces(
	space_type: SpaceType | None = None,
	capacity: int | None = None,
	date: str | None = None,
	search : str | None = None,
	sort : str | None = None,
	db: AsyncSession = Depends(get_db),
):
	conditions = [Space.is_active == True]
	if space_type:
		conditions.append(Space.type == space_type)
	if capacity :
		conditions.append(Space.capacity >= capacity)
	if search:
		conditions.append(Space.name.contains(search))
	if sort == "price_asc":
		order = Space.price_per_hour.asc()
	elif sort == "price_desc":
		order = Space.price_per_hour.desc()
	elif sort == "oldest":
		order = Space.created_at.asc()
	else :
		order = Space.created_at.desc()
	query = await db.execute(select(Space).
	where(*conditions)
	.options(selectinload(Space.amenities),selectinload(Space.images))
	.order_by(order))
	spaces = query.scalars().all()
	return spaces


@router.get("/admin/all", response_model=list[SpaceOut])
async def admin_list_all_spaces(
	current_user: User = Depends(get_current_user),
	db: AsyncSession = Depends(get_db),
):
	if current_user.role != UserRole.admin:
		raise HTTPException(status_code=403, detail="Admin only")
	result = await db.execute(
		select(Space)
		.options(selectinload(Space.amenities), selectinload(Space.images), selectinload(Space.owner))
		.order_by(Space.created_at.desc())
	)
	return [_space_to_out(s) for s in result.scalars().all()]

@router.post("/", response_model=SpaceOut, status_code=201)
async def create_space(body: SpaceCreate,
current_user: User = Depends(get_current_user),
db: AsyncSession = Depends(get_db)):
	if current_user.role not in ("manager", "admin"):
		raise HTTPException(status_code=403, detail="Only manager or admin can create spaces")
	space = Space(**body.model_dump(exclude={"amenity_ids"}),owner_id = current_user.id)
	if body.amenity_ids:
		amenities = await db.execute(select(Amenity).where(Amenity.id.in_(body.amenity_ids)))
		space.amenities = list(amenities.scalars().all())
	db.add(space)
	await db.commit()
	result = await db.execute(
		select(Space)
		.where(Space.id == space.id)
		.options(selectinload(Space.amenities), selectinload(Space.images))
	)
	return result.scalar_one()

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
async def get_space (space_id : int,db:AsyncSession = Depends(get_db)):
	searched = await db.execute(select(Space).where(Space.id == space_id).options(selectinload(Space.amenities),selectinload(Space.images)))
	space = searched.scalar_one_or_none()
	if not space :
		raise HTTPException(status_code=404,detail="Space not found")
	return space
@router.patch("/{space_id}", response_model=SpaceOut)
async def update_space(
	space_id: int,
	body: SpaceUpdate,
	current_user: User = Depends(get_current_user),
	db: AsyncSession = Depends(get_db),
):
	result = await db.execute(select(Space).where(Space.id == space_id))
	space = result.scalar_one_or_none()
	if not space:
		raise HTTPException(status_code=404, detail="Space not found")
	if current_user.role != "admin" and (current_user.role != "manager" or space.owner_id != current_user.id):
		raise HTTPException(status_code=403, detail="Not enough permissions")
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

@router.delete("/{space_id}", status_code=204)
async def delete_space(
	space_id: int,
	current_user: User = Depends(get_current_user),
	db: AsyncSession = Depends(get_db),
):
	space = await db.get(Space, space_id)
	if not space:
		raise HTTPException(status_code=404, detail="Space not found")
	if current_user.role != "admin" and (current_user.role != "manager" or space.owner_id != current_user.id):
		raise HTTPException(status_code=403, detail="Not enough permissions")
	await db.delete(space)
	await db.commit()
@router.get("/amenities",response_model=list[AmenityOut])
async def get_all_amenities(db: AsyncSession = Depends(get_db)):
	result = await db.execute(select(Amenity).order_by(Amenity.name))
	amenities = result.scalars().all()
	return amenities
UPLOAD_DIR = "static/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{space_id}/images", status_code=201)
async def upload_image(
    space_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    space = await db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    if current_user.role != "admin" and (current_user.role != "manager" or space.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(await file.read())

    image = SpaceImage(space_id=space_id, url=f"/{UPLOAD_DIR}/{filename}", position=0)
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image

@router.delete("/{space_id}/images/{image_id}",status_code=203)
async def delete_image (space_id : int,image_id : int,current_user : User = Depends(get_current_user),db : AsyncSession = Depends(get_db)):
	image = await db.get(SpaceImage,image_id)
	if not image:
		raise HTTPException(status_code=404,detail="Ins't found")
	if not image.space_id == space_id:
		raise HTTPException(status_code=404,detail="not found")
	space = await db.get(Space,space_id)
	if current_user.role != "admin" and (current_user.role != "manager" or current_user.id != space.owner_id):
		raise HTTPException(status_code=403,detail="not enough permissions")
	await db.delete(image)
	await db.commit()

@router.get("/{space_id}/reviews")
async def get_reviews_for_space(space_id : int,db : AsyncSession = Depends(get_db)):
	space = await db.get(Space,space_id)
	if not space :
		raise HTTPException(404,detail="Not found")
	result = await db.execute(select(Review).where(Review.space_id == space_id).order_by(Review.created_at.desc()))
	reviews = result.scalars().all()
	return reviews
@router.get("/my")
async def get_my_spaces(current_user:User = Depends(get_current_user),db:AsyncSession = Depends(get_db)):
	if current_user.role == "admin":
		result = await db.execute(select(Space).options(selectinload(Space.amenities),selectinload(Space.images)))
	elif current_user.role == "manager":
		result = await db.execute(select(Space).where(Space.owner_id == current_user.id).options(selectinload(Space.amenities),selectinload(Space.images)))
	else:
		raise HTTPException(status_code=403,detail="Not enought permissions")
	space = result.scalars().all()
	return space



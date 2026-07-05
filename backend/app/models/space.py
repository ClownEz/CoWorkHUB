import enum
from datetime import datetime
from typing import TYPE_CHECKING, List,Optional

from sqlalchemy import (
    Table, Column, Integer, String, Text, Boolean,
    DateTime, Float, ForeignKey, Enum as SAEnum, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.review import Review
    from app.models.user import User


class SpaceType(str, enum.Enum):
    meeting_room = "meeting_room"
    hot_desk = "hot_desk"
    office = "office"


space_amenities = Table(
    "space_amenities",
    Base.metadata,
    Column("space_id", Integer, ForeignKey("spaces.id"), nullable=False),
    Column("amenity_id", Integer, ForeignKey("amenities.id"), nullable=False),
)


class Space(Base):
    __tablename__ = "spaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[SpaceType] = mapped_column(SAEnum(SpaceType), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    price_per_hour: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="1")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    owner_id : Mapped[int | None] = mapped_column(Integer,ForeignKey("users.id"),nullable=True)
    owner : Mapped[Optional["User"]] = relationship(back_populates="owned_spaces")
    amenities: Mapped[List["Amenity"]] = relationship(secondary=space_amenities, back_populates="spaces")
    images: Mapped[List["SpaceImage"]] = relationship(back_populates="space")
    bookings: Mapped[List["Booking"]] = relationship(back_populates="space")
    reviews: Mapped[List["Review"]] = relationship(back_populates="space")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    icon: Mapped[str | None] = mapped_column(String(255), nullable=True)

    spaces: Mapped[List["Space"]] = relationship(secondary=space_amenities, back_populates="amenities")


class SpaceImage(Base):
    __tablename__ = "space_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    space_id: Mapped[int] = mapped_column(ForeignKey("spaces.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, server_default="0")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    space: Mapped["Space"] = relationship(back_populates="images")

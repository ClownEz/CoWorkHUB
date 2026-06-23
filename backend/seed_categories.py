import asyncio

from app.database import async_session, engine, Base
from app.config import settings


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print("Seed complete")


if __name__ == "__main__":
    asyncio.run(seed())

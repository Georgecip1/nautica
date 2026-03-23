from motor.motor_asyncio import AsyncIOMotorClient

from core.config import MONGO_URL, DB_NAME

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]


def close_db_client() -> None:
    client.close()

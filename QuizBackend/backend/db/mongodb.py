# backend/db/mongodb.py

from motor.motor_asyncio import AsyncIOMotorClient

client = AsyncIOMotorClient("mongodb://localhost:27017/")
db = client.quizarcade

# Define your collections
users_collection = db.users
user_quizzes_collection = db.user_quizzes   # <== Add this line


topic = db.topic
topic_collection = db.topic_collection   

# backend/routes/revision.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from bson import ObjectId
from typing import Optional
from db.mongodb import topic_collection  # ✅ correct import

router = APIRouter()

# ---------------------------
# Pydantic models
# ---------------------------
class Topic(BaseModel):
    topic: str
    notes: str
    difficulty: str  # "Easy" | "Medium" | "Hard"

class TopicResponse(BaseModel):
    id: str
    topic: str
    notes: str
    difficulty: str
    next_revision: str


# ---------------------------
# Helper: Calculate next revision date
# ---------------------------
def get_next_revision(difficulty: str) -> str:
    today = datetime.today()
    d = difficulty.lower()
    if d == "easy":
        days = 2
    elif d == "medium":
        days = 1
    else:  # hard
        days = 0
    return (today + timedelta(days=days)).strftime("%Y-%m-%d")


# ---------------------------
# Routes
# ---------------------------

@router.get("/revision", response_model=dict)
async def get_topics():
    try:
        topics = await topic_collection.find().to_list(length=None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

    result = []
    for t in topics:
        result.append({
            "id": str(t["_id"]),
            "topic": t.get("topic", ""),
            "notes": t.get("notes", ""),
            "difficulty": t.get("difficulty", ""),
            "next_revision": t.get("next_revision", "")
        })
    return {"topics": result}


@router.post("/revision", response_model=TopicResponse)
async def add_topic(topic: Topic):
    next_rev = get_next_revision(topic.difficulty)
    new_topic = {
        "topic": topic.topic,
        "notes": topic.notes,
        "difficulty": topic.difficulty,
        "next_revision": next_rev,
        "created_at": datetime.utcnow()
    }

    try:
        inserted = await topic_collection.insert_one(new_topic)  # ✅ FIXED
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to insert: {e}")

    return {
        "id": str(inserted.inserted_id),
        "topic": topic.topic,
        "notes": topic.notes,
        "difficulty": topic.difficulty,
        "next_revision": next_rev
    }


@router.delete("/revision/{topic_id}", response_model=dict)
async def delete_topic(topic_id: str):
    try:
        result = await topic_collection.delete_one({"_id": ObjectId(topic_id)})  # ✅ FIXED
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid id or DB error: {e}")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Topic not found")
    return {"message": "Topic deleted successfully"}



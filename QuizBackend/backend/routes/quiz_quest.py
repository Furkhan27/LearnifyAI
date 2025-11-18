from fastapi import APIRouter, HTTPException
from bson import ObjectId
from bson.errors import InvalidId
from db.mongodb import user_quizzes_collection  # adjust import as per your project
from bson import ObjectId

router = APIRouter()

def convert_objectid_to_str(doc):
    if isinstance(doc, list):
        return [convert_objectid_to_str(item) for item in doc]
    if isinstance(doc, dict):
        return {k: convert_objectid_to_str(v) for k, v in doc.items()}
    if isinstance(doc, ObjectId):
        return str(doc)
    return doc


@router.get("/quiz_test/{quiz_id}")
async def get_quiz(quiz_id: str):
    try:
        obj_id = ObjectId(quiz_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="Invalid quiz ID format")

    quiz = await user_quizzes_collection.find_one({"_id": obj_id})

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz = convert_objectid_to_str(quiz)

    return quiz

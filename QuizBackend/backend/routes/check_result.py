from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from db.mongodb import users_collection, user_quizzes_collection
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class QuestionResult(BaseModel):
    question: str
    options: List[str]
    correctOption: str
    selectedOption: str

class QuizSheet(BaseModel):
    quizId: str
    userId: str
    resultScore: dict  # Keeps mapping index to selected option
    questions: List[QuestionResult]

@router.post("/store_result")
async def store_quiz_result(quizSheet: QuizSheet):
    try:
        print("doing")
        # Validate user
        # findUser = await users_collection.find_one({"_id": (quizSheet.userId)})
        # if not findUser:
        #     print("User not Found")
        #     raise HTTPException(status_code=404, detail="User not found")
        # if findUser: print("found User")
        # Prepare the quiz result document
        quiz_result_doc = {
            "quizId": ObjectId(quizSheet.quizId),
            "user_id": (quizSheet.userId),
            "result": quizSheet.resultScore,
            "resultData": [item.dict() for item in quizSheet.questions],
            "timestamp": datetime.utcnow()
        }
        print(quiz_result_doc)
        # Check if user_quizzes_collection already has an entry
        existing_quiz = await user_quizzes_collection.find_one({
            "_id": ObjectId(quizSheet.quizId),
            "user_id": (quizSheet.userId),
        })

        if existing_quiz:
            # Update existing quiz result
            await user_quizzes_collection.update_one(
                {"_id": existing_quiz["_id"]},
                {"$set": quiz_result_doc},
                
            )
            message = "Quiz result updated successfully"
        else:
            # Insert new quiz result
            await user_quizzes_collection.insert_one(quiz_result_doc)
            message = "Quiz result stored successfully"

        return {"message": message, "response": 200}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

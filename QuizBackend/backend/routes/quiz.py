# routes/quiz.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pydantic import BaseModel, validator
from db.mongodb import user_quizzes_collection
from utils.ai_gemini import generate_quiz_questions
# from bson import ObjectId

router = APIRouter()

class QuizRequest(BaseModel):
    user_id: str
    subject: str
    numQuestions: int
    difficulty: str
    timer: int  # changed to int



@router.post("/create-quiz-questions")
async def create_quiz(quiz: QuizRequest):
    try:
        print(quiz)
        questions = await generate_quiz_questions(quiz.subject, quiz.numQuestions, quiz.difficulty,quiz.timer)

        quiz_doc = {
            "user_id": (quiz.user_id),
            "subject": quiz.subject,
            "numQuestions": quiz.numQuestions,
            "questions": questions,
            "timer" :quiz.timer,
            "difficulty": quiz.difficulty
        }
        print(questions)
        if 'Error' in questions and questions['Error'] == 400:
            return {"quiz_id":404,"subject":quiz.subject, "questions": questions, "numQuestions": quiz.numQuestions, "difficulty": quiz.difficulty, "timer":quiz.timer}
        else:
            result = await user_quizzes_collection.insert_one(quiz_doc)
            return {"quiz_id": str(result.inserted_id),"subject":quiz.subject, "questions": questions, "numQuestions": quiz.numQuestions, "difficulty": quiz.difficulty, "timer":quiz.timer}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))

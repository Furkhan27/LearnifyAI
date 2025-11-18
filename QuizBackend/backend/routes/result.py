# routes/results.py
from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from db.mongodb import user_quizzes_collection
from fastapi.responses import JSONResponse
from utils.ai_gemini import AI_response

router = APIRouter()

@router.get("/results")
async def get_quiz_result(userId: str = Query(...), quizId: str = Query(...)):
    try:
        # Fetch the quiz result from the database
        print( (userId),ObjectId(quizId))
        result = await user_quizzes_collection.find_one({
            "user_id": (userId),
            "_id": ObjectId(quizId)
        })

        if not result:
            raise HTTPException(status_code=404, detail="Result not found.")

        # Calculate score breakdown
        correct_answers = 0
        incorrect_questions = []

        for item in result.get("resultData", []):
            options = item.get("options", [])
            correctOpt = item.get("correctOption")
            selected = item.get("selectedOption")
            question = item.get("question")
    
            # Compare answers
            if correctOpt == selected:
                correct_answers += 1
            else:
                # Generate explanation using Gemini AI
                prompt = (
                    f"Explain briefly why '{correctOpt}' is the correct option "
                    f"for the question '{question}' instead of '{selected}'."
                )

                try:
                    explanation = AI_response(prompt)  # Assuming AI_response is async
                except Exception as ai_err:
                    explanation = f"AI explanation unavailable. Error: {str(ai_err)}"

                incorrect_questions.append({
                    "question": question,
                    "userAnswer": selected,
                    "correctAnswer": correctOpt,
                    "explanation": explanation
                })

        response = {
            "totalQuestions": len(result.get("resultData", [])),
            "correctAnswers": correct_answers,
            "score": correct_answers,
            "incorrectQuestions": incorrect_questions
        }

        return JSONResponse(content=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server Error: {str(e)}")

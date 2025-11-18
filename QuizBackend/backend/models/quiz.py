# backend/models/quiz.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Question(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str

class Answer(BaseModel):
    question_index: int
    selected_option: str
    is_correct: bool

class Result(BaseModel):
    score: int
    answers: List[Answer]

class QuizSession(BaseModel):
    interest: str
    num_questions: int
    difficulty: str
    timer: int
    questions: List[Question]
    results: Optional[Result] = None
    created_at: datetime

class UserQuizDocument(BaseModel):
    user_id: str
    user_email: EmailStr
    quizzes: List[QuizSession] = []

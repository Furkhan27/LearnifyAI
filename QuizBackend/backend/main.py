from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.quiz import router as quiz_router
from routes.quiz_quest import router as quiz_quest_router
from routes.result import router as result_router
from routes.check_result import router as check_result_router
from routes.AIRevision import router as revision_router
from routes.AI_companion import router as ai_router
from routes.chart_realtime import router as chart_realtime
from routes.get_students import router as get_students
app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quiz_router, prefix="/api")
app.include_router(check_result_router, prefix="/api")
app.include_router(quiz_quest_router, prefix="/api")
app.include_router(result_router, prefix="/api")
app.include_router(revision_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(chart_realtime, prefix="/api")
app.include_router(get_students, prefix="/api")

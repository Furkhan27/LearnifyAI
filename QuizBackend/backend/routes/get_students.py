# backend-python/main.py
from fastapi import FastAPI, Query
from fastapi import APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db.stdDB import load_students_df
import pandas as pd
# app = FastAPI(title="LearnifyAI Backend (Python + CSV)")
router = APIRouter()


@router.get("/students")
def get_students(
    school: str | None = Query(None),
    module: str | None = Query(None),
    score_min: float | None = Query(None),
    limit: int = Query(50)
):
    df = load_students_df()

    # Normalize data for consistent matching
    df["school"] = df["school"].astype(str).str.lower().str.strip()
    df["modules_completed"] = df["modules_completed"].astype(str).str.lower().str.strip()

    # Apply filters
    if school:
        df = df[df["school"].str.contains(school.lower().strip(), na=False)]
    if module:
        df = df[df["modules_completed"].str.contains(module.lower().strip(), na=False)]
    if score_min is not None:
        df = df[pd.to_numeric(df["eco_score"], errors="coerce") >= score_min]

    if df.empty:
        return {"message": "No matching students found", "count": 0, "students": []}

    return {
        "count": len(df),
        "students": df.head(limit).to_dict(orient="records")
    }

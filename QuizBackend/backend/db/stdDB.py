# backend/db.py
from dotenv import load_dotenv
import os
import pandas as pd
from typing import Optional
from datetime import datetime

# Load environment variables
load_dotenv()

DATA_DIR = os.getenv("DATA_DIR", "./data")
STUDENTS_FILE = os.getenv("STUDENTS_FILE", "students.csv")
STUDENTS_PATH = os.path.join(DATA_DIR, STUDENTS_FILE)

# Cache for performance
_df_students = None

def load_students_df(force_reload: bool = False) -> pd.DataFrame:
    """
    Load students.csv into a normalized pandas DataFrame.
    Automatically handles missing columns, data types, and formatting.
    """
    global _df_students
    if _df_students is None or force_reload:
        if not os.path.exists(STUDENTS_PATH):
            print(f"⚠️ CSV not found at {STUDENTS_PATH}, returning empty DataFrame")
            _df_students = pd.DataFrame(columns=[
                "id", "name", "school", "class_year",
                "eco_score", "modules_completed",
                "module_completion_pct", "primary_email", "last_activity"
            ])
        else:
            _df_students = pd.read_csv(STUDENTS_PATH, dtype=str)

            # Ensure all required columns exist
            expected_cols = [
                "id", "name", "school", "class_year",
                "eco_score", "modules_completed",
                "module_completion_pct", "primary_email", "last_activity"
            ]
            for c in expected_cols:
                if c not in _df_students.columns:
                    _df_students[c] = ""

            # Convert numeric fields safely
            for col in ["eco_score", "module_completion_pct"]:
                if col in _df_students.columns:
                    _df_students[col] = pd.to_numeric(
                        _df_students[col], errors="coerce"
                    ).fillna(0)
                else:
                    _df_students[col] = 0

            # Parse dates safely
            _df_students["last_activity"] = pd.to_datetime(
                _df_students["last_activity"], errors="coerce"
            )

            # Clean text fields
            for col in ["name", "school", "class_year", "modules_completed", "primary_email"]:
                _df_students[col] = _df_students[col].fillna("").astype(str).str.strip()

    return _df_students.copy()

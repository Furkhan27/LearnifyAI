from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from pymongo import MongoClient
import os
import re
import math

router = APIRouter()

# -------------------- CONFIG --------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "learnify")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "student_stats")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[MONGO_DB]
collection = db[MONGO_COLLECTION]

# -------------------- MODEL --------------------
class QueryRequest(BaseModel):
    query: str
    limit: Optional[int] = 10

# -------------------- FIELD MAPPING --------------------
FIELDS = {
    "studentid": "StudentID",
    "age": "Age",
    "gender": "Gender",
    "ethnicity": "Ethnicity",
    "parentaleducation": "ParentalEducation",
    "studytimeweekly": "StudyTimeWeekly",
    "absences": "Absences",
    "tutoring": "Tutoring",
    "parentalsupport": "ParentalSupport",
    "extracurricular": "Extracurricular",
    "sports": "Sports",
    "music": "Music",
    "volunteering": "Volunteering",
    "gpa": "GPA",
    "gradeclass": "GradeClass"
}

# ------------- HELPERS -------------
def find_field_in_query(q: str) -> Optional[str]:
    low = q.lower()
    for key, field in FIELDS.items():
        if key in low or field.lower() in low:
            return field
    return None

def detect_filter(q: str):
    """Detects numeric filtering intent like 'age more than 18' or 'GPA less than 3'."""
    low = q.lower()
    for key, field in FIELDS.items():
        if key in low or field.lower() in low:
            # Find number and comparison
            m = re.search(rf"{key}|{field.lower()}.*?(more than|greater than|>|less than|<|equal to|=)\s*(\d+(\.\d+)?)", low)
            if m:
                comp = m.group(1)
                num = float(m.group(2))
                if "more" in comp or "greater" in comp or comp == ">":
                    return field, {"$gt": num}
                elif "less" in comp or comp == "<":
                    return field, {"$lt": num}
                elif "equal" in comp or comp == "=":
                    return field, {"$eq": num}
    return None, None

def find_grouping_and_metric(q: str):
    """Fallback to old logic for aggregation queries."""
    low = q.lower()
    # grouping
    m = re.search(r"by\s+([a-zA-Z_ ]+)", low)
    grouping = None
    if m:
        grouping = find_field_in_query(m.group(1))
    # metric
    metric = find_field_in_query(low)
    if not metric:
        metric = "GPA"
    return grouping, metric

# ------------- MAIN ROUTE -------------
@router.post("/generate-chart")
async def query_chart(req: QueryRequest):
    q = req.query.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query text is required")

    # detect filter query first
    field, condition = detect_filter(q)
    if field and condition:
        # filtering case
        docs = list(collection.find({field: condition}).limit(req.limit or 20))
        if not docs:
            return {"ok": False, "error": "No matching students found"}

        # generate a simple histogram (count per GradeClass or Gender)
        group_field = "GradeClass" if "GradeClass" in docs[0] else None
        if group_field:
            buckets = {}
            for d in docs:
                k = str(d.get(group_field, "Unknown"))
                buckets[k] = buckets.get(k, 0) + 1
            labels = list(buckets.keys())
            values = list(buckets.values())
            data = [{"label": k, "value": v} for k, v in buckets.items()]
        else:
            labels = [str(d["StudentID"]) for d in docs]
            values = [d.get(field, 0) for d in docs]
            data = [{"label": l, "value": v} for l, v in zip(labels, values)]

        return {
            "ok": True,
            "chart_type": "Bar",
            "description": f"Students where {field} {list(condition.keys())[0]} {list(condition.values())[0]}",
            "field": field,
            "labels": labels,
            "values": values,
            "data": data,
            "count": len(docs)
        }

    # aggregation (like "average GPA by GradeClass")
    grouping, metric = find_grouping_and_metric(q)
    if grouping:
        pipeline = [
            {"$group": {"_id": f"${grouping}", "value": {"$avg": f"${metric}"}}},
            {"$project": {"_id": 0, "label": {"$ifNull": ["$_id", "Unknown"]}, "value": {"$round": ["$value", 2]}}},
            {"$sort": {"value": -1}},
            {"$limit": req.limit or 10}
        ]
    else:
        pipeline = [{"$group": {"_id": None, "value": {"$avg": f"${metric}"}}}, {"$project": {"label": "Overall", "value": {"$round": ["$value", 2]}}}]

    try:
        docs = list(collection.aggregate(pipeline))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {e}")

    if not docs:
        return {"ok": False, "error": "No data found"}

    labels = [d["label"] for d in docs]
    values = [d["value"] for d in docs]
    data = [{"label": l, "value": v} for l, v in zip(labels, values)]

    return {
        "ok": True,
        "chart_type": "Bar",
        "query": q,
        "metric": metric,
        "grouping": grouping,
        "labels": labels,
        "values": values,
        "data": data
    }

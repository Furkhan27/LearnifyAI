#!/usr/bin/env python3
# scripts/csv_to_mongo.py
import os
from pathlib import Path
import pandas as pd
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv
from tqdm import tqdm
import math

load_dotenv()  # reads .env in current dir

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "learnify")
MONGO_COLLECTION = os.getenv("MONGO_COLLECTION", "student_stats")

CSV_PATH = Path("C:/Users/hafiz/Downloads/archive/synthetic_student_performance.csv")  # adjust filename

# batch size for insert_many (use smaller number for memory-constrained env)
BATCH_SIZE = 1000

def transform_row(row: pd.Series) -> dict:
    """
    Convert a pandas row into the desired Mongo document.
    Adjust field names and types here.
    """
    doc = row.to_dict()
    # Example transformations:
    # - normalize column names (snake_case)
    # - convert numeric strings to numbers
    # - parse dates if present
    # - add derived fields (e.g., year_of_study)
    # e.g.:
    # doc['avg_activities'] = float(doc.get('avg_activities') or 0)
    return doc

def main():
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    coll = db[MONGO_COLLECTION]

    # optional: create indexes for faster grouping/queries
    coll.create_index("major")
    coll.create_index("year_of_study")
    coll.create_index("timestamp")

    total_rows = sum(1 for _ in open(CSV_PATH, "r", encoding="utf-8")) - 1
    # use chunksize to avoid memory spike
    chunksize = 5000
    processed = 0

    for chunk in pd.read_csv(CSV_PATH, chunksize=chunksize, encoding="utf-8"):
        docs = []
        for _, row in chunk.iterrows():
            doc = transform_row(row)
            docs.append(doc)
        # insert in batches
        for i in range(0, len(docs), BATCH_SIZE):
            batch = docs[i:i+BATCH_SIZE]
            coll.insert_many(batch)
            processed += len(batch)
        print(f"Inserted {processed}/{total_rows} rows...")

    print("Done.")
    client.close()

if __name__ == "__main__":
    main()

# utils/ai_gemini.py
import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
# prefer env key, fall back to the existing key if env not set (so it keeps working)
API_KEY = os.getenv("GOOGLE_API_KEY") or "AIzaSyDx2ZHhAehfpGkFhj_50s1zdtwMco3yujU"
genai.configure(api_key=API_KEY)

# ---------- Basic AI text response ----------
def AI_response(prompt: str) -> str:
    """Generate plain text from Gemini"""
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return (getattr(response, "text", "") or "").strip()

# ---------- Topic eligibility check ----------
def is_eligible(topic: str) -> bool:
    """Check if topic can be used for quiz generation"""
    prompt = f"Can you generate quiz questions on the topic '{topic}'? Reply with only 1 (yes) or 0 (no)."
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    text = (getattr(response, "text", "") or "").strip()
    # accept answers starting with 1 or containing a 1 digit
    if not text:
        return False
    first_line = text.splitlines()[0].strip()
    if first_line.startswith("1"):
        return True
    if re.search(r"\b1\b", first_line):
        return True
    return False

# ---------- Quiz question generation ----------
async def generate_quiz_questions(interest: str, num_questions: int, difficulty: str, timer: int):
    """
    Generate quiz questions. Returns:
      - list of {question, options, answer} on success
      - or {"message": "...", "Error": <code>, "raw": "<snippet>"} on failure
    """
    if not is_eligible(interest):
        return {"message": "Not Eligible Topic", "Error": 400}

    prompt = (
        f"Generate {num_questions} multiple-choice quiz questions on '{interest}' with difficulty '{difficulty}'. "
        "Each question should have 4 options and one correct answer. Return the result strictly in JSON. "
        "Acceptable outputs:\n"
        "- A JSON array of objects: [{\"question\":..., \"options\":[...], \"answer\":\"...\"}, ...]\n"
        "- Or an object with key 'quiz' or 'questions' containing that array.\n"
        "Do NOT include any extra explanation or text (but if you must, still put the JSON somewhere)."
    )

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    content = (getattr(response, "text", "") or "").strip()

    # 1) Strip code fences like ```json ... ``` or ``` ... ```
    # remove leading/trailing triple-backtick blocks
    content = re.sub(r"^\s*```(?:json)?\s*", "", content, flags=re.IGNORECASE)
    content = re.sub(r"\s*```\s*$", "", content)

    # 2) Try direct json parse
    try:
        parsed = json.loads(content)
    except Exception:
        # 3) If parse failed, try to extract first balanced JSON block { ... } or [ ... ]
        m = re.search(r"(\{(?:.|\s)*\}|\[(?:.|\s)*\])", content, flags=re.DOTALL)
        parsed = None
        if m:
            block = m.group(1)
            try:
                parsed = json.loads(block)
            except Exception:
                # try simple fixes: single -> double quotes, remove trailing commas
                fixed = block.replace("'", '"')
                fixed = re.sub(r",\s*([}\]])", r"\1", fixed)
                try:
                    parsed = json.loads(fixed)
                except Exception:
                    parsed = None

    # 4) Normalize parsed result into a list of question dicts
    questions = []
    if parsed:
        if isinstance(parsed, list):
            # assume list of question objects
            questions = parsed
        elif isinstance(parsed, dict):
            # check common keys
            if "quiz" in parsed and isinstance(parsed["quiz"], list):
                questions = parsed["quiz"]
            elif "questions" in parsed and isinstance(parsed["questions"], list):
                questions = parsed["questions"]
            else:
                # maybe the dict itself is the item container (rare) -> try to find list value
                for v in parsed.values():
                    if isinstance(v, list):
                        # check if list items look like question objects
                        if v and isinstance(v[0], dict) and "question" in v[0]:
                            questions = v
                            break

    # 5) Validate minimal shape and trim to requested count
    valid = []
    for item in questions:
        if not isinstance(item, dict):
            continue
        q = item.get("question") or item.get("q")
        opts = item.get("options") or item.get("choices")
        ans = item.get("answer") or item.get("correct")
        if isinstance(q, str) and isinstance(opts, list) and ans:
            # coerce options to strings
            opts_clean = [str(o) for o in opts]
            valid.append({"question": q.strip(), "options": opts_clean, "answer": str(ans).strip()})
        # stop when reached requested amount
        if len(valid) >= num_questions:
            break

    if valid:
        return valid[:num_questions]

    # 6) If nothing valid, return error with raw for debugging
    return {"message": "Failed to parse AI response as JSON", "Error": 500, "raw": content[:2000]}

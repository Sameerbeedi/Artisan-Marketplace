# backend/src/ai/classify_product.py
from fastapi import APIRouter, UploadFile, Form
import google.generativeai as genai
import base64
import os

router = APIRouter()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("/classify-product")
async def classify_product(
    productTitle: str = Form(...),
    file: UploadFile = None
):
    try:
        if not file:
            return {"error": "No file uploaded"}
        
        # Read image as base64
        content = await file.read()
        b64_image = base64.b64encode(content).decode("utf-8")

        # Load Gemini model
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Ask Gemini to classify
        result = model.generate_content([
            "Classify this product image into one of: painting, sculpture, textile, jewelry, pottery, other.",
            {
                "inline_data": {
                    "mime_type": file.content_type,
                    "data": b64_image
                }
            }
        ])

        output = result.text.lower()
        category = "other"
        if "painting" in output: category = "painting"
        elif "sculpture" in output: category = "sculpture"
        elif "textile" in output: category = "textile"
        elif "jewelry" in output: category = "jewelry"
        elif "pottery" in output: category = "pottery"

        return {"category": category}
    except Exception as e:
        return {"error": str(e)}

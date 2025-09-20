from fastapi import APIRouter, UploadFile, Form, HTTPException
import httpx
import google.generativeai as genai
import base64
import subprocess
import tempfile
import os
import requests

from backend.data_types_class import (
    CatalogProductInput, CatalogProductOutput,
    HeritageStorytellingInput, HeritageStorytellingOutput,
    GenerateProcessDocumentationInput, GenerateProcessDocumentationOutput,
    ProductStorytellingInput, ProductStorytellingOutput,
    AnalyzeProductPhotoInput, AnalyzeProductPhotoOutput,
    IdentifyTechniqueInput, IdentifyTechniqueOutput,
    RecommendationRequest, RecommendationResponse,
    PriceEstimationInput, PriceEstimationOutput
)
from backend.src.ai.flows.automated_product_catalog import catalog_product
from backend.src.ai.flows.heritage_storytelling import generate_heritage_story
from backend.src.ai.flows.process_documentation import generate_process_documentation
from backend.src.ai.flows.product_storytelling import generate_product_story
from backend.src.ai.flows.quality_assessment import analyze_product_photo
from backend.src.ai.flows.technique_identification import identify_technique
from backend.src.ai.flows.price_estimation import generate_price_estimation
from backend.src.lib.data import Products as products

# 🔹 Firebase
from backend.firebase_config import db
from firebase_admin import storage, firestore

# ✅ router must be defined BEFORE any endpoints
router = APIRouter()

# -----------------------------------
# AI Flows
# -----------------------------------
@router.post("/catalog_product", response_model=CatalogProductOutput)
async def catalog_product_endpoint(input: CatalogProductInput):
    return await catalog_product(input)

@router.post("/generate_heritage_story", response_model=HeritageStorytellingOutput)
async def generate_heritage_story_endpoint(input: HeritageStorytellingInput):
    return await generate_heritage_story(input)

@router.post("/generate_process_documentation", response_model=GenerateProcessDocumentationOutput)
async def generate_process_documentation_endpoint(input: GenerateProcessDocumentationInput):
    return await generate_process_documentation(input)

@router.post("/generate_product_story", response_model=ProductStorytellingOutput)
async def generate_product_story_endpoint(input: ProductStorytellingInput):
    return await generate_product_story(input)

@router.post("/analyze_product_photo", response_model=AnalyzeProductPhotoOutput)
async def analyze_product_photo_endpoint(input: AnalyzeProductPhotoInput):
    return await analyze_product_photo(input)

@router.post("/identify_technique", response_model=IdentifyTechniqueOutput)
async def identify_technique_endpoint(input: IdentifyTechniqueInput):
    return await identify_technique(input)

@router.post("/estimate_price", response_model=PriceEstimationOutput)
async def estimate_price_endpoint(input: PriceEstimationInput):
    return await generate_price_estimation(input)


# -----------------------------------
# Product Classification (Hybrid)
# -----------------------------------
PAINTING_KEYWORDS = ["painting", "art", "canvas", "mural", "portrait"]

@router.post("/classify_product")
async def classify_product(
    productTitle: str = Form(...),
    file: UploadFile = None
):
    if not file:
        return {"success": False, "error": "No file uploaded"}

    content = await file.read()
    b64_image = base64.b64encode(content).decode("utf-8")

    model = genai.GenerativeModel("gemini-1.5-flash")
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
    if "painting" in output:
        category = "painting"
    elif "sculpture" in output:
        category = "sculpture"
    elif "textile" in output:
        category = "textile"
    elif "jewelry" in output:
        category = "jewelry"
    elif "pottery" in output:
        category = "pottery"

    title_check = any(kw in productTitle.lower() for kw in PAINTING_KEYWORDS)
    is_painting = category == "painting" or title_check

    return {
        "success": True,
        "category": category,
        "isPainting": is_painting,
        "raw": output
    }


# -----------------------------------
# Firestore Integration
# -----------------------------------
@router.post("/save_product_draft")
async def save_product_draft(product: dict):
    """
    Save AI-processed product details (draft).
    Ensures `category`, `isPainting`, and `story` are always present.
    """
    category = product.get("category", "other")
    is_painting = product.get("isPainting", False)

    # Normalize story field
    story_text = product.get("story") or product.get("creativeStory") or ""

    doc_ref = db.collection("products").document()  # generate a new doc ID
    doc_ref.set({
        **product,
        "category": category,
        "isPainting": is_painting,
        "story": story_text,
        "status": "draft",
        "created_at": firestore.SERVER_TIMESTAMP,
    })
    return {"id": doc_ref.id, "status": "draft_saved"}


@router.get("/get_product/{product_id}")
async def get_product(product_id: str):
    """
    Fetch a single product from Firestore by ID.
    """
    doc = db.collection("products").document(product_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc.to_dict()


@router.post("/publish_product/{product_id}")
async def publish_product(product_id: str):
    ref = db.collection("products").document(product_id)
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="Product not found")

    ref.update({
        "status": "published",
        "published_at": firestore.SERVER_TIMESTAMP
    })
    return {"id": product_id, "status": "published"}


# -----------------------------------
# AR Model Generation (Blender + Firebase)
# -----------------------------------
@router.post("/generate_ar_model/{product_id}")
async def generate_ar_model(product_id: str):
    doc = db.collection("products").document(product_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
    
    data = doc.to_dict()
    if not data.get("isPainting", False):
        return {"success": False, "message": "Not a painting, skipping AR generation"}
    
    image_url = data.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail="No image_url found for product")

    resp = requests.get(image_url)
    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to download image")
    
    tmp_dir = tempfile.mkdtemp()
    image_path = os.path.join(tmp_dir, "input.jpg")
    glb_path = os.path.join(tmp_dir, "output.glb")

    with open(image_path, "wb") as f:
        f.write(resp.content)

    blender_exe = "/Applications/Blender.app/Contents/MacOS/Blender"
    script_path = os.path.join("backend", "blender_scripts", "generate_canvas_glb.py")
    
    try:
        result = subprocess.run(
            [blender_exe, "-b", "-P", script_path, "--", image_path, glb_path],
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Blender stdout:", result.stdout)
        print("✅ Blender stderr:", result.stderr)
    except subprocess.CalledProcessError as e:
        print("❌ Blender failed:", e.stderr)
        raise HTTPException(status_code=500, detail=f"Blender failed: {e.stderr or e.stdout}")

    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"products/{product_id}.glb")
        blob.upload_from_filename(glb_path)
        blob.make_public()
        glb_url = blob.public_url
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase upload failed: {str(e)}")

    db.collection("products").document(product_id).update({
        "ar_model_url": glb_url,
        "status": "ar_ready",
        "updated_at": firestore.SERVER_TIMESTAMP
    })

    return {"success": True, "ar_model_url": glb_url}


# -----------------------------------
# Utility Endpoints
# -----------------------------------
@router.get("/expensive-products")
async def get_expensive_products():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://fakestoreapi.com/products")
        products_list = response.json()
    return [p for p in products_list if p.get("price", 0) > 100]


# -----------------------------------
# Recommendation Endpoint
# -----------------------------------
@router.post("/recommend", response_model=RecommendationResponse)
async def personalized_recommendation(req: RecommendationRequest):
    user_prompt = req.userPrompt.lower()
    user_preferences = req.userPreferences
    user_history = req.userHistory or []
    max_results = req.maxResults or 5
    exclude_products = req.excludeProducts or []

    available_products = [p for p in products if p["id"] not in exclude_products]

    if user_preferences and user_preferences.categories:
        available_products = [
            p for p in available_products
            if any(cat.lower() in p["category"].lower() for cat in user_preferences.categories)
        ]

    if user_preferences and user_preferences.priceRange:
        min_price = user_preferences.priceRange.min
        max_price = user_preferences.priceRange.max
        available_products = [
            p for p in available_products if min_price <= p["price"] <= max_price
        ]

    if user_preferences and user_preferences.preferredArtisans:
        available_products = [
            p for p in available_products
            if any(artisan.lower() in p["artisan"].lower() for artisan in user_preferences.preferredArtisans)
        ]

    recommended_products = []
    for p in available_products:
        score = 0.6
        if any(word in p["name"].lower() for word in user_prompt.split()):
            score += 0.1
        if any(word in p["category"].lower() for word in user_prompt.split()):
            score += 0.1
        if any(word in p.get("aiHint", "").lower() for word in user_prompt.split()):
            score += 0.1
        recommended_products.append({**p, "relevanceScore": min(score, 1.0)})

    recommended_products = sorted(
        recommended_products, key=lambda x: x["relevanceScore"], reverse=True
    )[:max_results]

    return {
        "products": recommended_products,
        "reasoning": "Products selected based on keyword matching and user preferences.",
        "confidence": 0.7,
        "categories": list({p["category"] for p in recommended_products}),
        "suggestedFilters": {}
    }

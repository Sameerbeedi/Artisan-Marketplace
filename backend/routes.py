from fastapi import APIRouter, UploadFile, Form, HTTPException, Request, Body
import httpx
import google.generativeai as genai
import base64
import subprocess
import tempfile
import os
import requests
import shutil
from PIL import Image
from firebase_config import db

from data_types_class import (
    CatalogProductInput, CatalogProductOutput,
    HeritageStorytellingInput, HeritageStorytellingOutput,
    GenerateProcessDocumentationInput, GenerateProcessDocumentationOutput,
    ProductStorytellingInput, ProductStorytellingOutput,
    AnalyzeProductPhotoInput, AnalyzeProductPhotoOutput,
    IdentifyTechniqueInput, IdentifyTechniqueOutput,
    RecommendationRequest, RecommendationResponse,
    PriceEstimationInput, PriceEstimationOutput
)
from src.ai.flows.automated_product_catalog import catalog_product
from src.ai.flows.heritage_storytelling import generate_heritage_story
from src.ai.flows.process_documentation import generate_process_documentation
from src.ai.flows.product_storytelling import generate_product_story
from src.ai.flows.quality_assessment import analyze_product_photo
from src.ai.flows.technique_identification import identify_technique
from src.ai.flows.price_estimation import generate_price_estimation
from src.lib.data import Products as products

# In-memory store for when Firebase is not available
products_store = {}

# Initialize mock products for testing
def initialize_mock_products():
    """Initialize mock products for testing AR functionality"""
    # Get backend URL dynamically for local development
    host = os.getenv("BACKEND_URL", "http://localhost:9079")
    
    mock_products = {
        "mock_draft_1": {
            "id": "mock_draft_1",
            "title": "Traditional Ceramic Vase",
            "category": "pottery",
            "isPainting": False,
            "story": "A beautiful handcrafted ceramic vase made using traditional techniques passed down through generations.",
            "image_url": f"{host}/ar_models/mock_draft_1.glb",
            "ar_model_url": f"{host}/ar_models/mock_draft_1.glb",
            "status": "published",
            "price": {"min": 150, "max": 250},
            "finalPrice": 200,
            "technique": "Traditional pottery wheel",
            "materials": "Clay, ceramic glaze",
            "dimensions": "Height: 25cm, Width: 15cm"
        },
        "mock_draft_2": {
            "id": "mock_draft_2", 
            "title": "Decorative Ceramic Bowl",
            "category": "pottery",
            "isPainting": False,
            "story": "An elegant ceramic bowl featuring intricate hand-painted patterns.",
            "image_url": f"{host}/ar_models/mock_draft_2.glb",
            "ar_model_url": f"{host}/ar_models/mock_draft_2.glb",
            "status": "published",
            "price": {"min": 80, "max": 120},
            "finalPrice": 100,
            "technique": "Hand-painted ceramics",
            "materials": "Clay, ceramic paints",
            "dimensions": "Diameter: 20cm, Height: 8cm"
        }
    }
    
    for product_id, product_data in mock_products.items():
        if product_id not in products_store:
            products_store[product_id] = product_data
    
    print(f"🔥 Initialized {len(mock_products)} mock products")

# Initialize mock products on startup
initialize_mock_products()

# 🔹 Firebase
from firebase_config import db, bucket
from firebase_admin import storage, firestore

# ✅ router must be defined BEFORE any endpoints
router = APIRouter()
# -----------------------------------
# Health check
# -----------------------------------
@router.get("/health")
async def health():
    return {"status": "ok"}

@router.get("/debug/products")
async def debug_products():
    """Debug endpoint to check loaded products"""
    return {
        "products_count": len(products_store),
        "product_ids": list(products_store.keys()),
        "mock_draft_1_exists": "mock_draft_1" in products_store,
        "products_store_content": products_store
    }

@router.post("/debug/init-products")
async def force_init_products():
    """Force initialize mock products"""
    initialize_mock_products()
    return {
        "message": "Products initialized",
        "products_count": len(products_store),
        "product_ids": list(products_store.keys())
    }


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
    if not db:
        # Firebase not available - store in memory and return mock ID
        product_id = f"mock_draft_{len(products_store) + 1}"
        
        # Store the actual product data with all fields
        products_store[product_id] = {
            **product,
            "category": product.get("category", "other"),
            "isPainting": product.get("isPainting", False),
            "story": product.get("story") or product.get("creativeStory") or "",
            "status": "draft",
            "id": product_id
        }
        
        print(f"💾 Stored product {product_id} in memory with image_url: {product.get('image_url')}")
        return {"id": product_id, "status": "draft_saved_without_firebase"}
        
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
    if not db:
        # Firebase not available - check in-memory store
        if product_id in products_store:
            return products_store[product_id]
        else:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found in local store")
        
    doc = db.collection("products").document(product_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
    return doc.to_dict()


@router.post("/publish_product/{product_id}")
async def publish_product(product_id: str, body: dict = Body(...)):
    user_price = body.get("price")
    if not user_price or user_price <= 0:
        raise HTTPException(status_code=400, detail="Invalid price")

    if not db:
        return {"id": product_id, "status": "published_without_firebase", "finalPrice": user_price}

    ref = db.collection("products").document(product_id)
    doc = ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")

    data = doc.to_dict()
    ai_price = data.get("price", {})

    ref.update({
        "status": "published",
        "finalPrice": user_price,  # 👈 user’s quoted price
        "price": ai_price,        # 👈 keep AI’s range intact
        "published_at": firestore.SERVER_TIMESTAMP,
    })

    updated_doc = ref.get().to_dict()
    return {
        "id": product_id,
        "status": updated_doc.get("status"),
        "finalPrice": updated_doc.get("finalPrice"),
        "price": updated_doc.get("price"),
        "published_at": updated_doc.get("published_at")
    }


# -----------------------------------
# AR Model Generation (Blender + Firebase)
# -----------------------------------
@router.post("/generate_ar_model/{product_id}")
async def generate_ar_model(product_id: str, request: Request):
    if not db:
        # Firebase not available - check if we have locally saved product data
        print(f"🔥 Mock mode: AR generation for product: {product_id}")
        
        # Try to get actual product data from our in-memory store
        if product_id in products_store:
            product_data = products_store[product_id]
            image_url = product_data.get("image_url")
            
            if not image_url:
                raise HTTPException(status_code=400, detail="No image_url found for product")
                
            if not product_data.get("isPainting", False):
                return {"success": False, "message": "Not a painting, skipping AR generation"}
                
            print(f"🎯 Using actual uploaded image: {image_url}")
            return await generate_with_blender(product_id, image_url, product_data, request)
        else:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found in local store")
    
    doc = db.collection("products").document(product_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Product not found")
    
    data = doc.to_dict()
    if not data.get("isPainting", False):
        return {"success": False, "message": "Not a painting, skipping AR generation"}
    
    image_url = data.get("image_url")
    if not image_url:
        raise HTTPException(status_code=400, detail="No image_url found for product")

    print(f"🎯 Generating AR model for product {product_id}")
    print(f"🖼️ Using image: {image_url}")

    # Use Blender for AR generation
    return await generate_with_blender(product_id, image_url, data, request)

async def generate_with_blender(product_id: str, image_url: str, product_data: dict, request: Request):
    """Generate AR model using Blender"""
    tmp_dir = tempfile.mkdtemp()
    raw_image_path = os.path.join(tmp_dir, "input")
    glb_path = os.path.join(tmp_dir, "output.glb")

    # Handle different image sources
    if image_url.startswith("file://"):
        # Local file - copy directly
        local_path = image_url.replace("file://", "")
        raw_jpg_path = raw_image_path + ".jpg"
        try:
            shutil.copy2(local_path, raw_jpg_path)
            print(f"✅ Using local file: {local_path}")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to access local file: {e}")
    else:
        # Download from URL
        resp = requests.get(image_url)
        if resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to download image")
        
        raw_jpg_path = raw_image_path + ".jpg"
        with open(raw_jpg_path, "wb") as f:
            f.write(resp.content)

    # Normalize to PNG for robust glTF texturing
    png_image_path = raw_image_path + ".png"
    try:
        with Image.open(raw_jpg_path) as img:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.save(png_image_path, format="PNG")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process image: {e}")

    # Platform-specific Blender executable paths
    import platform
    system = platform.system()
    
    if system == "Windows":
        # Common Windows Blender installation paths
        possible_paths = [
            "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
            "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
            "C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe",
            "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe",
        ]
        blender_exe = next((p for p in possible_paths if os.path.exists(p)), None)
        if not blender_exe:
            which_blender = shutil.which("blender")
            if which_blender:
                blender_exe = which_blender
        if not blender_exe:
            raise HTTPException(status_code=500, detail="Blender not found. Install Blender 4.x or add it to PATH")
    elif system == "Darwin":  # macOS
        blender_exe = "/Applications/Blender.app/Contents/MacOS/Blender"
    else:  # Linux (including Docker containers)
        # Check common Docker/Linux paths first
        possible_linux_paths = [
            "/usr/local/bin/blender",  # Docker symlink location
            "/opt/blender/blender",    # Docker installation location
            "blender"                  # System PATH
        ]
        blender_exe = next((p for p in possible_linux_paths if os.path.exists(p) or shutil.which(p)), None)
        if not blender_exe:
            blender_exe = "blender"  # Fallback to PATH
    
    # Use absolute path to the Blender script to avoid CWD issues
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "blender_scripts", "generate_canvas_glb.py"))
    
    try:
        print(f"🎯 Running Blender command: {blender_exe}")
        print(f"📁 Script path: {script_path}")
        print(f"🖼️ Image path (PNG): {png_image_path}")
        print(f"📦 Output path: {glb_path}")
        
        result = subprocess.run(
            [blender_exe, "-b", "-P", script_path, "--", png_image_path, glb_path],
            check=True,
            capture_output=True,
            text=True
        )
        print("✅ Blender stdout:", result.stdout)
        print("✅ Blender stderr:", result.stderr)
        
        # Verify the GLB file was actually created
        if not os.path.exists(glb_path):
            raise HTTPException(status_code=500, detail="GLB file was not generated by Blender")
            
        file_size = os.path.getsize(glb_path)
        print(f"✅ GLB file created successfully, size: {file_size} bytes")
        
    except subprocess.CalledProcessError as e:
        print("❌ Blender failed:", e.stderr)
        print("❌ Blender stdout:", e.stdout)
        raise HTTPException(status_code=500, detail=f"Blender failed: {e.stderr or e.stdout}")
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail=f"Blender executable not found at: {blender_exe}")

    try:
        if bucket:
            blob = bucket.blob(f"products/{product_id}.glb")
            blob.upload_from_filename(glb_path)
            blob.make_public()
            glb_url = blob.public_url
        else:
            # Firebase not available - create a local file URL for testing
            # Copy the GLB to a static location in the backend
            static_dir = os.path.join(os.path.dirname(__file__), "ar_models")
            os.makedirs(static_dir, exist_ok=True)
            static_glb_path = os.path.join(static_dir, f"{product_id}.glb")
            shutil.copy2(glb_path, static_glb_path)
            # Use a local URL (you'd need to serve static files)
            # Generate URL based on environment
            host = request.headers.get("host", "localhost:9079")
            
            # Force HTTPS for production deployments (Render.com, Railway, etc.)
            if "onrender.com" in host or "railway.app" in host or "herokuapp.com" in host:
                backend_url = f"https://{host}"
            else:
                backend_url = os.getenv("BACKEND_URL", f"http://{host}")
                
            glb_url = f"{backend_url}/ar_models/{product_id}.glb"
            print(f"⚠️ Firebase Storage not available. GLB saved locally: {static_glb_path}")
            print(f"🔗 Generated GLB URL: {glb_url}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File storage failed: {str(e)}")

    if db:
        db.collection("products").document(product_id).update({
            "ar_model_url": glb_url,
            "status": "ar_ready",
            "updated_at": firestore.SERVER_TIMESTAMP
        })
    else:
        print(f"⚠️ Firebase not available. AR model URL: {glb_url}")

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

products_store = {}  # fallback in-memory store

@router.get("/products")
async def get_products():
    if not db:
        return list(products_store.values())

    products_ref = db.collection("products").where("status", "==", "published")
    docs = products_ref.stream()

    products = []
    for doc in docs:
        data = doc.to_dict()

        # Handle price flexibly
        price = None
        if "finalPrice" in data:
            price = data["finalPrice"]
        elif isinstance(data.get("price"), dict):
            price = data["price"].get("min")
        elif isinstance(data.get("price"), (int, float)):
            price = data["price"]

        products.append({
            "id": doc.id,
            "name": data.get("title"),
            "price": price,
            "category": data.get("category"),
            "artisan": data.get("artisan", "Unknown"),
            "image": data.get("image_url", "/images/placeholder.png"),
            "description": data.get("description") or data.get("story", ""),
        })

    return products

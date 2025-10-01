# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
from dotenv import load_dotenv
import google.generativeai as genai

# ---------------------------
# Load environment variables
# ---------------------------
# Use backend/env.local (your file name)
env_path = os.path.join(os.path.dirname(__file__), "env.local")
load_dotenv(dotenv_path=env_path)

# Configure Gemini API
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("❌ GOOGLE_API_KEY not found. Please set it in backend/env.local")
genai.configure(api_key=api_key)

# ---------------------------
# Create FastAPI app
# ---------------------------
app = FastAPI(
    title="Artisan Marketplace API",
    description="APIs for product catalog, storytelling, recommendations, and analysis",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins to support Vercel preview deployments
    allow_credentials=False,  # Must be False when using "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Import and include routes
try:
    from routes import router as api_router
except ImportError:
    from routes import router as api_router

app.include_router(api_router)

# Static file serving for AR models and uploaded images
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

ar_models_dir = os.path.join(os.path.dirname(__file__), "ar_models")
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")

# Custom route for GLB files with proper headers
@app.get("/ar_models/{filename}")
async def serve_glb_file(filename: str):
    file_path = os.path.join(ar_models_dir, filename)
    if os.path.exists(file_path) and filename.endswith('.glb'):
        return FileResponse(
            file_path,
            media_type="model/gltf-binary",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=31536000",  # Cache for 1 year
            }
        )
    return {"error": "File not found"}

# Custom route for uploaded images with proper headers
@app.get("/uploads/{filename}")
async def serve_uploaded_image(filename: str):
    file_path = os.path.join(uploads_dir, filename)
    if os.path.exists(file_path):
        # Determine media type based on file extension
        media_type = "image/jpeg"
        if filename.endswith('.png'):
            media_type = "image/png"
        elif filename.endswith('.webp'):
            media_type = "image/webp"
        elif filename.endswith('.gif'):
            media_type = "image/gif"
        
        return FileResponse(
            file_path,
            media_type=media_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Cache-Control": "public, max-age=86400",  # Cache for 1 day
            }
        )
    return {"error": "File not found"}

# ---------------------------
# Uvicorn entrypoint
# ---------------------------
if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", 9079))
    except ValueError:
        print("Invalid PORT environment variable, using default 9079")
        port = 9079

    print(f"🚀 Starting Artisan Marketplace API on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

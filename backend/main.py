# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
try:
    from backend.routes import router as api_router
except ImportError:
    from routes import router as api_router

# Create FastAPI app
app = FastAPI(
    title="Artisan Marketplace API",
    description="APIs for product catalog, storytelling, recommendations, and analysis",
    version="1.0.0"
)

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(api_router)

# Run the app with Uvicorn when executed directly
if __name__ == "__main__":
    try:
        port = int(os.environ.get("PORT", 9079))
    except ValueError:
        print("Invalid PORT environment variable, using default 9079")
        port = 9079
    
    print(f"Starting Artisan Marketplace API on port {port}")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)

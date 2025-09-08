# backend/main.py

from fastapi import FastAPI
from backend.routes import router as api_router 
import os
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Artisan Marketplace API",
    description="APIs for product catalog, storytelling, recommendations, and analysis",
    version="1.0.0"
)

# Include routes
app.include_router(api_router)

# Run the app with Uvicorn when executed directly
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 9079))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)

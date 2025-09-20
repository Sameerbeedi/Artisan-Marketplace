"""
Simplified backend server for AR integration testing
Focuses only on the essential AR generation functionality
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import subprocess
import tempfile
import os
import uuid
from pathlib import Path
from PIL import Image

app = FastAPI(title="Artisan Marketplace - AR Generator")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create output directory
OUTPUT_DIR = Path("ar_models")
OUTPUT_DIR.mkdir(exist_ok=True)

def find_blender_executable():
    """Find Blender executable on the system"""
    possible_paths = [
        "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
        "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
        "C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    raise FileNotFoundError("Blender executable not found")

@app.get("/")
async def root():
    return {"message": "Artisan Marketplace AR Generator API"}

@app.post("/api/generate-ar")
async def generate_ar_model(file: UploadFile = File(...)):
    """Generate AR model from uploaded image"""
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Find Blender
        blender_exe = find_blender_executable()
        
        # Create unique filenames
        unique_id = str(uuid.uuid4())
        
        # Save uploaded image
        image_ext = file.filename.split('.')[-1].lower() if '.' in file.filename else 'png'
        raw_image_path = OUTPUT_DIR / f"input_{unique_id}.{image_ext}"
        with open(raw_image_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Always convert to PNG to ensure glTF texture compatibility
        png_image_path = OUTPUT_DIR / f"input_{unique_id}.png"
        try:
            with Image.open(raw_image_path) as img:
                # Convert to RGB to avoid issues with P/LA modes
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGB")
                img.save(png_image_path, format="PNG")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process image: {e}")

        # Generate output path
        glb_path = OUTPUT_DIR / f"model_{unique_id}.glb"

        # Resolve absolute paths for Blender
        script_path = os.path.abspath(Path("backend") / "blender_scripts" / "generate_canvas_glb.py")
        png_image_path = os.path.abspath(png_image_path)
        glb_abs_path = os.path.abspath(glb_path)

        print(f"🔄 Running Blender: {blender_exe}")
        print(f"📄 Script: {script_path}")
        print(f"🖼️ Image: {png_image_path}")
        print(f"📦 Output: {glb_abs_path}")

        result = subprocess.run(
            [blender_exe, "-b", "-P", str(script_path), "--", str(png_image_path), str(glb_abs_path)],
            capture_output=True,
            text=True,
            check=True
        )

        print(f"✅ Blender stdout: {result.stdout}")
        if result.stderr:
            print(f"⚠️ Blender stderr: {result.stderr}")

        # Verify output file exists
        if not os.path.exists(glb_abs_path):
            raise HTTPException(status_code=500, detail="Failed to generate AR model")

        # Return the model file
        return FileResponse(
            path=str(glb_abs_path),
            media_type="model/gltf-binary",
            filename=f"ar_model_{unique_id}.glb"
        )
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Blender execution failed:")
        print(f"   Return code: {e.returncode}")
        print(f"   STDOUT: {e.stdout}")
        print(f"   STDERR: {e.stderr}")
        raise HTTPException(
            status_code=500, 
            detail=f"Blender execution failed: {e.stderr}"
        )
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"AR generation failed: {str(e)}"
        )
    finally:
        # Clean up input file
        for p in [locals().get('raw_image_path'), locals().get('png_image_path')]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except:
                    pass

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    try:
        blender_exe = find_blender_executable()
        return {
            "status": "healthy",
            "blender_path": blender_exe,
            "message": "AR generation service is ready"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Artisan Marketplace AR Generator...")
    print("📍 API will be available at: http://localhost:8000")
    print("📖 Documentation at: http://localhost:8000/docs")
    uvicorn.run(app, host="0.0.0.0", port=8000)
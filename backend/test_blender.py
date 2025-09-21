#!/usr/bin/env python3
"""
Quick test for Blender AR generation
"""
import os
import tempfile
import subprocess
import requests
from PIL import Image

def test_blender_ar():
    print("🎯 Testing Blender AR generation...")
    
    # Create temp files
    tmp_dir = tempfile.mkdtemp()
    print(f"📁 Using temp directory: {tmp_dir}")
    
    # Use existing paint.jpg file
    existing_image = os.path.join(os.path.dirname(__file__), "paint.jpg")
    if not os.path.exists(existing_image):
        print(f"❌ Test image not found: {existing_image}")
        return
    
    print(f"✅ Using existing test image: {existing_image}")
    
    # Copy and convert to PNG
    png_image_path = os.path.join(tmp_dir, "input.png")
    glb_path = os.path.join(tmp_dir, "output.glb")
    
    # Convert to PNG
    try:
        with Image.open(existing_image) as img:
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")
            img.save(png_image_path, format="PNG")
        print("✅ Converted image to PNG")
    except Exception as e:
        print(f"❌ Failed to convert image: {e}")
        return
    
    # Test Blender
    blender_exe = "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe"
    script_path = os.path.join(os.path.dirname(__file__), "blender_scripts", "generate_canvas_glb.py")
    
    print(f"🎨 Blender path: {blender_exe}")
    print(f"📜 Script path: {script_path}")
    print(f"🖼️ Image path: {png_image_path}")
    print(f"📦 Output path: {glb_path}")
    
    if not os.path.exists(blender_exe):
        print(f"❌ Blender not found at: {blender_exe}")
        return
        
    if not os.path.exists(script_path):
        print(f"❌ Script not found at: {script_path}")
        return
    
    try:
        print("🚀 Running Blender...")
        result = subprocess.run(
            [blender_exe, "-b", "-P", script_path, "--", png_image_path, glb_path],
            check=True,
            capture_output=True,
            text=True,
            timeout=60  # 60 second timeout
        )
        print("✅ Blender completed successfully!")
        print("📤 Blender stdout:")
        print(result.stdout)
        if result.stderr:
            print("⚠️ Blender stderr:")
            print(result.stderr)
            
        # Check if GLB was created
        if os.path.exists(glb_path):
            size = os.path.getsize(glb_path)
            print(f"✅ GLB file created: {glb_path} ({size} bytes)")
        else:
            print("❌ GLB file was not created")
            
    except subprocess.TimeoutExpired:
        print("❌ Blender timed out after 60 seconds")
    except subprocess.CalledProcessError as e:
        print(f"❌ Blender failed with return code {e.returncode}")
        print("📤 Stdout:", e.stdout)
        print("📤 Stderr:", e.stderr)
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_blender_ar()
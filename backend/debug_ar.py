#!/usr/bin/env python3
"""
Simple test script to debug AR generation issues
"""

import requests
import os
import tempfile
from PIL import Image

def test_image_processing(image_input):
    """Test if we can download and process the uploaded image"""
    print(f"🧪 Testing image processing for: {image_input}")
    
    try:
        # Check if it's a local file path or URL
        if os.path.exists(image_input):
            print("📁 Processing local file...")
            # It's a local file
            with open(image_input, "rb") as f:
                content = f.read()
            print(f"✅ Read local file, size: {len(content)} bytes")
            
            # Try to open with PIL to verify it's a valid image
            with Image.open(image_input) as img:
                print(f"✅ Valid image: {img.size} pixels, format: {img.format}")
                
            return True
        else:
            print("🌐 Processing URL...")
            # Download the image
            resp = requests.get(image_input)
            if resp.status_code != 200:
                print(f"❌ Failed to download image: {resp.status_code}")
                return False
            
            print(f"✅ Downloaded image, size: {len(resp.content)} bytes")
            
            # Save to temp file
            tmp_dir = tempfile.mkdtemp()
            image_path = os.path.join(tmp_dir, "test_image.jpg")
            
            with open(image_path, "wb") as f:
                f.write(resp.content)
            
            # Try to open with PIL to verify it's a valid image
            with Image.open(image_path) as img:
                print(f"✅ Valid image: {img.size} pixels, format: {img.format}")
                print(f"📁 Saved to: {image_path}")
                
            return True
        
    except Exception as e:
        print(f"❌ Error processing image: {e}")
        return False

def check_blender_installation():
    """Check if Blender is installed on Windows"""
    import platform
    
    if platform.system() == "Windows":
        possible_paths = [
            "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
            "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
            "C:\\Program Files\\Blender Foundation\\Blender 3.6\\blender.exe", 
            "C:\\Program Files\\Blender Foundation\\Blender\\blender.exe",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                print(f"✅ Found Blender at: {path}")
                return path
        
        print("❌ Blender not found in common installation paths")
        print("💡 You can download Blender from: https://www.blender.org/download/")
        return None
    else:
        print("ℹ️ Non-Windows system - Blender paths may vary")
        return None

if __name__ == "__main__":
    print("🔍 AR Generation Debug Tool")
    print("=" * 50)
    
    # Check Blender installation
    blender_path = check_blender_installation()
    
    # Test with a sample image URL (you can replace this with your actual image URL)
    test_input = input("📝 Enter the image URL or local file path to test (or press Enter for demo): ").strip()
    
    if not test_input:
        test_input = "https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Test+Image"
        print(f"🎨 Using demo image: {test_input}")
    
    success = test_image_processing(test_input)
    
    if success and blender_path:
        print("✅ Image processing works and Blender is available!")
        print("🚀 AR generation should work properly")
    elif success and not blender_path:
        print("⚠️ Image processing works but Blender is not installed")
        print("💡 Install Blender or use the frontend fallback system")
    else:
        print("❌ Image processing failed - check your image URL")
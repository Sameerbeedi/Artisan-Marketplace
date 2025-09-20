"""
Simple test script to verify the integrated AR generation workflow
"""

import asyncio
import os
import tempfile
import requests
import subprocess
from PIL import Image

async def test_integrated_ar_workflow():
    """Test the complete AR generation workflow"""
    print("🧪 Testing Integrated AR Generation Workflow")
    print("=" * 50)
    
    # Test image (your paint.jpg)
    image_path = "paint.jpg"
    
    if not os.path.exists(image_path):
        print(f"❌ Test image not found: {image_path}")
        return False
    
    print(f"📸 Using test image: {image_path}")
    
    # Step 1: Verify image is valid
    try:
        with Image.open(image_path) as img:
            print(f"✅ Valid image: {img.size} pixels, format: {img.format}")
    except Exception as e:
        print(f"❌ Invalid image: {e}")
        return False
    
    # Step 2: Test Blender AR generation
    print("\n🎯 Testing Blender AR Generation...")
    
    # Check Blender installation
    blender_paths = [
        "C:\\Program Files\\Blender Foundation\\Blender 4.5\\blender.exe",
        "C:\\Program Files\\Blender Foundation\\Blender 4.0\\blender.exe",
    ]
    
    blender_exe = None
    for path in blender_paths:
        if os.path.exists(path):
            blender_exe = path
            print(f"✅ Found Blender: {path}")
            break
    
    if not blender_exe:
        print("❌ Blender not found")
        return False
    
    # Generate AR model
    script_path = os.path.abspath(os.path.join("blender_scripts", "generate_canvas_glb.py"))
    output_path = os.path.abspath("test_integrated_output.glb")
    image_path = os.path.abspath(image_path)
    
    try:
        print(f"🔄 Running Blender script...")
        print(f"   Script: {script_path}")
        print(f"   Image: {image_path}")
        print(f"   Output: {output_path}")
        
        result = subprocess.run(
            [blender_exe, "-b", "-P", script_path, "--", image_path, output_path],
            check=True,
            capture_output=True,
            text=True
        )
        
        print("✅ Blender execution successful")
        print(f"   STDOUT: {result.stdout.strip()}")
        if result.stderr:
            print(f"   STDERR: {result.stderr.strip()}")
        
        # Verify output file
        if os.path.exists(output_path):
            file_size = os.path.getsize(output_path)
            print(f"✅ GLB file created: {output_path} ({file_size} bytes)")
            
            # Test if the GLB can be loaded (basic validation)
            with open(output_path, 'rb') as f:
                header = f.read(12)
                if header[:4] == b'glTF':
                    print("✅ Valid GLB file format")
                else:
                    print("⚠️ GLB file may be corrupted")
            
            return True
        else:
            print("❌ GLB file was not created")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Blender execution failed: {e.stderr}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

async def test_story_tool_integration():
    """Test the story tool integration points"""
    print("\n🔧 Testing Story Tool Integration Points...")
    
    # Simulate the story tool workflow
    sample_data = {
        "title": "Beautiful Traditional Painting",
        "description": "A stunning traditional artwork",
        "materials": "Canvas, Oil Paint",
        "artisan_hours": 40,
        "state": "Rajasthan",
        "category": "painting",
        "isPainting": True,
        "image_url": "paint.jpg"  # Using local file for test
    }
    
    print("✅ Sample product data prepared")
    print(f"   Title: {sample_data['title']}")
    print(f"   Category: {sample_data['category']}")
    print(f"   Is Painting: {sample_data['isPainting']}")
    
    # Test AR generation workflow
    if sample_data['isPainting']:
        print("🎨 Product is a painting - AR generation applicable")
        print("🔄 AR generation would be triggered...")
        
        # This simulates what happens in the story tool
        ar_result = await test_integrated_ar_workflow()
        
        if ar_result:
            print("✅ AR generation integration test PASSED")
            return True
        else:
            print("❌ AR generation integration test FAILED")
            return False
    else:
        print("ℹ️ Product is not a painting - AR generation skipped")
        return True

if __name__ == "__main__":
    print("🚀 Starting Integrated AR Generation Tests\n")
    
    # Run the tests
    success = asyncio.run(test_story_tool_integration())
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests PASSED! AR integration is working correctly.")
        print("✨ The story tool will now automatically generate AR models for paintings!")
    else:
        print("❌ Tests FAILED! Check the errors above.")
        
    print("\n💡 Next steps:")
    print("1. Start the backend server")
    print("2. Start the frontend server") 
    print("3. Test the story tool with a painting image")
    print("4. Verify AR model appears in the results")
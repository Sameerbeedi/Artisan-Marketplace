"""
Test the AR generation API endpoint
"""

import requests
import json

def test_ar_api():
    """Test the AR generation API"""
    
    # Test health endpoint first
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get("http://localhost:8000/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False
    
    # Test AR generation endpoint
    print("\n🎯 Testing AR generation endpoint...")
    try:
        with open("paint.jpg", "rb") as f:
            files = {"file": ("paint.jpg", f, "image/jpeg")}
            response = requests.post("http://localhost:8000/api/generate-ar", files=files)
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            # Save the GLB file
            output_file = "api_generated_model.glb"
            with open(output_file, "wb") as f:
                f.write(response.content)
            
            print(f"✅ AR model generated successfully!")
            print(f"   File saved as: {output_file}")
            print(f"   File size: {len(response.content)} bytes")
            
            # Verify it's a valid GLB
            with open(output_file, "rb") as f:
                header = f.read(12)
                if header[:4] == b"glTF":
                    print(f"✅ Valid GLB file format")
                    return True
                else:
                    print(f"❌ Invalid GLB format")
                    return False
        else:
            print(f"❌ API request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ AR generation test failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing AR Generation API")
    print("=" * 40)
    
    success = test_ar_api()
    
    print("\n" + "=" * 40)
    if success:
        print("🎉 AR Generation API test PASSED!")
        print("✨ The API is working correctly!")
        print("\n💡 Now you can:")
        print("1. Start the frontend server")
        print("2. Test the story tool")
        print("3. Upload a painting image")
        print("4. See the AR model generated automatically!")
    else:
        print("❌ AR Generation API test FAILED!")
        print("Check the error messages above.")
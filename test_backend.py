#!/usr/bin/env python3
"""
Test script to verify backend endpoints are working correctly
Run this after Render.com deployment completes
"""

import requests
import json

BACKEND_URL = "https://artisan-marketplace-pvy1.onrender.com"

def test_health():
    """Test health check endpoint"""
    print("\n🔍 Testing health endpoint...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        print(f"✅ Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_cors():
    """Test CORS headers"""
    print("\n🔍 Testing CORS headers...")
    try:
        response = requests.options(
            f"{BACKEND_URL}/classify_product",
            headers={
                "Origin": "https://artisan-marketplace-six.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        print(f"✅ Status: {response.status_code}")
        print(f"CORS Headers:")
        for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']:
            print(f"  {header}: {response.headers.get(header, 'NOT FOUND')}")
        return response.status_code in [200, 204]
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_classify_product():
    """Test classify product endpoint"""
    print("\n🔍 Testing classify_product endpoint...")
    try:
        # Create a small test image
        from PIL import Image
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test.jpg', img_bytes, 'image/jpeg')}
        data = {'productTitle': 'Test Product'}
        
        response = requests.post(
            f"{BACKEND_URL}/classify_product",
            files=files,
            data=data,
            headers={"Origin": "https://artisan-marketplace-six.vercel.app"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        else:
            print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_upload_image():
    """Test image upload endpoint"""
    print("\n🔍 Testing upload_image endpoint...")
    try:
        from PIL import Image
        import io
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='blue')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'file': ('test_upload.jpg', img_bytes, 'image/jpeg')}
        
        response = requests.post(
            f"{BACKEND_URL}/upload_image",
            files=files,
            headers={"Origin": "https://artisan-marketplace-six.vercel.app"}
        )
        print(f"✅ Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            
            # Test if the uploaded image is accessible
            if result.get('imageUrl'):
                print(f"\n🔍 Testing if uploaded image is accessible...")
                img_response = requests.get(result['imageUrl'])
                print(f"✅ Image accessible: {img_response.status_code == 200}")
        else:
            print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("=" * 60)
    print("🧪 Backend Test Suite")
    print("=" * 60)
    
    results = {
        "Health Check": test_health(),
        "CORS Configuration": test_cors(),
        "Upload Image": test_upload_image(),
        "Classify Product": test_classify_product(),
    }
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All tests passed!")
    else:
        print("⚠️ Some tests failed. Check the output above for details.")
    print("=" * 60)

if __name__ == "__main__":
    main()

"""
Test AR generation endpoint with file upload
"""

import requests
import os

# Configuration
backend_url = "https://artisan-marketplace-pvy1.onrender.com"
test_image_path = "backend/paint.jpg"  # Use existing test image

# Check if test image exists
if not os.path.exists(test_image_path):
    print(f"❌ Test image not found: {test_image_path}")
    exit(1)

print("🎯 Testing AR Generation Endpoint")
print(f"📍 Backend URL: {backend_url}")
print(f"🖼️ Test image: {test_image_path}")
print()

# Test 1: Generate AR Model with file upload
print("=" * 60)
print("TEST: AR Generation with File Upload")
print("=" * 60)

try:
    with open(test_image_path, 'rb') as f:
        files = {'file': ('test-painting.jpg', f, 'image/jpeg')}
        response = requests.post(
            f"{backend_url}/generate_ar_model/test_ar_123",
            files=files,
            timeout=120  # AR generation can take time
        )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            print("✅ AR generation successful!")
            print(f"🎨 AR Model URL: {data.get('ar_model_url')}")
        else:
            print(f"❌ AR generation failed: {data.get('error', data.get('message', 'Unknown error'))}")
    else:
        print(f"❌ Request failed with status {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.Timeout:
    print("⏱️ Request timed out (AR generation takes time, this is expected)")
    print("💡 Check Render logs to see if generation is still in progress")
except Exception as e:
    print(f"❌ Error: {str(e)}")

print()
print("=" * 60)

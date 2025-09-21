"""
Simple debug script to test if the server is running and responding
"""

import requests
import json

def test_server():
    """Test if the server is running"""
    try:
        # Test health endpoint
        print("🏥 Testing health endpoint...")
        response = requests.get("http://localhost:8000/api/health", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
        else:
            print(f"❌ Server responded with: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server - is it running?")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    if test_server():
        print("\n💡 Server is ready! You can now:")
        print("1. Start the frontend server")
        print("2. Test the story tool")
        print("3. Upload a painting and see AR generation")
    else:
        print("\n❌ Server is not running. Please start it with:")
        print("python simple_server.py")
import firebase_admin
from firebase_admin import credentials, firestore, storage
import os
import json

# Path to Firebase key
FIREBASE_KEY_PATH = os.path.join(
    os.path.dirname(__file__),
    "firebase_service_account.json"
)

# ✅ Correct default bucket name (always ends with .appspot.com)
FIREBASE_STORAGE_BUCKET = os.getenv(
    "FIREBASE_STORAGE_BUCKET",
    "artisan-marketplace-ai-b31cf.appspot.com"
)

db = None
bucket = None

# Try to initialize Firebase from file or environment variable
firebase_initialized = False

# Option 1: Try environment variable (for Render.com deployment)
firebase_creds_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
if firebase_creds_json:
    try:
        if not firebase_admin._apps:  # Prevent duplicate init
            cred_dict = json.loads(firebase_creds_json)
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred, {
                "storageBucket": FIREBASE_STORAGE_BUCKET
            })
        db = firestore.client()
        bucket = storage.bucket()
        firebase_initialized = True
        print("✅ Firebase initialized successfully (from environment variable)")
    except Exception as e:
        print(f"⚠️ Firebase initialization from env var failed: {e}")

# Option 2: Try local file (for local development)
if not firebase_initialized and os.path.exists(FIREBASE_KEY_PATH):
    try:
        if not firebase_admin._apps:  # Prevent duplicate init
            cred = credentials.Certificate(FIREBASE_KEY_PATH)
            firebase_admin.initialize_app(cred, {
                "storageBucket": FIREBASE_STORAGE_BUCKET
            })
        db = firestore.client()
        bucket = storage.bucket()
        firebase_initialized = True
        print("✅ Firebase initialized successfully (from local file)")
    except Exception as e:
        print(f"⚠️ Firebase initialization from file failed: {e}")

# If neither worked, run without Firebase
if not firebase_initialized:
    print(f"⚠️ Firebase not available (no credentials found)")
    print("📝 Checked:")
    print(f"   - Environment variable: FIREBASE_SERVICE_ACCOUNT_JSON = {'SET' if firebase_creds_json else 'NOT SET'}")
    print(f"   - Local file: {FIREBASE_KEY_PATH} = {'EXISTS' if os.path.exists(FIREBASE_KEY_PATH) else 'NOT FOUND'}")
    print("📝 Backend will run with limited functionality (no Firestore/Storage)")
    print("📝 Products will use in-memory storage, AR models saved locally")


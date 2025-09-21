import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

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

if os.path.exists(FIREBASE_KEY_PATH):
    try:
        if not firebase_admin._apps:  # Prevent duplicate init
            cred = credentials.Certificate(FIREBASE_KEY_PATH)
            firebase_admin.initialize_app(cred, {
                "storageBucket": FIREBASE_STORAGE_BUCKET
            })
        db = firestore.client()
        bucket = storage.bucket()
        print("✅ Firebase initialized successfully")
    except Exception as e:
        print(f"⚠️ Firebase initialization failed: {e}")
        print("📝 Backend will run with limited functionality (no Firestore/Storage)")
else:
    print(f"⚠️ Firebase service account not found at: {FIREBASE_KEY_PATH}")
    print("📝 Backend will run with limited functionality (no Firestore/Storage)")
    print("📝 For full functionality, add firebase_service_account.json to backend folder")

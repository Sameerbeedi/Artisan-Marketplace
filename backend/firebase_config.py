import firebase_admin
from firebase_admin import credentials, firestore, storage
import os

FIREBASE_KEY_PATH = os.path.join(os.path.dirname(__file__), "firebase_service_account.json")

# ✅ Use correct bucket name from env
FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "artisan-marketplace-ai-b31cf.firebasestorage.app")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred, {
        "storageBucket": FIREBASE_STORAGE_BUCKET
    })

db = firestore.client()
bucket = storage.bucket()

import firebase_admin
from firebase_admin import credentials, firestore
import os

# Path to your service account key (already ignored in git)
FIREBASE_KEY_PATH = os.path.join(
    os.path.dirname(__file__), "firebase_service_account.json"
)

# Initialize Firebase only once
if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()

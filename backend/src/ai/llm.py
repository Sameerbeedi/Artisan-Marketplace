import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

def setup_llm():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=api_key)
    ai = genai.GenerativeModel("gemini-2.5-flash")
    return ai
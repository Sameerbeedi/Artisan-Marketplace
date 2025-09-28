import google.generativeai as genai
import os

# Load your API key from environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("Missing GOOGLE_API_KEY. Set it in your environment variables.")

genai.configure(api_key=GOOGLE_API_KEY)


# Configure Gemini 1.5 Pro for better reasoning
class RecommendationAI:
    def __init__(self, model_name: str = "gemini-1.5-pro"):
        self.model = genai.GenerativeModel(model_name)

    def generate(self, prompt: str, temperature: float = 0.7, top_p: float = 0.9, max_output_tokens: int = 2048):
        response = self.model.generate_content(
            prompt,
            generation_config={
                "temperature": temperature,
                "top_p": top_p,
                "max_output_tokens": max_output_tokens,
            }
        )
        return response


# Alternative config for faster responses
class FastRecommendationAI(RecommendationAI):
    def __init__(self):
        super().__init__(model_name="gemini-2.5-flash")


# Usage example
recommendation_ai = RecommendationAI()          # Gemini 1.5 Pro
fast_recommendation_ai = FastRecommendationAI() # Gemini 1.5 Flash

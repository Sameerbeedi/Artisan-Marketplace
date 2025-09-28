import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from data_types_class import PriceEstimationInput, PriceEstimationOutput
import google.generativeai as genai
import os
import json
import re

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

async def ai_estimate_price(
    input: PriceEstimationInput,
) -> PriceEstimationOutput:
    prompt = f"""
    You are an AI pricing assistant for Indian artisans.

    Task:
    - Given the product category, materials, artisan hours, and Indian state,
      estimate a fair price range (min and max) for selling this product online.
    - Factor in craftsmanship effort, sustainability, and state-level market/fair trade benchmarks.
    - Return price range in INR (₹).
    - Provide reasoning in 2–3 sentences. Keep it factual and marketplace-focused.

    Input:
    Category: {input.category}
    Materials: {input.materials}
    Artisan Hours: {input.artisan_hours}
    State: {input.state}

    Respond strictly in JSON:
    {{
      "min_price": number,
      "max_price": number,
      "reasoning": "short explanation"
    }}
    """

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Clean JSON (strip ```json fences if present)
    cleaned = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()

    try:
        data = json.loads(cleaned)
        min_price = data.get("min_price", 0)
        max_price = data.get("max_price", 0)
        reasoning = data.get("reasoning", "")
    except Exception:
        min_price, max_price, reasoning = 0, 0, text

    return PriceEstimationOutput(
        minPrice=min_price,
        maxPrice=max_price,
        reasoning=reasoning
    )


async def generate_price_estimation(
    input: PriceEstimationInput,
) -> PriceEstimationOutput:
    return await ai_estimate_price(input)

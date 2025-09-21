# backend/src/ai/flows/product_storytelling.py

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from data_types_class import ProductStorytellingInput, ProductStorytellingOutput
import google.generativeai as genai
import os
import json
import re

# Configure Gemini
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

async def ai_generate_product_story(
    input: ProductStorytellingInput,
) -> ProductStorytellingOutput:
    prompt = f"""
    You are an AI marketing assistant for local artisans.

    Task:
    - Given a product title and description, write a short, persuasive product story
      that highlights craftsmanship, tradition, sustainability, and customer value.
    - The tone should match professional e-commerce product listings 
      (engaging but not fictional or made-up characters).
    - Generate 5 SEO-friendly tags that help the artisan's product reach online buyers.

    Input:
    Product Title: {input.productTitle}
    Product Description: {input.productDescription}

    Respond strictly in JSON with this format:
    {{
      "story": "One marketing-style paragraph about the product.",
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }}
    """

    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    text = response.text.strip()

    # Clean JSON (remove ```json fences if present)
    cleaned = re.sub(r"^```(?:json)?|```$", "", text, flags=re.MULTILINE).strip()

    try:
        data = json.loads(cleaned)
        story = data.get("story", "")
        seo_tags = data.get("tags", [])
    except Exception:
        story = text
        seo_tags = []

    return ProductStorytellingOutput(
        creativeStory=story,
        seoTags=seo_tags
    )


async def generate_product_story(
    input: ProductStorytellingInput,
) -> ProductStorytellingOutput:
    return await ai_generate_product_story(input)

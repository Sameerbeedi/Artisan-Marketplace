# routes.py
from fastapi import APIRouter
import httpx
from typing import List
from backend.data_types_class import (
    CatalogProductInput, CatalogProductOutput,
    HeritageStorytellingInput, HeritageStorytellingOutput,
    GenerateProcessDocumentationInput, GenerateProcessDocumentationOutput,
    ProductStorytellingInput, ProductStorytellingOutput,
    AnalyzeProductPhotoInput, AnalyzeProductPhotoOutput,
    IdentifyTechniqueInput, IdentifyTechniqueOutput,
    RecommendationRequest, RecommendationResponse
)
from backend.src.ai.flows.automated_product_catalog import catalog_product
from backend.src.ai.flows.heritage_storytelling import generate_heritage_story
from backend.src.ai.flows.process_documentation import generate_process_documentation
from backend.src.ai.flows.product_storytelling import generate_product_story
from backend.src.ai.flows.quality_assessment import analyze_product_photo
from backend.src.ai.flows.technique_identification import identify_technique
from backend.src.lib.data import Products as products


router = APIRouter()


@router.post("/catalog_product", response_model=CatalogProductOutput)
async def catalog_product_endpoint(input: CatalogProductInput):
    return await catalog_product(input)


@router.post("/generate_heritage_story", response_model=HeritageStorytellingOutput)
async def generate_heritage_story_endpoint(input: HeritageStorytellingInput):
    return await generate_heritage_story(input)


@router.post("/generate_process_documentation", response_model=GenerateProcessDocumentationOutput)
async def generate_process_documentation_endpoint(input: GenerateProcessDocumentationInput):
    return await generate_process_documentation(input)


@router.post("/generate_product_story", response_model=ProductStorytellingOutput)
async def generate_product_story_endpoint(input: ProductStorytellingInput):
    return await generate_product_story(input)


@router.post("/analyze_product_photo", response_model=AnalyzeProductPhotoOutput)
async def analyze_product_photo_endpoint(input: AnalyzeProductPhotoInput):
    return await analyze_product_photo(input)


@router.post("/identify_technique", response_model=IdentifyTechniqueOutput)
async def identify_technique_endpoint(input: IdentifyTechniqueInput):
    return await identify_technique(input)


@router.get("/expensive-products")
async def get_expensive_products():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://fakestoreapi.com/products")
        products_list = response.json()
    expensive_products = [p for p in products_list if p.get("price", 0) > 100]
    return expensive_products


@router.post("/recommend", response_model=RecommendationResponse)
async def personalized_recommendation(req: RecommendationRequest):
    user_prompt = req.userPrompt.lower()
    user_preferences = req.userPreferences
    user_history = req.userHistory or []
    max_results = req.maxResults or 5
    exclude_products = req.excludeProducts or []

    # Filter available products
    available_products = [p for p in products if p["id"] not in exclude_products]

    # Apply category filter
    if user_preferences and user_preferences.categories:
        available_products = [
            p for p in available_products
            if any(cat.lower() in p["category"].lower() for cat in user_preferences.categories)
        ]

    # Apply price range filter
    if user_preferences and user_preferences.priceRange:
        min_price = user_preferences.priceRange.min
        max_price = user_preferences.priceRange.max
        available_products = [
            p for p in available_products if min_price <= p["price"] <= max_price
        ]

    # Apply preferred artisans filter
    if user_preferences and user_preferences.preferredArtisans:
        available_products = [
            p for p in available_products
            if any(artisan.lower() in p["artisan"].lower() for artisan in user_preferences.preferredArtisans)
        ]

    # Simple fallback relevance scoring
    recommended_products = []
    for p in available_products:
        score = 0.6
        if any(word in p["name"].lower() for word in user_prompt.split()):
            score += 0.1
        if any(word in p["category"].lower() for word in user_prompt.split()):
            score += 0.1
        if any(word in p["aiHint"].lower() for word in user_prompt.split()):
            score += 0.1
        recommended_products.append({**p, "relevanceScore": min(score, 1.0)})

    # Sort by relevanceScore descending
    recommended_products = sorted(
        recommended_products, key=lambda x: x["relevanceScore"], reverse=True
    )[:max_results]

    return {
        "products": recommended_products,
        "reasoning": "Products selected based on keyword matching and user preferences.",
        "confidence": 0.7,
        "categories": list({p["category"] for p in recommended_products}),
        "suggestedFilters": {}
    }

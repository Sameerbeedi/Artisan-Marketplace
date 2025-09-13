from typing import Optional, Dict
import requests
from urllib.parse import urlencode
from backend.data_types_class import RecommendationRequest, RecommendationResponse, UserPreferences, PriceRange


class RecommendationAPIClient:
    base_url: str = "http://localhost:9079"  # Match main.py default port

    @staticmethod
    def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",  # Fixed endpoint
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_trending_recommendations(prompt: Optional[str] = None, max_results: int = 8) -> RecommendationResponse:
        # Since routes.py only has POST /recommend, we need to use that endpoint
        request = RecommendationRequest(
            userPrompt=prompt or "Show me trending artisan products",
            maxResults=max_results
        )
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get trending recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_category_recommendations(category: str, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        user_prompt = prompt or f"Show me beautiful {category} products"
        # Create UserPreferences with the category filter
        preferences = UserPreferences(
            categories=[category],
            priceRange=PriceRange(min=0, max=100000),
            preferredArtisans=[],
            styles=[],
            colors=[],
            occasions=[]
        )
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=preferences,
            maxResults=max_results
        )
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get category recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_budget_recommendations(min_price: float, max_price: float, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        user_prompt = prompt or f"Show me quality artisan products within my budget of ₹{min_price} to ₹{max_price}"
        preferences = UserPreferences(
            categories=[],
            priceRange=PriceRange(min=min_price, max=max_price),
            preferredArtisans=[],
            styles=[],
            colors=[],
            occasions=[]
        )
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=preferences,
            maxResults=max_results
        )
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get budget recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_similar_products(product_id: str, prompt: Optional[str] = None, max_results: int = 4) -> RecommendationResponse:
        user_prompt = prompt or f"Show me products similar to product ID {product_id}"
        request = RecommendationRequest(
            userPrompt=user_prompt,
            excludeProducts=[product_id],
            maxResults=max_results
        )
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get similar product recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_gift_recommendations(occasion: str, recipient: Optional[str] = None,
                                 price_range: Optional[Dict[str, float]] = None,
                                 prompt: Optional[str] = None,
                                 max_results: int = 6) -> RecommendationResponse:
        user_prompt = prompt or f"Recommend beautiful artisan gifts for {occasion}"
        if recipient:
            user_prompt += f" for a {recipient}"
        
        price_obj = PriceRange(**price_range) if price_range else PriceRange(min=0, max=100000)
        preferences = UserPreferences(
            categories=[],
            priceRange=price_obj,
            preferredArtisans=[],
            styles=[],
            colors=[],
            occasions=[occasion]
        )
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=preferences,
            maxResults=max_results
        )
        response = requests.post(
            f"{RecommendationAPIClient.base_url}/recommend",
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get gift recommendations"))
        return RecommendationResponse.parse_obj(response.json())

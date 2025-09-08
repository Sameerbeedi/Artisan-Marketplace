from typing import Optional, Dict
import requests
from urllib.parse import urlencode
from backend.data_types_class import RecommendationRequest, RecommendationResponse


class RecommendationAPIClient:
    base_url: str = "http://localhost:8000/api/recommendations"  # or your deployed API URL

    @staticmethod
    def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
        response = requests.post(
            RecommendationAPIClient.base_url,
            json=request.dict()
        )
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_trending_recommendations(prompt: Optional[str] = None, max_results: int = 8) -> RecommendationResponse:
        params = {"type": "trending", "maxResults": str(max_results)}
        if prompt:
            params["prompt"] = prompt
        url = f"{RecommendationAPIClient.base_url}?{urlencode(params)}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get trending recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_category_recommendations(category: str, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        params = {"type": "category", "category": category, "maxResults": str(max_results)}
        if prompt:
            params["prompt"] = prompt
        url = f"{RecommendationAPIClient.base_url}?{urlencode(params)}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get category recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_budget_recommendations(min_price: float, max_price: float, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        params = {
            "type": "budget",
            "minPrice": str(min_price),
            "maxPrice": str(max_price),
            "maxResults": str(max_results)
        }
        if prompt:
            params["prompt"] = prompt
        url = f"{RecommendationAPIClient.base_url}?{urlencode(params)}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get budget recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_similar_products(product_id: str, prompt: Optional[str] = None, max_results: int = 4) -> RecommendationResponse:
        params = {"type": "similar", "productId": product_id, "maxResults": str(max_results)}
        if prompt:
            params["prompt"] = prompt
        url = f"{RecommendationAPIClient.base_url}?{urlencode(params)}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get similar product recommendations"))
        return RecommendationResponse.parse_obj(response.json())

    @staticmethod
    def get_gift_recommendations(occasion: str, recipient: Optional[str] = None,
                                 price_range: Optional[Dict[str, float]] = None,
                                 prompt: Optional[str] = None,
                                 max_results: int = 6) -> RecommendationResponse:
        params = {"type": "gift", "occasion": occasion, "maxResults": str(max_results)}
        if recipient:
            params["recipient"] = recipient
        if price_range:
            params["priceMin"] = str(price_range["min"])
            params["priceMax"] = str(price_range["max"])
        if prompt:
            params["prompt"] = prompt
        url = f"{RecommendationAPIClient.base_url}?{urlencode(params)}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(response.json().get("error", "Failed to get gift recommendations"))
        return RecommendationResponse.parse_obj(response.json())

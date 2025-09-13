from typing import Optional, Dict
from backend.src.recommendation.price_parser import extract_price_range
from backend.data_types_class import RecommendationRequest, RecommendationResponse, UserProfile, UserPreference, PriceRange

class RecommendationService:
    @staticmethod
    async def get_recommendations(request: RecommendationRequest) -> RecommendationResponse:
        # Extract price range from user prompt and set in userPreferences
        if request.userPrompt:
            price_range = extract_price_range(request.userPrompt)
            if price_range and isinstance(price_range.get("max"), int):
                if not request.userPreferences:
                    request.userPreferences = UserPreference(
                        categories=[],
                        priceRange=PriceRange(min=0, max=100000),
                        preferredArtisans=[],
                        styles=[],
                        colors=[],
                        occasions=[]
                    )
                request.userPreferences.priceRange = PriceRange(
                    min=price_range.get("min", 0),
                    max=price_range["max"]
                )

        try:
            # For now, delegate to the routes.py implementation
            # In a real system, this would call your AI recommendation engine
            from backend.routes import personalized_recommendation
            
            # Create a mock request object for routes.py
            result = await personalized_recommendation(request)
            return result
        except Exception as e:
            print("Error getting recommendations:", e)
            raise RuntimeError("Failed to get recommendations")

    @staticmethod
    async def get_recommendations_for_user(user_profile: UserProfile, prompt: str, max_results: int = 5) -> RecommendationResponse:
        request = RecommendationRequest(
            userPrompt=prompt,
            userPreferences=user_profile.preferences,
            userHistory=user_profile.purchaseHistory,
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

    @staticmethod
    async def get_trending_recommendations(prompt: str = "Show me trending artisan products", max_results: int = 8) -> RecommendationResponse:
        request = RecommendationRequest(
            userPrompt=prompt,
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

    @staticmethod
    async def get_category_recommendations(category: str, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        user_prompt = prompt or f"Show me beautiful {category} products"
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=UserPreference(
                categories=[category],
                priceRange=PriceRange(min=0, max=100000),
                preferredArtisans=[],
                styles=[],
                colors=[],
                occasions=[]
            ),
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

    @staticmethod
    async def get_budget_recommendations(min_price: int, max_price: int, prompt: Optional[str] = None, max_results: int = 6) -> RecommendationResponse:
        user_prompt = prompt or f"Show me quality artisan products within my budget of ₹{min_price} to ₹{max_price}"
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=UserPreference(
                categories=[],
                priceRange=PriceRange(min=min_price, max=max_price),
                preferredArtisans=[],
                styles=[],
                colors=[],
                occasions=[]
            ),
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

    @staticmethod
    async def get_similar_products(product_id: str, prompt: Optional[str] = None, max_results: int = 4) -> RecommendationResponse:
        user_prompt = prompt or f"Show me products similar to product ID {product_id}"
        request = RecommendationRequest(
            userPrompt=user_prompt,
            excludeProducts=[product_id],
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

    @staticmethod
    async def get_gift_recommendations(occasion: str, recipient: Optional[str] = None,
                                       price_range: Optional[Dict[str, int]] = None,
                                       max_results: int = 6) -> RecommendationResponse:
        user_prompt = f"Recommend beautiful artisan gifts for {occasion}"
        if recipient:
            user_prompt += f" for a {recipient}"
        request = RecommendationRequest(
            userPrompt=user_prompt,
            userPreferences=UserPreference(
                categories=[],
                priceRange=PriceRange(**price_range) if price_range else PriceRange(min=0, max=100000),
                preferredArtisans=[],
                styles=[],
                colors=[],
                occasions=[occasion]
            ),
            maxResults=max_results
        )
        return await RecommendationService.get_recommendations(request)

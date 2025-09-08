from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CatalogProductInput(BaseModel):
    photoDataUri: str = Field(
        ...,
        description=(
            "A photo of the craft, as a data URI that must include a MIME type and use "
            "Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    )

class CatalogProductOutput(BaseModel):
    category: str = Field(..., description="The predicted category of the product.")
    confidence: float = Field(
        ..., description="Confidence level of the category prediction (0 to 1)."
    )

class HeritageStorytellingInput(BaseModel):
    artisanBackground: str = Field(..., description="Description of the artisan's background.")
    familyTraditions: str = Field(..., description="Description of the artisan's family traditions.")
    craftHistory: str = Field(..., description="Description of the artisan's craft history.")
    productDescription: str = Field(..., description="Description of the product.")

class HeritageStorytellingOutput(BaseModel):
    heritageStory: str = Field(..., description="A compelling heritage story for the artisan.")

class GenerateProcessDocumentationInput(BaseModel):
    craftName: str = Field(..., description="The name of the craft.")
    craftDescription: str = Field(
        ..., description="A detailed description of the craft, including its cultural significance."
    )
    materials: str = Field(..., description="A list of materials used in the craft.")
    steps: str = Field(..., description="A description of the steps of the process.")
    culturalContext: str = Field(..., description="The cultural context of the craft.")

class GenerateProcessDocumentationOutput(BaseModel):
    processDescription: str = Field(
        ..., description="A detailed, step-by-step description of the craft process with cultural context."
    )

class ProductStorytellingInput(BaseModel):
    productTitle: str = Field(..., description="The title of the product.")
    productDescription: str = Field(..., description="A short description of the product.")

class ProductStorytellingOutput(BaseModel):
    creativeStory: str = Field(..., description="A creative and compelling story about the product.")
    seoTags: List[str] = Field(..., description="A list of SEO-friendly tags or hashtags.")

class AnalyzeProductPhotoInput(BaseModel):
    photoDataUri: str = Field(
        ...,
        description=(
            "A photo of the product, as a data URI that must include a MIME type "
            "and use Base64 encoding. Expected format: "
            "'data:<mimetype>;base64,<encoded_data>'."
        ),
    )
    productDescription: str = Field(..., description="The description of the product.")

class AnalyzeProductPhotoOutput(BaseModel):
    qualityScore: int = Field(
        ..., description="A score indicating the quality of the product photo (0-100)."
    )
    suggestedImprovements: str = Field(
        ..., description="Suggestions for improving the product photo."
    )

class IdentifyTechniqueInput(BaseModel):
    photoDataUri: str = Field(
        ...,
        description=(
            "A photo of the craft, as a data URI that must include a MIME type "
            "and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
    )
    craftDescription: str = Field(..., description="The description of the craft.")

class IdentifyTechniqueOutput(BaseModel):
    techniques: List[str] = Field(
        ..., description="An array of identified traditional techniques."
    )
    confidenceLevels: List[float] = Field(
        ..., description="An array of confidence levels for each identified technique."
    )

class PriceRange(BaseModel):
    min: float
    max: float

class UserPreferences(BaseModel):
    categories: Optional[List[str]] = None
    priceRange: Optional[PriceRange] = None
    preferredArtisans: Optional[List[str]] = None
    styles: Optional[List[str]] = None
    colors: Optional[List[str]] = None
    occasions: Optional[List[str]] = None

class RecommendationRequest(BaseModel):
    userPrompt: str
    userPreferences: Optional[UserPreferences] = None
    userHistory: Optional[List[str]] = None
    maxResults: int = 5
    excludeProducts: Optional[List[str]] = None


# ------------------------
# Output Schemas
# ------------------------
class RecommendedProduct(BaseModel):
    id: str
    name: str
    price: float
    imageUrl: str
    artisan: str
    category: str
    aiHint: str
    relevanceScore: float = Field(..., ge=0, le=1)

class SuggestedFilters(BaseModel):
    priceRange: Optional[PriceRange] = None
    categories: Optional[List[str]] = None
    artisans: Optional[List[str]] = None

class RecommendationResponse(BaseModel):
    products: List[RecommendedProduct]
    reasoning: str
    confidence: float = Field(..., ge=0, le=1)
    categories: List[str]
    suggestedFilters: Optional[SuggestedFilters] = None

class PriceRange(BaseModel):
    min: float
    max: float


class UserPreference(BaseModel):
    categories: List[str]
    priceRange: PriceRange
    preferredArtisans: List[str]
    styles: List[str]
    colors: List[str]
    occasions: List[str]


# ------------------------
# Product Model
# ------------------------
class Product(BaseModel):
    id: str
    name: str
    price: float
    imageUrl: str
    artisan: str
    category: str
    aiHint: str
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    materials: Optional[List[str]] = None
    techniques: Optional[List[str]] = None
    region: Optional[str] = None
    rating: Optional[float] = None
    availability: Optional[bool] = None


# ------------------------
# Recommendation Request/Response Models
# ------------------------
class RecommendationRequest(BaseModel):
    userPrompt: str
    userPreferences: Optional[UserPreference] = None
    userHistory: Optional[List[str]] = None
    maxResults: Optional[int] = None
    excludeProducts: Optional[List[str]] = None


class SuggestedFilters(BaseModel):
    priceRange: Optional[PriceRange] = None
    categories: Optional[List[str]] = None
    artisans: Optional[List[str]] = None


class RecommendationResponse(BaseModel):
    products: List[Product]
    reasoning: str
    confidence: float
    categories: List[str]
    suggestedFilters: Optional[SuggestedFilters] = None


# ------------------------
# User Profile Model
# ------------------------
class Demographics(BaseModel):
    age: Optional[int] = None
    location: Optional[str] = None
    interests: Optional[List[str]] = None


class UserProfile(BaseModel):
    id: str
    preferences: UserPreference
    purchaseHistory: List[str]
    browsingHistory: List[str]
    favoriteArtisans: List[str]
    recentSearches: List[str]
    demographics: Optional[Demographics] = None

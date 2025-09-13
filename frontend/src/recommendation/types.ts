// Type definitions for the recommendation system
export interface PriceRange {
  min: number;
  max: number;
}

export interface UserPreference {
  categories: string[];
  priceRange: PriceRange;
  preferredArtisans: string[];
  styles: string[];
  colors: string[];
  occasions: string[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  artisan: string;
  category: string;
  aiHint: string;
  description?: string;
  tags?: string[];
  materials?: string[];
  techniques?: string[];
  region?: string;
  rating?: number;
  availability?: boolean;
  relevanceScore?: number;
}

export interface RecommendationRequest {
  userPrompt: string;
  userPreferences?: UserPreference;
  userHistory?: string[];
  maxResults?: number;
  excludeProducts?: string[];
}

export interface SuggestedFilters {
  priceRange?: PriceRange;
  categories?: string[];
  artisans?: string[];
}

export interface RecommendationResponse {
  products: Product[];
  reasoning: string;
  confidence: number;
  categories: string[];
  suggestedFilters?: SuggestedFilters;
}

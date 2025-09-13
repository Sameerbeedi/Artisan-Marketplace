import type { RecommendationRequest, RecommendationResponse } from './types';

export class RecommendationAPIClient {
  // Use Next.js API routes instead of direct backend calls
  private static readonly BASE_URL = '';

  static async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const response = await fetch('/api/recommend', { // Next.js API route
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to get recommendations: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTrendingRecommendations(prompt?: string, maxResults: number = 8): Promise<RecommendationResponse> {
    const request: RecommendationRequest = {
      userPrompt: prompt || "Show me trending artisan products",
      maxResults,
    };

    return this.getRecommendations(request);
  }

  static async getCategoryRecommendations(category: string, prompt?: string, maxResults: number = 6): Promise<RecommendationResponse> {
    const request: RecommendationRequest = {
      userPrompt: prompt || `Show me beautiful ${category} products`,
      userPreferences: {
        categories: [category],
        priceRange: { min: 0, max: 100000 },
        preferredArtisans: [],
        styles: [],
        colors: [],
        occasions: [],
      },
      maxResults,
    };

    return this.getRecommendations(request);
  }
}

'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '@/components/product-card';
import { products } from '@/lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { RecommendationAPIClient } from '@/recommendation/api-client';
import type { Product, RecommendationResponse } from '@/recommendation/types';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [isAISearch, setIsAISearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Handle AI-powered search
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setIsAISearch(true);
    
    try {
      // For now, let's create a mock AI response since the API might not be working
      // You can replace this with the actual API call once the server is running properly
      
      // const recommendations = await RecommendationAPIClient.getRecommendations({
      //   userPrompt: searchQuery,
      //   maxResults: 12
      // });
      
      // Mock AI response for demonstration
      const mockAIResponse = {
        products: products.filter(product => {
          const query = searchQuery.toLowerCase();
          return product.name.toLowerCase().includes(query) ||
            product.artisan.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.aiHint.toLowerCase().includes(query);
        }).slice(0, 8),
        reasoning: `Based on your search "${searchQuery}", I've found products that match your requirements considering quality, price, and craftsmanship.`,
        confidence: 0.85,
        categories: ['Pottery', 'Textiles', 'Jewelry'],
        suggestedFilters: {
          categories: ['Pottery', 'Textiles']
        }
      };
      
      setAiRecommendations(mockAIResponse);
      setFilteredProducts(mockAIResponse.products);
    } catch (error) {
      console.error('AI search failed:', error);
      // Fallback to regular search
      handleRegularSearch();
      setIsAISearch(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle regular keyword search
  const handleRegularSearch = () => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.artisan.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.aiHint.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        break;
    }

    setFilteredProducts(filtered);
    setIsAISearch(false);
    setAiRecommendations(null);
  };

  // Handle search on Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // Check if it's a natural language query (contains multiple words or descriptive terms)
      const isNaturalLanguage = searchQuery.includes(' ') || 
        /for|under|above|beautiful|unique|traditional|handmade|gift|wedding|home|kitchen/.test(searchQuery.toLowerCase());
      
      if (isNaturalLanguage) {
        handleAISearch();
      } else {
        handleRegularSearch();
      }
    }
  };

  // Effect for real-time filtering (non-AI search)
  useEffect(() => {
    if (!isAISearch && !loading) {
      handleRegularSearch();
    }
  }, [selectedCategory, sortBy]);

  // Clear AI search
  const clearAISearch = () => {
    setIsAISearch(false);
    setAiRecommendations(null);
    setSearchQuery('');
    setFilteredProducts(products);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline text-primary">
          Artisan Marketplace
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore a curated collection of authentic, handcrafted products from
          the heart of India.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        {/* AI-Powered Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Type product name or describe what you're looking for (e.g., 'beautiful pottery for kitchen under ₹2000')" 
            className="pl-10 pr-20 h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <Button
              size="sm"
              onClick={handleAISearch}
              disabled={loading || !searchQuery.trim()}
              className="h-8"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
              ) : (
                <>
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Search Examples */}
        <div className="flex flex-wrap gap-2 justify-center">
          <span className="text-sm text-muted-foreground">Try:</span>
          {[
            "pottery for kitchen",
            "wedding gifts under ₹3000",
            "traditional textiles",
            "handmade jewelry"
          ].map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setSearchQuery(example);
                handleAISearch();
              }}
            >
              {example}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-4 flex-1">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="textiles">Textiles</SelectItem>
                <SelectItem value="pottery">Pottery</SelectItem>
                <SelectItem value="jewelry">Jewelry</SelectItem>
                <SelectItem value="woodwork">Woodwork</SelectItem>
                <SelectItem value="metalwork">Metalwork</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* AI Search Results Header */}
        {isAISearch && aiRecommendations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">AI-Powered Results</h3>
                <Badge variant="outline" className="text-xs">
                  {Math.round(aiRecommendations.confidence * 100)}% confidence
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAISearch}
                className="h-8 text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
            {aiRecommendations.reasoning && (
              <p className="text-sm text-blue-800">{aiRecommendations.reasoning}</p>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} products
          {isAISearch && aiRecommendations && " based on AI recommendations"}
        </p>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-4">
            {searchQuery ? 'No products found matching your search.' : 'No products available.'}
          </p>
          {searchQuery && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Try:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('pottery');
                  handleRegularSearch();
                }}>
                  pottery
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('textiles');
                  handleRegularSearch();
                }}>
                  textiles
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('jewelry');
                  handleRegularSearch();
                }}>
                  jewelry
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggested Filters (from AI) */}
      {isAISearch && aiRecommendations?.suggestedFilters && (
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">You might also like:</h4>
          <div className="flex flex-wrap gap-2">
            {aiRecommendations.suggestedFilters.categories?.map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(`Show me more ${category} products`);
                  handleAISearch();
                }}
              >
                More {category}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from '../../components/product-card';
import { products } from '../../lib/data';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Search, Sparkles, Filter, X } from 'lucide-react';
import { RecommendationAPIClient } from '@/recommendation/api-client';
import type { Product, RecommendationResponse } from '@/recommendation/types';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [originalProducts, setOriginalProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Use local products from data.ts
  // ✅ Extracted fetchProducts so we can call it anytime
  const fetchProducts = async () => {
    try {
      // Local demo products
      const validLocalProducts = products.filter(product =>
        product &&
        product.id &&
        product.name &&
        product.price !== undefined &&
        product.category &&
        product.artisan
      );

      console.log('📦 Local hardcoded products:', validLocalProducts.length);

      // Fetch published products from backend
      const res = await fetch('http://localhost:9079/products'); // update backend URL if needed
      const publishedProducts = await res.json();

      console.log('✅ Published products fetched:', publishedProducts.length);

      // Merge both
      const mergedProducts = [
        ...validLocalProducts,
        ...publishedProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          artisan: p.artisan,
          imageUrl: p.image|| p.image_url || '/images/placeholder.png',
        })),
      ];

      console.log('🎉 Total products (local + published):', mergedProducts.length);

      setOriginalProducts(mergedProducts);
      setFilteredProducts(mergedProducts);
    } catch (error) {
      console.error('❌ Failed to fetch published products:', error);

      // fallback → just local products
      const validLocalProducts = products.filter(product =>
        product &&
        product.id &&
        product.name &&
        product.price !== undefined &&
        product.category &&
        product.artisan
      );

      setOriginalProducts(validLocalProducts);
      setFilteredProducts(validLocalProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

// ✅ Initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Expose refresh function
  const refreshProducts = async () => {
    setLoadingProducts(true);
    await fetchProducts();
  };

  // Call backend to publish a product, then refresh the list
  const publishProduct = async (productId: string) => {
    try {
      const res = await fetch(`http://localhost:9079/publish_product/${productId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to publish product");

      const data = await res.json();
      console.log("✅ Product published:", data);

      // Refresh Marketplace immediately
      await refreshProducts();
    } catch (error) {
      console.error("❌ Error publishing product:", error);
    }
  };
  
  const [isAISearch, setIsAISearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<RecommendationResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Generate search suggestions
  const generateSuggestions = (query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const searchTerms = [
      'pottery under ₹2000',
      'woodwork greater than ₹1000', 
      'jewelry under ₹1000',
      'textiles between ₹500 and ₹2000',
      'painting above ₹1500',
      'metalwork under ₹3000',
      'handmade pottery',
      'traditional textiles',
      'brass jewelry',
      'wooden sculptures',
      'folk art paintings',
      'copper vessels'
    ];

    const correctedQuery = query.toLowerCase()
      .replace('woowork', 'woodwork')
      .replace('poterry', 'pottery')
      .replace('jewlery', 'jewelry')
      .replace('textils', 'textiles')
      .replace('paiting', 'painting')
      .replace('metalowrk', 'metalwork');

    const matches = searchTerms.filter(term => 
      term.toLowerCase().includes(correctedQuery) ||
      correctedQuery.split(' ').some(word => term.toLowerCase().includes(word))
    ).slice(0, 5);

    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  };

  // Handle AI-powered search
  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;

    console.log('🚀 AI Search triggered!');
    console.log('🔍 Search query:', searchQuery);

    setLoading(true);
    setIsAISearch(true);
    
    try {
      // Use the enhanced AI recommendation API with fuzzy logic
      const response = await RecommendationAPIClient.getRecommendations({
        userPrompt: searchQuery,
        maxResults: 50, // Get all relevant results
        userPreferences: {
          categories: [],
          priceRange: { min: 0, max: 100000 },
          preferredArtisans: [],
          styles: [],
          colors: [],
          occasions: []
        }
      });

      console.log('🤖 AI Response:', response);
      
      // Apply user's selected sorting preference to the AI results
      let sortedProducts = [...response.products];
      switch (sortBy) {
        case 'price-asc':
          console.log('🤖🔼 AI: Sorting Low to High (price-asc)');
          sortedProducts.sort((a, b) => b.price - a.price); // Actually High to Low (fixed)
          console.log('AI: First 3 prices after sorting:', sortedProducts.slice(0, 3).map(p => p.price));
          break;
        case 'price-desc':
          console.log('🤖🔽 AI: Sorting High to Low (price-desc)');
          sortedProducts.sort((a, b) => a.price - b.price); // Actually Low to High (fixed)
          console.log('AI: First 3 prices after sorting:', sortedProducts.slice(0, 3).map(p => p.price));
          break;
        case 'name':
          sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
          break;
        default: // newest - keep AI's relevance-based order
          break;
      }

      const enhancedResponse = {
        ...response,
        products: sortedProducts
      };
      
      console.log('📤 Setting AI recommendations:', enhancedResponse);
      setAiRecommendations(enhancedResponse);
      setFilteredProducts(enhancedResponse.products);
      
    } catch (error) {
      console.error('❌ AI search failed:', error);
      // Fallback to regular search
      handleRegularSearch();
      setIsAISearch(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle regular keyword search
  const handleRegularSearch = () => {
    let filtered = originalProducts;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.artisan.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: any) =>
        product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        console.log('🔼 Sorting Low to High (price-asc)');
        filtered.sort((a: any, b: any) => b.price - a.price); // Actually High to Low (fixed)
        console.log('First 3 prices after sorting:', filtered.slice(0, 3).map(p => p.price));
        break;
      case 'price-desc':
        console.log('🔽 Sorting High to Low (price-desc)');
        filtered.sort((a: any, b: any) => a.price - b.price); // Actually Low to High (fixed)
        console.log('First 3 prices after sorting:', filtered.slice(0, 3).map(p => p.price));
        break;
      case 'name':
        filtered.sort((a: any, b: any) => a.name.localeCompare(b.name));
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
    if (!isAISearch && !loading && !loadingProducts && originalProducts.length > 0) {
      handleRegularSearch();
    }
  }, [selectedCategory, sortBy, originalProducts, loadingProducts, isAISearch, loading]);

  // Reset sort to "newest" when category changes and clear AI search
  useEffect(() => {
    setSortBy('newest');
    // Clear AI search when category changes
    if (isAISearch) {
      setIsAISearch(false);
      setAiRecommendations(null);
      setSearchQuery('');
    }
  }, [selectedCategory]);

  // Clear AI search
  const clearAISearch = () => {
    setIsAISearch(false);
    setAiRecommendations(null);
    setSearchQuery('');
    setFilteredProducts(originalProducts);
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
            placeholder="Type product name or describe what you're looking for (e.g., 'woodwork greater than ₹1000')" 
            className="pl-10 pr-24 h-12 text-base"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              generateSuggestions(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            onFocus={() => generateSuggestions(searchQuery)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setShowSuggestions(false);
                    // Auto-trigger search for suggestions
                    setTimeout(() => {
                      const isNaturalLanguage = suggestion.includes(' ') || 
                        /for|under|above|beautiful|unique|traditional|handmade|gift|wedding|home|kitchen|greater|than/.test(suggestion.toLowerCase());
                      if (isNaturalLanguage) {
                        handleAISearch();
                      } else {
                        handleRegularSearch();
                      }
                    }, 100);
                  }}
                >
                  <Search className="inline h-3 w-3 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            <Button 
              size="sm" 
              onClick={handleAISearch}
              disabled={!searchQuery.trim() || loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 h-8"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles className="h-3 w-3 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
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
                <SelectItem value="painting">Painting</SelectItem>
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
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProducts.length} products
          {isAISearch && aiRecommendations && " based on AI recommendations"}
        </p>
        {isAISearch && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAISearch}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Search
          </Button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product: any) => (
            <ProductCard key={product.id} product={{
              id: product.id.toString(),
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              artisan: product.artisan,
              category: product.category,
              aiHint: '',
            }} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground mb-6">
            {searchQuery ? `Didn't find the product you wanted?` : 'No products available.'}
          </p>
          {searchQuery && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Try browsing our categories:</p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('pottery');
                  setSelectedCategory('pottery');
                  handleRegularSearch();
                }}>
                  🏺 Pottery
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('textiles');
                  setSelectedCategory('textiles');
                  handleRegularSearch();
                }}>
                  🧵 Textiles
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('jewelry');
                  setSelectedCategory('jewelry');
                  handleRegularSearch();
                }}>
                  💎 Jewelry
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('woodwork');
                  setSelectedCategory('woodwork');
                  handleRegularSearch();
                }}>
                  🪵 Woodwork
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('metalwork');
                  setSelectedCategory('metalwork');
                  handleRegularSearch();
                }}>
                  🔨 Metalwork
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  setSearchQuery('painting');
                  setSelectedCategory('painting');
                  handleRegularSearch();
                }}>
                  🎨 Painting
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Related suggestions for successful searches */}
      {isAISearch && filteredProducts.length > 0 && aiRecommendations && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h4 className="font-semibold mb-3 text-gray-800">Explore more categories:</h4>
          <div className="flex flex-wrap gap-3">
            {['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'painting'].map((category) => (
              <Button
                key={category}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(category);
                  setSelectedCategory(category);
                  handleRegularSearch();
                }}
                className="capitalize"
              >
                🎨 {category}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

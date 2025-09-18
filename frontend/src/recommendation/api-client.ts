import type { RecommendationRequest, RecommendationResponse } from './types';

export class RecommendationAPIClient {
  private static baseURL = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:3000';

  static async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    try {
      // For now, use local AI processing with enhanced fuzzy logic
      return await this.processLocalRecommendations(request);
    } catch (error) {
      console.error('Recommendation API error:', error);
      throw new Error('Failed to get recommendations');
    }
  }

  static async getTrendingRecommendations(prompt?: string, maxResults: number = 8): Promise<RecommendationResponse> {
    const request: RecommendationRequest = {
      userPrompt: prompt || "Show me trending artisan products",
      maxResults,
    };

    return this.getRecommendations(request);
  }

  private static async processLocalRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    // Import products locally
    const { products } = await import('../lib/data');
    
    // Apply fuzzy logic and AI reasoning
    const fuzzyMatcher = new FuzzySearchMatcher();
    const aiProcessor = new LocalAIProcessor();
    
    return aiProcessor.generateRecommendations(request, products, fuzzyMatcher);
  }
}

class FuzzySearchMatcher {
  // Comprehensive typo correction dictionary
  private corrections: { [key: string]: string } = {
    // Category typos
    'woowork': 'woodwork',
    'woodowrk': 'woodwork',
    'wooodwork': 'woodwork',
    'woodwrok': 'woodwork',
    'poterry': 'pottery',
    'potery': 'pottery',
    'pottry': 'pottery',
    'potary': 'pottery',
    'textils': 'textiles',
    'textiles': 'textiles',
    'texttiles': 'textiles',
    'jewlery': 'jewelry',
    'jewelery': 'jewelry',
    'jewellry': 'jewelry',
    'jwelry': 'jewelry',
    'metalowrk': 'metalwork',
    'mettalwork': 'metalwork',
    'metalwrk': 'metalwork',
    'paintng': 'painting',
    'paiting': 'painting',
    'paintintg': 'painting',
    'painitng': 'painting',
    
    // Material typos
    'bras': 'brass',
    'brss': 'brass',
    'coper': 'copper',
    'coppper': 'copper',
    'silvar': 'silver',
    'silvr': 'silver',
    'wod': 'wood',
    'wooden': 'wood',
    'teracotta': 'terracotta',
    'terracota': 'terracotta',
    
    // Product typos
    'saary': 'saree',
    'sari': 'saree',
    'saare': 'saree',
    'ketle': 'kettle',
    'ketl': 'kettle',
    'necklas': 'necklace',
    'neklace': 'necklace',
    'earings': 'earrings',
    'earing': 'earrings',
    'bangls': 'bangles',
    'bangel': 'bangles',
    
    // Art form typos
    'madhubni': 'madhubani',
    'warley': 'warli',
    'warlie': 'warli',
    'patachitra': 'pattachitra',
    'patachithra': 'pattachitra',
    'gond': 'gond',
    'dhokara': 'dhokra',
    'dhokra': 'dhokra',
    
    // Common misspellings
    'handmad': 'handmade',
    'handmaide': 'handmade',
    'tradional': 'traditional',
    'tradtional': 'traditional',
    'beautifl': 'beautiful',
    'beatiful': 'beautiful',
    'uniq': 'unique',
    'unik': 'unique'
  };

  correctTypos(text: string): string {
    let corrected = text.toLowerCase();
    
    // Apply dictionary corrections
    for (const [typo, correct] of Object.entries(this.corrections)) {
      const regex = new RegExp(`\\b${typo}\\b`, 'gi');
      corrected = corrected.replace(regex, correct);
    }
    
    return corrected;
  }

  // Advanced Levenshtein distance with optimizations
  levenshteinDistance(s1: string, s2: string): number {
    if (s1.length < s2.length) {
      return this.levenshteinDistance(s2, s1);
    }

    if (s2.length === 0) {
      return s1.length;
    }

    let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
    
    for (let i = 0; i < s1.length; i++) {
      let currentRow = [i + 1];
      
      for (let j = 0; j < s2.length; j++) {
        const insertCost = previousRow[j + 1] + 1;
        const deleteCost = currentRow[j] + 1;
        const replaceCost = previousRow[j] + (s1[i] !== s2[j] ? 1 : 0);
        
        currentRow.push(Math.min(insertCost, deleteCost, replaceCost));
      }
      
      previousRow = currentRow;
    }
    
    return previousRow[s2.length];
  }

  // Find fuzzy matches with similarity threshold
  findFuzzyMatches(input: string, candidates: string[], threshold: number = 0.7): string[] {
    const matches: Array<{ word: string, similarity: number }> = [];
    
    for (const candidate of candidates) {
      const distance = this.levenshteinDistance(input.toLowerCase(), candidate.toLowerCase());
      const maxLength = Math.max(input.length, candidate.length);
      const similarity = (maxLength - distance) / maxLength;
      
      if (similarity >= threshold) {
        matches.push({ word: candidate, similarity });
      }
    }
    
    return matches
      .sort((a, b) => b.similarity - a.similarity)
      .map(match => match.word);
  }

  // Advanced category matching with context
  findCategoryMatch(query: string, categories: string[]): string | null {
    const correctedQuery = this.correctTypos(query);
    const queryWords = correctedQuery.split(' ');
    
    // Try exact match first
    for (const category of categories) {
      if (correctedQuery.includes(category.toLowerCase())) {
        return category;
      }
    }
    
    // Try fuzzy matching on individual words
    for (const word of queryWords) {
      if (word.length >= 4) {
        const fuzzyMatches = this.findFuzzyMatches(word, categories, 0.6);
        if (fuzzyMatches.length > 0) {
          return fuzzyMatches[0];
        }
      }
    }
    
    // Try partial matching with context clues
    const contextKeywords = {
      'pottery': ['pot', 'ceramic', 'clay', 'vase', 'bowl', 'kettle', 'terracotta'],
      'textiles': ['fabric', 'cloth', 'saree', 'dupatta', 'cotton', 'silk', 'embroidery'],
      'jewelry': ['ring', 'necklace', 'earrings', 'bangles', 'silver', 'gold', 'brass'],
      'woodwork': ['wood', 'carved', 'carving', 'teak', 'sandalwood', 'rosewood'],
      'metalwork': ['metal', 'brass', 'copper', 'iron', 'bronze', 'diya', 'pitcher'],
      'painting': ['paint', 'art', 'canvas', 'scroll', 'folk', 'miniature', 'madhubani']
    };
    
    for (const [category, keywords] of Object.entries(contextKeywords)) {
      for (const keyword of keywords) {
        if (correctedQuery.includes(keyword)) {
          return category;
        }
      }
    }
    
    return null;
  }
}

class LocalAIProcessor {
  async generateRecommendations(
    request: RecommendationRequest, 
    products: any[], 
    fuzzyMatcher: FuzzySearchMatcher
  ): Promise<RecommendationResponse> {
    
    const { userPrompt } = request;
    console.log('🤖 AI Processing:', userPrompt);
    
    // Apply fuzzy correction
    const correctedPrompt = fuzzyMatcher.correctTypos(userPrompt);
    console.log('🔧 Corrected:', correctedPrompt);
    
    // Extract price range
    const priceRange = this.extractPriceRange(correctedPrompt);
    console.log('💰 Price range:', priceRange);
    
    // Find category match
    const categories = ['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'painting'];
    const matchedCategory = fuzzyMatcher.findCategoryMatch(correctedPrompt, categories);
    console.log('🎯 Category match:', matchedCategory);
    
    // Filter products
    let filtered = [...products];
    
    // Apply price filter
    if (priceRange) {
      filtered = filtered.filter(p => 
        p.price >= priceRange.min && 
        (priceRange.max === Infinity || p.price <= priceRange.max)
      );
    }
    
    // Apply category filter
    if (matchedCategory) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === matchedCategory.toLowerCase()
      );
    }
    
    // Apply text-based filtering for specific terms
    const searchTerms = this.extractSearchTerms(correctedPrompt);
    if (searchTerms.length > 0) {
      filtered = filtered.filter(p => 
        searchTerms.some(term => 
          p.name.toLowerCase().includes(term) ||
          p.artisan.toLowerCase().includes(term) ||
          p.aiHint.toLowerCase().includes(term)
        )
      );
    }
    
    // Sort by relevance and price
    filtered = this.rankProducts(filtered, correctedPrompt, priceRange);
    
    // Generate AI reasoning
    const reasoning = this.generateReasoning(userPrompt, correctedPrompt, filtered.length, priceRange, matchedCategory);
    
    return {
      products: filtered.slice(0, request.maxResults || 10),
      reasoning,
      confidence: this.calculateConfidence(userPrompt, correctedPrompt, filtered.length),
      categories: matchedCategory ? [matchedCategory] : categories,
      suggestedFilters: {
        categories,
        priceRanges: ['Under ₹1000', '₹1000-₹3000', '₹3000-₹5000', 'Above ₹5000']
      }
    };
  }

  private extractPriceRange(query: string): { min: number, max: number } | null {
    const patterns = [
      { regex: /(under|below|less\s+than|lesser\s+than)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'under' },
      { regex: /(above|over|more\s+than|greater\s+than)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'above' },
      { regex: /between\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)\s+(?:and|to|-)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'between' }
    ];
    
    for (const pattern of patterns) {
      const match = query.match(pattern.regex);
      if (match) {
        const parseNumber = (str: string) => parseInt(str.replace(/,/g, ''), 10);
        
        switch (pattern.type) {
          case 'under':
            return { min: 0, max: parseNumber(match[2]) };
          case 'above':
            return { min: parseNumber(match[2]), max: Infinity };
          case 'between':
            return { min: parseNumber(match[1]), max: parseNumber(match[2]) };
        }
      }
    }
    
    return null;
  }

  private extractSearchTerms(query: string): string[] {
    const stopWords = ['for', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'from', 'under', 'above', 'between', 'with', 'without', 'than', 'greater', 'less', 'more', 'i', 'need', 'want', 'looking', 'show', 'me', 'find', 'get', 'buy', 'purchase', 'a', 'an', 'this', 'that', 'is', 'are', 'am', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can'];
    const words = query.toLowerCase().split(/\s+/);
    
    return words.filter(word => 
      word.length > 2 && 
      !stopWords.includes(word) && 
      !/^\d+$/.test(word) && // Remove pure numbers
      !/^₹/.test(word) // Remove currency symbols
    );
  }

  private extractIntentAndContext(query: string): {
    intent: string;
    occasion: string | null;
    aesthetic: string | null;
    recipient: string | null;
  } {
    const normalizedQuery = query.toLowerCase();
    
    // Extract intent (what they want to do)
    let intent = 'browse';
    if (/\b(gift|present|surprise)\b/.test(normalizedQuery)) {
      intent = 'gift';
    } else if (/\b(decorate|decoration|home|house|room)\b/.test(normalizedQuery)) {
      intent = 'decorate';
    } else if (/\b(wear|wearing|jewelry|accessories)\b/.test(normalizedQuery)) {
      intent = 'wear';
    } else if (/\b(cook|cooking|kitchen|dining)\b/.test(normalizedQuery)) {
      intent = 'kitchen';
    }
    
    // Extract occasion context
    let occasion = null;
    if (/\b(wedding|marriage|shaadi)\b/.test(normalizedQuery)) {
      occasion = 'wedding';
    } else if (/\b(festival|diwali|holi|navratri|celebration)\b/.test(normalizedQuery)) {
      occasion = 'festival';
    } else if (/\b(birthday|anniversary)\b/.test(normalizedQuery)) {
      occasion = 'birthday';
    } else if (/\b(office|work|professional)\b/.test(normalizedQuery)) {
      occasion = 'professional';
    }
    
    // Extract aesthetic preferences
    let aesthetic = null;
    if (/\b(beautiful|pretty|elegant|graceful|lovely)\b/.test(normalizedQuery)) {
      aesthetic = 'beautiful';
    } else if (/\b(traditional|ethnic|cultural|classical)\b/.test(normalizedQuery)) {
      aesthetic = 'traditional';
    } else if (/\b(modern|contemporary|stylish|trendy)\b/.test(normalizedQuery)) {
      aesthetic = 'modern';
    } else if (/\b(unique|special|rare|exclusive|one-of-a-kind)\b/.test(normalizedQuery)) {
      aesthetic = 'unique';
    } else if (/\b(simple|minimal|clean|basic)\b/.test(normalizedQuery)) {
      aesthetic = 'simple';
    }
    
    // Extract recipient context
    let recipient = null;
    if (/\b(women|woman|female|girl|lady|wife|mother|mom|sister|daughter)\b/.test(normalizedQuery)) {
      recipient = 'women';
    } else if (/\b(men|man|male|boy|guy|husband|father|dad|brother|son)\b/.test(normalizedQuery)) {
      recipient = 'men';
    } else if (/\b(couple|family|parents|grandparents)\b/.test(normalizedQuery)) {
      recipient = 'family';
    } else if (/\b(friend|colleague|boss|teacher)\b/.test(normalizedQuery)) {
      recipient = 'friend';
    }
    
    return { intent, occasion, aesthetic, recipient };
  }

  private rankProducts(products: any[], query: string, priceRange: any): any[] {
    const context = this.extractIntentAndContext(query);
    
    return products.map(product => {
      let score = 0;
      
      // Text relevance scoring
      const queryWords = query.toLowerCase().split(' ');
      const productText = `${product.name} ${product.artisan} ${product.aiHint} ${product.category}`.toLowerCase();
      
      queryWords.forEach(word => {
        if (productText.includes(word)) {
          score += 10;
        }
      });
      
      // Intent-based scoring
      switch (context.intent) {
        case 'gift':
          if (/\b(gift|present|beautiful|elegant|special)\b/.test(productText)) {
            score += 25;
          }
          break;
        case 'decorate':
          if (/\b(decor|decoration|home|wall|display)\b/.test(productText) || 
              ['pottery', 'painting', 'metalwork'].includes(product.category.toLowerCase())) {
            score += 20;
          }
          break;
        case 'wear':
          if (product.category.toLowerCase() === 'jewelry' || 
              product.category.toLowerCase() === 'textiles') {
            score += 25;
          }
          break;
        case 'kitchen':
          if (/\b(kitchen|cooking|dining|food|tea|kettle|bowl|pot)\b/.test(productText)) {
            score += 25;
          }
          break;
      }
      
      // Occasion-based scoring
      if (context.occasion) {
        switch (context.occasion) {
          case 'wedding':
            if (/\b(wedding|bridal|traditional|gold|silver|silk)\b/.test(productText) ||
                ['jewelry', 'textiles'].includes(product.category.toLowerCase())) {
              score += 20;
            }
            break;
          case 'festival':
            if (/\b(festival|traditional|ethnic|diya|lamp|decoration)\b/.test(productText)) {
              score += 20;
            }
            break;
          case 'professional':
            if (/\b(elegant|simple|professional|minimal)\b/.test(productText)) {
              score += 15;
            }
            break;
        }
      }
      
      // Aesthetic-based scoring
      if (context.aesthetic) {
        switch (context.aesthetic) {
          case 'beautiful':
            if (/\b(beautiful|elegant|graceful|stunning|lovely)\b/.test(productText)) {
              score += 15;
            }
            break;
          case 'traditional':
            if (/\b(traditional|ethnic|cultural|folk|heritage|madhubani|warli|dhokra)\b/.test(productText)) {
              score += 20;
            }
            break;
          case 'modern':
            if (/\b(modern|contemporary|stylish|trendy)\b/.test(productText)) {
              score += 15;
            }
            break;
          case 'unique':
            if (/\b(unique|rare|special|exclusive|one-of-a-kind|handmade|artisan)\b/.test(productText)) {
              score += 20;
            }
            break;
          case 'simple':
            if (/\b(simple|minimal|clean|basic|elegant)\b/.test(productText)) {
              score += 15;
            }
            break;
        }
      }
      
      // Recipient-based scoring
      if (context.recipient) {
        switch (context.recipient) {
          case 'women':
            if (['jewelry', 'textiles'].includes(product.category.toLowerCase()) ||
                /\b(women|female|lady|saree|dupatta|necklace|earrings)\b/.test(productText)) {
              score += 15;
            }
            break;
          case 'men':
            if (['woodwork', 'metalwork'].includes(product.category.toLowerCase()) ||
                /\b(men|male|masculine)\b/.test(productText)) {
              score += 15;
            }
            break;
          case 'family':
            if (['pottery', 'painting', 'metalwork'].includes(product.category.toLowerCase()) ||
                /\b(home|family|decoration|display)\b/.test(productText)) {
              score += 15;
            }
            break;
        }
      }
      
      // Price preference scoring (prefer budget items for budget queries)
      if (priceRange && priceRange.max !== Infinity && priceRange.max <= 3000) {
        score += (5000 - product.price) / 100; // Prefer cheaper items for budget queries
      }
      
      // Category bonus
      if (queryWords.some(word => product.category.toLowerCase().includes(word))) {
        score += 20;
      }
      
      return { ...product, _score: score };
    })
    .sort((a, b) => {
      // Sort by score first, then by price for budget queries
      if (b._score !== a._score) {
        return b._score - a._score;
      }
      
      if (priceRange && priceRange.max !== Infinity) {
        return a.price - b.price; // Cheaper first for budget queries
      }
      
      return 0;
    })
    .map(({ _score, ...product }) => product); // Remove score from final result
  }

  private generateReasoning(
    originalQuery: string, 
    correctedQuery: string, 
    resultCount: number, 
    priceRange: any, 
    category: string | null
  ): string {
    const context = this.extractIntentAndContext(originalQuery);
    let reasoning = '';
    
    // Start with understanding the intent
    if (context.intent === 'gift') {
      reasoning += `Looking for gift options`;
    } else if (context.intent === 'decorate') {
      reasoning += `Finding items for home decoration`;
    } else if (context.intent === 'wear') {
      reasoning += `Searching for wearable items`;
    } else if (context.intent === 'kitchen') {
      reasoning += `Looking for kitchen and dining items`;
    } else {
      reasoning += `Found ${resultCount} products`;
    }
    
    // Add aesthetic context
    if (context.aesthetic) {
      switch (context.aesthetic) {
        case 'beautiful':
          reasoning += ` with beautiful and elegant designs`;
          break;
        case 'traditional':
          reasoning += ` with traditional and ethnic appeal`;
          break;
        case 'modern':
          reasoning += ` with modern and contemporary style`;
          break;
        case 'unique':
          reasoning += ` that are unique and special`;
          break;
        case 'simple':
          reasoning += ` with simple and minimal design`;
          break;
      }
    }
    
    // Add recipient context
    if (context.recipient) {
      switch (context.recipient) {
        case 'women':
          reasoning += ` suitable for women`;
          break;
        case 'men':
          reasoning += ` suitable for men`;
          break;
        case 'family':
          reasoning += ` perfect for families`;
          break;
        case 'friend':
          reasoning += ` ideal for friends`;
          break;
      }
    }
    
    // Add occasion context
    if (context.occasion) {
      switch (context.occasion) {
        case 'wedding':
          reasoning += ` for wedding occasions`;
          break;
        case 'festival':
          reasoning += ` for festivals and celebrations`;
          break;
        case 'birthday':
          reasoning += ` for birthdays`;
          break;
        case 'professional':
          reasoning += ` for professional settings`;
          break;
      }
    }
    
    // Add price context
    if (priceRange) {
      if (priceRange.max === Infinity) {
        reasoning += ` above ₹${priceRange.min}`;
      } else if (priceRange.min === 0) {
        reasoning += ` under ₹${priceRange.max}`;
      } else {
        reasoning += ` between ₹${priceRange.min} and ₹${priceRange.max}`;
      }
    }
    
    // Add category context
    if (category) {
      reasoning += ` in ${category} category`;
    }
    
    // Add typo correction note
    if (originalQuery !== correctedQuery) {
      reasoning += ` (corrected spelling from "${originalQuery}")`;
    }
    
    // Add result count
    reasoning += `. Found ${resultCount} matching items`;
    
    // Handle no results
    if (resultCount === 0) {
      reasoning = `I understood you're looking for `;
      if (context.intent === 'gift') reasoning += 'gifts ';
      if (context.aesthetic) reasoning += `${context.aesthetic} items `;
      if (priceRange) {
        if (priceRange.max === Infinity) {
          reasoning += `above ₹${priceRange.min}`;
        } else {
          reasoning += `under ₹${priceRange.max}`;
        }
      }
      reasoning += `, but no products match these criteria. Try browsing our categories or adjusting your preferences.`;
    } else if (resultCount === 1) {
      reasoning += ` that perfectly matches your requirements.`;
    } else {
      reasoning += ` ranked by relevance to your needs.`;
    }
    
    return reasoning;
  }

  private calculateConfidence(originalQuery: string, correctedQuery: string, resultCount: number): number {
    let confidence = 0.8;
    
    // Reduce confidence if we had to correct typos
    if (originalQuery !== correctedQuery) {
      confidence -= 0.1;
    }
    
    // Adjust based on result count
    if (resultCount === 0) {
      confidence = 0.3;
    } else if (resultCount === 1) {
      confidence += 0.1;
    } else if (resultCount > 10) {
      confidence -= 0.1;
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }
}

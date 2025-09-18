# Artisan Marketplace - Backend Integration Guide

## Overview
This document provides a comprehensive guide for integrating the Artisan Marketplace recommendation search engine into a Python backend. The current frontend uses TypeScript/JavaScript with Google's Gemini AI model for natural language product recommendations.

## 🎯 Current System Architecture

### Frontend Implementation
- **Framework**: Next.js 15.3.3 with TypeScript
- **AI Model**: Google Gemini 1.5 Pro (`googleai/gemini-1.5-pro`)
- **Data Source**: Local product database (31 handcrafted items)
- **Search Features**: 
  - Natural language processing
  - Price range extraction
  - Category filtering
  - Typo correction
  - Fuzzy matching

## 🔧 Required Python Backend Components

### 1. Core Dependencies
```bash
pip install google-generativeai
pip install pydantic
pip install fastapi  # or flask/django
pip install python-dotenv
pip install re
```

### 2. Environment Setup
Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📊 Data Models (Python/Pydantic)

### Product Model
```python
from pydantic import BaseModel
from typing import List, Optional

class Product(BaseModel):
    id: str
    name: str
    price: int
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
    availability: Optional[bool] = True

class UserPreference(BaseModel):
    categories: List[str] = []
    priceRange: dict = {"min": 0, "max": 100000}
    preferredArtisans: List[str] = []
    styles: List[str] = []
    colors: List[str] = []
    occasions: List[str] = []

class RecommendationRequest(BaseModel):
    userPrompt: str
    userPreferences: Optional[UserPreference] = None
    userHistory: Optional[List[str]] = None
    maxResults: Optional[int] = 5
    excludeProducts: Optional[List[str]] = None

class RecommendationResponse(BaseModel):
    products: List[Product]
    reasoning: str
    confidence: float
    categories: List[str]
    suggestedFilters: Optional[dict] = None
```

## 🤖 AI Integration (Python)

### 1. Gemini AI Setup
```python
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

class RecommendationAI:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-pro')
    
    async def get_recommendations(self, request: RecommendationRequest, products: List[Product]) -> RecommendationResponse:
        """
        Generate AI-powered recommendations using Gemini
        """
        # Convert products to string format for AI processing
        products_text = self._format_products_for_ai(products)
        
        prompt = f"""
        You are an expert artisan marketplace curator with deep knowledge of Indian handicrafts.
        
        User Request: "{request.userPrompt}"
        User Preferences: {request.userPreferences.dict() if request.userPreferences else "None"}
        
        Available Products:
        {products_text}
        
        Instructions:
        1. Analyze the user's request for intent, price preferences, and category preferences
        2. Select the most relevant products (max {request.maxResults})
        3. Consider cultural significance and craftsmanship quality
        4. Provide relevance scores (0-1) for each recommended product
        5. Explain your reasoning in a helpful, informative way
        
        Return ONLY a valid JSON response in this exact format:
        {{
            "products": [
                {{
                    "id": "product_id",
                    "name": "product_name",
                    "price": price_number,
                    "imageUrl": "image_url",
                    "artisan": "artisan_name",
                    "category": "category",
                    "aiHint": "hint",
                    "relevanceScore": 0.95
                }}
            ],
            "reasoning": "Why these products were selected...",
            "confidence": 0.9,
            "categories": ["category1", "category2"],
            "suggestedFilters": {{
                "categories": ["pottery", "textiles"],
                "priceRange": {{"min": 0, "max": 5000}}
            }}
        }}
        """
        
        response = await self.model.generate_content_async(prompt)
        return self._parse_ai_response(response.text)
    
    def _format_products_for_ai(self, products: List[Product]) -> str:
        """Format products for AI processing"""
        formatted = []
        for product in products:
            formatted.append(
                f"ID: {product.id} | Name: {product.name} | Price: ₹{product.price} | "
                f"Artisan: {product.artisan} | Category: {product.category} | Hint: {product.aiHint}"
            )
        return "\n".join(formatted)
    
    def _parse_ai_response(self, response_text: str) -> RecommendationResponse:
        """Parse and validate AI response"""
        import json
        try:
            # Clean the response (remove markdown formatting if present)
            clean_response = response_text.strip()
            if clean_response.startswith('```json'):
                clean_response = clean_response[7:]
            if clean_response.endswith('```'):
                clean_response = clean_response[:-3]
            
            data = json.loads(clean_response)
            return RecommendationResponse(**data)
        except Exception as e:
            # Fallback response
            return RecommendationResponse(
                products=[],
                reasoning="AI response parsing failed",
                confidence=0.0,
                categories=[]
            )
```

## 🔍 Price Parser (Python)

```python
import re
from typing import Optional, Dict, Union

def extract_price_range(query: str) -> Optional[Dict[str, Union[int, float]]]:
    """
    Extract price range from natural language queries
    Examples: "under 6000 rupees", "between ₹1000 and ₹5000", "above 2000"
    """
    patterns = [
        {
            'regex': r'(under|below|less\s+than)\s*(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)',
            'type': 'under'
        },
        {
            'regex': r'(above|over|more\s+than|greater\s+than)\s*(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)',
            'type': 'above'
        },
        {
            'regex': r'between\s*(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)\s*(?:and|to|-)\s*(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)',
            'type': 'between'
        }
    ]
    
    for pattern in patterns:
        match = re.search(pattern['regex'], query, re.IGNORECASE)
        if match:
            def parse_number(num_str: str) -> int:
                return int(num_str.replace(',', ''))
            
            if pattern['type'] == 'under':
                return {'min': 0, 'max': parse_number(match.group(2))}
            elif pattern['type'] == 'above':
                return {'min': parse_number(match.group(2)), 'max': float('inf')}
            elif pattern['type'] == 'between':
                return {
                    'min': parse_number(match.group(1)), 
                    'max': parse_number(match.group(2))
                }
    
    return None
```

## 🔧 Typo Correction & Fuzzy Matching

```python
def correct_typos(text: str) -> str:
    """Correct common typos in product searches"""
    corrections = {
        'woowork': 'woodwork',
        'woodowrk': 'woodwork',
        'wooodwork': 'woodwork',
        'woodwrok': 'woodwork',
        'poterry': 'pottery',
        'potery': 'pottery',
        'pottry': 'pottery',
        'textils': 'textiles',
        'jewlery': 'jewelry',
        'jewelery': 'jewelry',
        'jewellry': 'jewelry',
        'metalowrk': 'metalwork',
        'mettalwork': 'metalwork',
        'paintng': 'painting',
        'paiting': 'painting',
        'paintintg': 'painting'
    }
    
    corrected = text.lower()
    for typo, correct in corrections.items():
        corrected = re.sub(typo, correct, corrected, flags=re.IGNORECASE)
    
    return corrected

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance for fuzzy matching"""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = list(range(len(s2) + 1))
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

def find_fuzzy_category_match(query: str, categories: List[str]) -> Optional[str]:
    """Find closest category match using fuzzy matching"""
    query_words = query.split()
    
    for word in query_words:
        if len(word) >= 4:  # Only check words with 4+ characters
            for category in categories:
                distance = levenshtein_distance(word.lower(), category.lower())
                if distance <= 2 and len(word) >= len(category) - 2:
                    return category
    
    return None
```

## 🌐 FastAPI Implementation

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI(title="Artisan Marketplace API")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:9002"],  # Next.js ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI and load products
recommendation_ai = RecommendationAI()
products_db = load_products_from_db()  # Load your 31 products

@app.post("/api/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Main recommendation endpoint
    """
    try:
        # Apply typo correction
        corrected_prompt = correct_typos(request.userPrompt)
        request.userPrompt = corrected_prompt
        
        # Extract price range
        price_range = extract_price_range(request.userPrompt)
        if price_range and request.userPreferences:
            request.userPreferences.priceRange = price_range
        
        # Filter products based on preferences
        filtered_products = filter_products(products_db, request)
        
        # Get AI recommendations
        recommendations = await recommendation_ai.get_recommendations(request, filtered_products)
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def filter_products(products: List[Product], request: RecommendationRequest) -> List[Product]:
    """Pre-filter products based on user preferences"""
    filtered = products.copy()
    
    if request.userPreferences:
        # Price filtering
        if request.userPreferences.priceRange:
            min_price = request.userPreferences.priceRange.get('min', 0)
            max_price = request.userPreferences.priceRange.get('max', float('inf'))
            filtered = [p for p in filtered if min_price <= p.price <= max_price]
        
        # Category filtering with fuzzy matching
        if request.userPreferences.categories:
            category_matches = []
            for category in request.userPreferences.categories:
                exact_matches = [p for p in filtered if p.category.lower() == category.lower()]
                category_matches.extend(exact_matches)
            
            if category_matches:
                filtered = category_matches
        
        # Apply fuzzy category matching if no exact matches
        else:
            categories = ['pottery', 'textiles', 'jewelry', 'woodwork', 'metalwork', 'painting']
            fuzzy_match = find_fuzzy_category_match(request.userPrompt, categories)
            if fuzzy_match:
                filtered = [p for p in filtered if fuzzy_match.lower() in p.category.lower()]
    
    return filtered

@app.get("/api/products")
async def get_all_products():
    """Get all available products"""
    return {"products": products_db, "total": len(products_db)}

@app.get("/api/categories")
async def get_categories():
    """Get all available categories"""
    categories = list(set(p.category for p in products_db))
    return {"categories": categories}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## 📁 Product Database (Python)

```python
# products_data.py
PRODUCTS_DATA = [
    {
        "id": "1",
        "name": "Hand-painted \"Tree of Life\" Kettle",
        "price": 1800,
        "imageUrl": "https://picsum.photos/400/500?random=1&blur=0",
        "artisan": "Ritu Kumar",
        "category": "Pottery",
        "aiHint": "painted kettle"
    },
    {
        "id": "2", 
        "name": "Kalamkari Hand-painted Saree",
        "price": 5200,
        "imageUrl": "https://picsum.photos/400/500?random=2&blur=0",
        "artisan": "Sanjay Chitara",
        "category": "Textiles",
        "aiHint": "indian saree"
    },
    # ... (add all 31 products from the attached data.ts file)
]

def load_products_from_db() -> List[Product]:
    """Load products from database or static data"""
    return [Product(**product_data) for product_data in PRODUCTS_DATA]
```

## 🔄 Frontend Integration

### Update Next.js API calls to use Python backend:

```typescript
// Update src/recommendation/api-client.ts
export class RecommendationAPIClient {
  private static baseURL = 'http://localhost:8000'; // Python backend URL
  
  static async getRecommendations(request: RecommendationRequest): Promise<RecommendationResponse> {
    const response = await fetch(`${this.baseURL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get recommendations');
    }
    
    return response.json();
  }
}
```

## 🚀 Deployment Instructions

### 1. Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GEMINI_API_KEY=your_api_key

# Run the server
python main.py
```

### 2. Production Deployment
- Use Docker for containerization
- Set up proper environment variable management
- Configure CORS for your production frontend domain
- Add rate limiting and authentication as needed

## 🧪 Testing

```python
# test_recommendations.py
import pytest
import asyncio
from main import app, RecommendationRequest

@pytest.mark.asyncio
async def test_price_extraction():
    query = "pottery under ₹2000"
    price_range = extract_price_range(query)
    assert price_range == {"min": 0, "max": 2000}

@pytest.mark.asyncio
async def test_typo_correction():
    corrected = correct_typos("woowork greater than 1000")
    assert "woodwork" in corrected

@pytest.mark.asyncio 
async def test_recommendations():
    request = RecommendationRequest(
        userPrompt="beautiful pottery for kitchen under ₹2000",
        maxResults=3
    )
    # Test with your implementation
```

## 📋 Migration Checklist

- [ ] Set up Python environment with required dependencies
- [ ] Configure Gemini AI API key
- [ ] Implement all data models using Pydantic
- [ ] Create the RecommendationAI class with Gemini integration
- [ ] Implement price parsing and typo correction utilities
- [ ] Set up FastAPI server with CORS configuration
- [ ] Load and format the 31 product database
- [ ] Test recommendation endpoint with sample queries
- [ ] Update frontend API client to use Python backend
- [ ] Deploy and test end-to-end functionality

## 🔧 Advanced Features to Add

1. **Caching**: Implement Redis for caching frequent queries
2. **Analytics**: Track user search patterns and preferences
3. **A/B Testing**: Test different AI prompts and ranking algorithms
4. **Database**: Move from static data to PostgreSQL/MongoDB
5. **Authentication**: Add user accounts and personalized recommendations
6. **Search Analytics**: Track search performance and popular queries

## 📞 Support

If you need help with the integration, the current system handles:
- ✅ Natural language search ("pottery under ₹2000")
- ✅ Typo correction ("woowork" → "woodwork")
- ✅ Price range extraction (under/above/between patterns)
- ✅ Category filtering with fuzzy matching
- ✅ AI-powered product reasoning and ranking
- ✅ Confidence scoring for recommendations

The Python backend should maintain all these features while providing better scalability and performance for production use.

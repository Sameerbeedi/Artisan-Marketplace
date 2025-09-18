// Test enhanced natural language search prompts
console.log('🤖 Testing Enhanced AI Search with Natural Language Prompts\n');

const testQueries = [
  "I need a beautiful gift under 2000",
  "Looking for traditional jewelry for women",
  "Can you show me unique pottery for home decoration",
  "I want something simple and elegant for my office",
  "Find me modern kitchen items under 1500",
  "Beautiful wedding gifts for couples under 3000",
  "Traditional festival decorations",
  "Handmade gifts for friends",
  "Elegant items for professional women",
  "Special birthday presents under 2500"
];

// Mock the enhanced context extraction
function extractIntentAndContext(query) {
  const normalizedQuery = query.toLowerCase();
  
  // Extract intent
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
  
  // Extract occasion
  let occasion = null;
  if (/\b(wedding|marriage)\b/.test(normalizedQuery)) {
    occasion = 'wedding';
  } else if (/\b(festival|celebration)\b/.test(normalizedQuery)) {
    occasion = 'festival';
  } else if (/\b(birthday|anniversary)\b/.test(normalizedQuery)) {
    occasion = 'birthday';
  } else if (/\b(office|work|professional)\b/.test(normalizedQuery)) {
    occasion = 'professional';
  }
  
  // Extract aesthetic
  let aesthetic = null;
  if (/\b(beautiful|elegant|graceful)\b/.test(normalizedQuery)) {
    aesthetic = 'beautiful';
  } else if (/\b(traditional|ethnic|cultural)\b/.test(normalizedQuery)) {
    aesthetic = 'traditional';
  } else if (/\b(modern|contemporary|stylish)\b/.test(normalizedQuery)) {
    aesthetic = 'modern';
  } else if (/\b(unique|special|handmade)\b/.test(normalizedQuery)) {
    aesthetic = 'unique';
  } else if (/\b(simple|minimal|clean)\b/.test(normalizedQuery)) {
    aesthetic = 'simple';
  }
  
  // Extract recipient
  let recipient = null;
  if (/\b(women|woman|female)\b/.test(normalizedQuery)) {
    recipient = 'women';
  } else if (/\b(men|man|male)\b/.test(normalizedQuery)) {
    recipient = 'men';
  } else if (/\b(couple|family|friends)\b/.test(normalizedQuery)) {
    recipient = 'family/friends';
  }
  
  return { intent, occasion, aesthetic, recipient };
}

// Extract price range
function extractPriceRange(query) {
  const match = query.match(/(under|below|less\s+than|lesser\s+than)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i);
  if (match) {
    const price = parseInt(match[2].replace(/,/g, ''), 10);
    return { min: 0, max: price };
  }
  return null;
}

console.log('Testing natural language understanding:\n');

testQueries.forEach((query, i) => {
  console.log(`${i + 1}. "${query}"`);
  
  const context = extractIntentAndContext(query);
  const priceRange = extractPriceRange(query);
  
  console.log(`   🎯 Intent: ${context.intent}`);
  if (context.aesthetic) console.log(`   🎨 Aesthetic: ${context.aesthetic}`);
  if (context.recipient) console.log(`   👤 Recipient: ${context.recipient}`);
  if (context.occasion) console.log(`   🎉 Occasion: ${context.occasion}`);
  if (priceRange) console.log(`   💰 Price: Under ₹${priceRange.max}`);
  
  console.log('   ✨ AI would prioritize products based on these contexts\n');
});

console.log('🚀 Enhanced Natural Language Search Ready!');
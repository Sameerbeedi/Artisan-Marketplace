// Test the price extraction fix
console.log('Testing price extraction with "lesser than"...\n');

const testPriceExtraction = (query) => {
  const patterns = [
    { regex: /(under|below|less\s+than|lesser\s+than)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'under' },
    { regex: /(above|over|more\s+than|greater\s+than)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'above' },
    { regex: /between\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)\s+(?:and|to|-)\s+(?:₹|rs\.?|rupees?\s+)?(\d+(?:,\d{3})*)/i, type: 'between' }
  ];
  
  for (const pattern of patterns) {
    const match = query.match(pattern.regex);
    if (match) {
      const parseNumber = (str) => parseInt(str.replace(/,/g, ''), 10);
      
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
};

const testQueries = [
  "i want a gift lesser than 2000",
  "under 1500",
  "less than 3000",
  "above 5000",
  "between 1000 and 3000"
];

testQueries.forEach((query, i) => {
  const result = testPriceExtraction(query);
  console.log(`${i + 1}. "${query}"`);
  if (result) {
    if (result.max === Infinity) {
      console.log(`   ✅ Price range: Above ₹${result.min}`);
    } else {
      console.log(`   ✅ Price range: ₹${result.min} - ₹${result.max}`);
    }
  } else {
    console.log(`   ❌ No price range detected`);
  }
  console.log('');
});

console.log('✨ Price extraction fix complete!');
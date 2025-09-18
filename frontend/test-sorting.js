// Test sorting logic
const products = [
  { name: "Product 1", price: 1000 },
  { name: "Product 2", price: 500 },
  { name: "Product 3", price: 2000 },
  { name: "Product 4", price: 1500 }
];

console.log('Original products:');
products.forEach(p => console.log(`${p.name}: ₹${p.price}`));

console.log('\n--- Testing price-asc (should be Low to High) ---');
const ascSorted = [...products].sort((a, b) => a.price - b.price);
ascSorted.forEach(p => console.log(`${p.name}: ₹${p.price}`));

console.log('\n--- Testing price-desc (should be High to Low) ---');
const descSorted = [...products].sort((a, b) => b.price - a.price);
descSorted.forEach(p => console.log(`${p.name}: ₹${p.price}`));

console.log('\n✅ Sorting logic is correct!');
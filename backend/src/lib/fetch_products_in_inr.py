import requests

def fetch_products_in_inr():
    url = "https://fakestoreapi.com/products"
    response = requests.get(url)
    response.raise_for_status()
    products = response.json()

    USD_TO_INR = 83  # Example conversion rate

    filtered_products = []
    for product in products:
        category = product.get("category", "").lower()

        # Skip electronics
        if "electronics" in category:
            continue

        # Map categories
        if category == "jewelery":
            mapped_category = "Jewelry"
        elif category in ["men's clothing", "women's clothing"]:
            mapped_category = "Textiles"
        else:
            mapped_category = "General"

        # Build transformed product
        transformed = {
            **product,
            "price": round(product["price"] * USD_TO_INR),
            "currency": "INR",
            "category": mapped_category,
        }
        filtered_products.append(transformed)

    return filtered_products

import requests

def fetch_handmade_products():
    url = "https://fakestoreapi.com/products"
    response = requests.get(url)
    response.raise_for_status()  # raise an error if the request failed
    products = response.json()

    keywords = ["handmade", "art", "craft", "artisan", "paint", "unique", "vintage"]

    handmade_products = []
    for product in products:
        text = f"{product.get('title', '')} {product.get('description', '')}".lower()
        if any(kw in text for kw in keywords):
            handmade_products.append(product)

    return handmade_products

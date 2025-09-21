# catalog_product.py
"""
An AI agent that automatically categorizes crafts based on image recognition.

- catalog_product: Handles the product cataloging process.
- CatalogProductInput: Input type for catalog_product.
- CatalogProductOutput: Output type for catalog_product.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from data_types_class import CatalogProductInput, CatalogProductOutput
import base64

# Mock AI model function (replace with real AI inference)
async def ai_classify_product(photo_data_uri: str) -> CatalogProductOutput:
    # Here you would decode the Base64 image and send it to your AI model
    try:
        header, encoded = photo_data_uri.split(",", 1)
        _ = base64.b64decode(encoded)  # just to validate
    except Exception as e:
        raise ValueError("Invalid photoDataUri format.") from e

    # Mock prediction
    return CatalogProductOutput(category="jewelry", confidence=0.92)


# Flow equivalent
async def catalog_product(input: CatalogProductInput) -> CatalogProductOutput:
    return await ai_classify_product(input.photoDataUri)


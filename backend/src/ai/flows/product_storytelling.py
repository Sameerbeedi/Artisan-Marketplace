# product_storytelling.py
"""
A flow to generate creative product stories with SEO tags.

- generate_product_story: Handles product storytelling generation.
- ProductStorytellingInput: Input type.
- ProductStorytellingOutput: Output type.
"""

from backend.data_types_class import ProductStorytellingInput, ProductStorytellingOutput

# Mock AI storytelling function (replace with actual AI integration)
async def ai_generate_product_story(
    input: ProductStorytellingInput,
) -> ProductStorytellingOutput:
    story = (
        f"{input.productTitle} is more than just a product — "
        f"{input.productDescription}. Crafted with care, it brings both function and inspiration, "
        f"making it a meaningful choice for every customer."
    )

    # Simple SEO-friendly tags (placeholder logic)
    seo_tags = [
        input.productTitle.lower().replace(" ", ""),
        input.productTitle.lower().replace(" ", "-"),
        "handcrafted",
        "unique",
        "sustainable",
    ]

    return ProductStorytellingOutput(creativeStory=story, seoTags=seo_tags)


# Flow equivalent
async def generate_product_story(
    input: ProductStorytellingInput,
) -> ProductStorytellingOutput:
    return await ai_generate_product_story(input)



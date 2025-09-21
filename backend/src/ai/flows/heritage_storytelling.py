# heritage_storytelling.py
"""
An AI agent for crafting heritage stories for artisans.

- generate_heritage_story: Generates a heritage story.
- HeritageStorytellingInput: Input type for generate_heritage_story.
- HeritageStorytellingOutput: Output type for generate_heritage_story.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from data_types_class import HeritageStorytellingInput, HeritageStorytellingOutput

# Mock AI storytelling function (replace with LLM integration)
async def ai_generate_story(input: HeritageStorytellingInput) -> HeritageStorytellingOutput:
    # In a real implementation, you would send the prompt to an LLM (OpenAI/Gemini/etc.)
    story = (
        f"{input.artisanBackground} has preserved a legacy through generations. "
        f"Rooted in {input.familyTraditions}, their journey through {input.craftHistory} "
        f"brings life to each creation. The {input.productDescription} reflects both tradition "
        f"and artistry, carrying forward a heritage that connects deeply with all who encounter it."
    )

    return HeritageStorytellingOutput(heritageStory=story)


# Flow equivalent
async def generate_heritage_story(input: HeritageStorytellingInput) -> HeritageStorytellingOutput:
    return await ai_generate_story(input)



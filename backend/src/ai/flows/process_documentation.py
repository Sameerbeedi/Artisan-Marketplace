# process_documentation.py
"""
A flow to generate step-by-step craft process descriptions with cultural context.

- generate_process_documentation: Handles process documentation generation.
- GenerateProcessDocumentationInput: Input type.
- GenerateProcessDocumentationOutput: Output type.
"""

from backend.data_types_class import GenerateProcessDocumentationInput, GenerateProcessDocumentationOutput

# Mock AI function (replace with real AI integration)
async def ai_generate_process_doc(
    input: GenerateProcessDocumentationInput,
) -> GenerateProcessDocumentationOutput:
    description = (
        f"Craft Name: {input.craftName}\n\n"
        f"{input.craftDescription}\n\n"
        f"Materials Used: {input.materials}\n\n"
        f"Step-by-Step Process:\n{input.steps}\n\n"
        f"Cultural Context: {input.culturalContext}\n\n"
        f"This documentation highlights both the technical process and the cultural "
        f"significance of {input.craftName}, ensuring the craft is respected and preserved."
    )

    return GenerateProcessDocumentationOutput(processDescription=description)


# Flow equivalent
async def generate_process_documentation(
    input: GenerateProcessDocumentationInput,
) -> GenerateProcessDocumentationOutput:
    return await ai_generate_process_doc(input)

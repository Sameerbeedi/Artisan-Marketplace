# identify_technique.py
"""
A flow for identifying traditional techniques used in crafts.

- identify_technique: Handles the technique identification process.
- IdentifyTechniqueInput: Input type.
- IdentifyTechniqueOutput: Output type.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))))
from data_types_class import IdentifyTechniqueInput, IdentifyTechniqueOutput
import base64

# Mock AI function (replace with real AI/vision integration)
async def ai_identify_technique(
    input: IdentifyTechniqueInput,
) -> IdentifyTechniqueOutput:
    # Validate Data URI
    try:
        header, encoded = input.photoDataUri.split(",", 1)
        _ = base64.b64decode(encoded)  # ensures it's valid base64
    except Exception as e:
        raise ValueError("Invalid photoDataUri format.") from e

    # Mock prediction output
    techniques = ["block printing", "hand weaving"]
    confidence_levels = [0.85, 0.72]

    return IdentifyTechniqueOutput(
        techniques=techniques, confidenceLevels=confidence_levels
    )


# Flow equivalent
async def identify_technique(
    input: IdentifyTechniqueInput,
) -> IdentifyTechniqueOutput:
    return await ai_identify_technique(input)



from dataclasses import dataclass
from typing import Generic, Optional, TypeVar
from ai.flows.automated_product_catalog import catalog_product
from ai.flows.process_documentation import generate_process_documentation
from ai.flows.heritage_storytelling import generate_heritage_story
from ai.flows.quality_assessment import analyze_product_photo
from ai.flows.technique_identification import identify_technique

T = TypeVar("T")

@dataclass
class FormState(Generic[T]):
    data: Optional[T]
    error: Optional[str]


# --- Action wrappers ---

async def catalog_product_action(input_data) -> FormState:
    try:
        result = await catalog_product(input_data)
        return FormState(data=result, error=None)
    except Exception as e:
        error_message = str(e) if isinstance(e, Exception) else "An unexpected error occurred."
        return FormState(data=None, error=error_message)


async def generate_process_action(input_data) -> FormState:
    try:
        result = await generate_process_documentation(input_data)
        return FormState(data=result, error=None)
    except Exception as e:
        error_message = str(e) if isinstance(e, Exception) else "An unexpected error occurred."
        return FormState(data=None, error=error_message)


async def generate_story_action(input_data) -> FormState:
    try:
        result = await generate_heritage_story(input_data)
        return FormState(data=result, error=None)
    except Exception as e:
        error_message = str(e) if isinstance(e, Exception) else "An unexpected error occurred."
        return FormState(data=None, error=error_message)


async def assess_quality_action(input_data) -> FormState:
    try:
        result = await analyze_product_photo(input_data)
        return FormState(data=result, error=None)
    except Exception as e:
        error_message = str(e) if isinstance(e, Exception) else "An unexpected error occurred."
        return FormState(data=None, error=error_message)


async def identify_technique_action(input_data) -> FormState:
    try:
        result = await identify_technique(input_data)
        return FormState(data=result, error=None)
    except Exception as e:
        error_message = str(e) if isinstance(e, Exception) else "An unexpected error occurred."
        return FormState(data=None, error=error_message)

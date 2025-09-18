import re
from typing import Optional, Dict

def extract_price_range(query: str) -> Optional[Dict[str, Optional[int]]]:
    """
    Extract price range from natural language queries like
    "under 6000 rupees", "between 1000 and 5000", "above 2000"
    """
    # Match "under 6000 rupees", "below ₹6000", "less than 6000 INR"
    regex = r"(under|below|less than)\s*(₹|INR|rupees|rs\.?|ruppees)?\s*(\d{1,9})"
    match = re.search(regex, query, re.IGNORECASE)
    if match:
        max_price = int(match.group(3))
        return {"min": 0, "max": max_price}

    # Match "between X and Y"
    between_regex = r"(between)\s*(₹|INR|rupees|rs\.?|ruppees)?\s*(\d{1,9})\s*(and|to)\s*(₹|INR|rupees|rs\.?|ruppees)?\s*(\d{1,9})"
    between_match = re.search(between_regex, query, re.IGNORECASE)
    if between_match:
        min_price = int(between_match.group(3))
        max_price = int(between_match.group(7))
        return {"min": min_price, "max": max_price}

    # Match "above X", "over X", "more than X"
    above_regex = r"(above|over|more than)\s*(₹|INR|rupees|rs\.?|ruppees)?\s*(\d{1,9})"
    above_match = re.search(above_regex, query, re.IGNORECASE)
    if above_match:
        min_price = int(above_match.group(3))
        return {"min": min_price, "max": None}

    return None

from typing import List, Union

def cn(*args: Union[str, None]) -> str:
    """
    Merge class names like clsx + twMerge in JS.
    
    - Ignores None or empty strings
    - Splits multiple classes and removes duplicates
    - Joins them back into a single string
    """
    classes = []
    for arg in args:
        if arg:
            classes.extend(arg.split())

    # Remove duplicates while keeping order
    seen = set()
    merged_classes = []
    for c in classes:
        if c not in seen:
            merged_classes.append(c)
            seen.add(c)

    return " ".join(merged_classes)

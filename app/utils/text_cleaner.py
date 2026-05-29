import re

def clean_text(text: str) -> str:
    """Strip OCR artifacts and normalize text."""
    if not text:
        return ""
        
    # Remove null bytes
    text = text.replace('\x00', '')
    
    # Normalize smart quotes
    text = text.replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u2018', "'").replace('\u2019', "'")
    
    # Common OCR artifacts: l/I -> 1 in numbers, O -> 0 in numbers
    # We use regex to carefully fix these only when surrounded by digits
    text = re.sub(r'(\d)[lI](\d)', r'\1\2', text)
    text = re.sub(r'(\d)O(\d)', r'\1 0\2', text)
    
    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Preserve paragraph structure by ensuring double newlines for breaks
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()

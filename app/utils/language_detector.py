import re

def detect_language(text: str) -> str:
    """
    Heuristic-based detector for Nigerian Pidgin vs English.
    In a real app, this might use a trained model or LangDetect.
    """
    pidgin_keywords = [
        r'\bdis\b', r'\bdem\b', r'\bna\b', r'\bfit\b', r'\bsay\b', 
        r'\bwey\b', r'\bgo\b', r'\buna\b', r'\bwaka\b', r'\bchop\b',
        r'\bdon\b', r'\babi\b'
    ]
    
    pidgin_score = 0
    text_lower = text.lower()
    
    for kw in pidgin_keywords:
        if re.search(kw, text_lower):
            pidgin_score += 1
            
    if pidgin_score > 3:
        return "pidgin"
    return "english"

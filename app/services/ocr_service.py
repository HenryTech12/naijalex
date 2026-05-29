import pytesseract
from PIL import Image
import io

def perform_ocr(image_bytes: bytes) -> str:
    """Perform OCR on image bytes using Tesseract."""
    image = Image.open(io.BytesIO(image_bytes))
    # config='--psm 6' assumes a single uniform block of text
    text = pytesseract.image_to_string(image, lang='eng', config='--psm 6')
    return text

import pytest
import os
from app.services.document_ingestion import ingest_document
from app.utils.text_cleaner import clean_text

def test_text_cleaner():
    dirty = "This 1s a test with smart quotes \u201cquote\u201d and l0 digits."
    clean = clean_text(dirty)
    assert '"quote"' in clean
    assert "1s" in clean # Should only fix l surrounded by digits like 1l1 -> 111
    
    dirty_digits = "Amount: 1l0.0O"
    cleaned_digits = clean_text(dirty_digits)
    # Our cleaner: re.sub(r'(\d)[lI](\d)', r'\1\2', text)
    # 1l0 -> 10
    assert "10.0" in cleaned_digits

@pytest.mark.asyncio
async def test_txt_ingestion():
    # Create test file
    path = "tests/test.txt"
    with open(path, "w") as f:
        f.write("Sample Nigerian Tenancy Agreement Draft")
    
    text, ocr = ingest_document(path, "text/plain")
    assert "Tenancy" in text
    assert ocr is False
    os.remove(path)

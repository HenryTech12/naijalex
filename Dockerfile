FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-eng \
    poppler-utils \
    libpq-dev \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create runtime directories and a non-root user, then set ownership
RUN mkdir -p /app/uploads/risk_cards /app/chroma_db \
    && groupadd -r app && useradd -r -g app -d /home/app -s /sbin/nologin app \
    && chown -R app:app /app

EXPOSE 8000

# Run as non-root user for better security
USER app

# Use PORT env var when available; default to 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

# Dockerfile - Carmen de Areco Transparency Scraper
FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    default-jre \
    wget \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ /app/src/
COPY tests/ /app/tests/
COPY README.md /app/

# Create data directories
RUN mkdir -p /app/data /app/output

# Set Python path
ENV PYTHONPATH=/app

# Default command
CMD ["python", "-m", "src.cli", "--help"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import src.database; print('OK')" || exit 1

# Labels for metadata
LABEL maintainer="Carmen de Areco Transparency Project"
LABEL description="Document scraper and processor for municipal transparency data"
LABEL version="1.0.0"
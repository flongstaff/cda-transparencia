FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy scripts
COPY scripts/ ./scripts/

# Copy data directory
COPY data/ ./data/

# Create directories for output
RUN mkdir -p output

# Set environment variables
ENV PYTHONPATH=/app

# Default command
CMD ["python", "-m", "scripts.process_all"]
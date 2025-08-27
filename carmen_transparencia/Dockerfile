# Dockerfile – Python 3-based
FROM python:3.11-slim

WORKDIR /app

# Copy pip packages and install
ADD requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy our project
ADD src/ /app/

# Default command: run the click CLI
CMD ["python", "-m", "carmen_transparencia.cli"]
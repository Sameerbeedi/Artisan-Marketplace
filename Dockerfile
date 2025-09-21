# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Install system dependencies including Blender
RUN apt-get update && apt-get install -y \
    wget \
    xz-utils \
    libglu1-mesa \
    libxi6 \
    libxrender1 \
    libxrandr2 \
    libxss1 \
    libgconf-2-4 \
    libxcomposite1 \
    libasound2 \
    libatk1.0-0 \
    libgtk-3-0 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Download and install Blender 4.0
WORKDIR /tmp
RUN wget -q https://download.blender.org/release/Blender4.0/blender-4.0.2-linux-x64.tar.xz \
    && tar -xf blender-4.0.2-linux-x64.tar.xz \
    && mv blender-4.0.2-linux-x64 /opt/blender \
    && ln -s /opt/blender/blender /usr/local/bin/blender \
    && rm blender-4.0.2-linux-x64.tar.xz

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application
COPY backend/ ./

# Create necessary directories
RUN mkdir -p ar_models uploads

# Set environment variables
ENV PYTHONPATH=/app
ENV DISPLAY=:99

# Expose port
EXPOSE 8000

# Start command with virtual display for Blender
CMD ["sh", "-c", "Xvfb :99 -screen 0 1024x768x24 & python -m uvicorn main:app --host 0.0.0.0 --port 8000"]
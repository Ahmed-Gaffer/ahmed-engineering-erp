# Stage 1: Build the Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend configuration files
COPY frontend/package*.json ./

# Install dependencies and build
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Backend and Runtime Container
FROM python:3.11-slim AS runner
WORKDIR /app

# Install system dependencies if any are needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy built frontend from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy python dependencies and project configurations
COPY pyproject.toml README.md ./

# Install Python dependencies using pyproject.toml
RUN pip install --no-cache-dir .

# Copy the rest of the application files
COPY main.py ./
COPY core/ ./core/
COPY modules/ ./modules/
COPY backend/ ./backend/

# Ensure uploads directory exists inside the container
RUN mkdir -p /app/uploads

# Expose the application port
EXPOSE 8000

# Set environment variables
ENV PORT=8000
ENV DATABASE_URL=sqlite+aiosqlite:////app/backend/engineering.db

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

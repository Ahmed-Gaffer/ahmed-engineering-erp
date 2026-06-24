# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# Stage 2: Runtime
FROM python:3.11-slim AS runner
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

COPY pyproject.toml README.md ./
RUN pip install --no-cache-dir .

COPY main.py ./
COPY core/ ./core/
COPY modules/ ./modules/
COPY backend/ ./backend/

RUN mkdir -p /app/uploads

RUN groupadd -r app && useradd -r -g app app && chown -R app:app /app
USER app

EXPOSE 8000
ENV PORT=8000
ENV DATABASE_URL=sqlite+aiosqlite:////app/backend/engineering.db

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; exit(0 if urllib.request.urlopen('http://localhost:8000/api/health').status == 200 else 1)"

CMD python /app/backend/seed.py && uvicorn main:app --host 0.0.0.0 --port 8000

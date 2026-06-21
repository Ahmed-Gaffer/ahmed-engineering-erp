import time
from collections import defaultdict
from fastapi import HTTPException, Request, status


class InMemoryRateLimiter:
    def __init__(self):
        self._records: dict[str, list[float]] = defaultdict(list)

    async def __call__(self, request: Request, max_requests: int = 10, window_seconds: int = 60):
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        now = time.time()
        self._records[key] = [t for t in self._records[key] if now - t < window_seconds]
        if len(self._records[key]) >= max_requests:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests")
        self._records[key].append(now)


rate_limiter = InMemoryRateLimiter()


async def auth_rate_limit(request: Request):
    await rate_limiter(request, max_requests=5, window_seconds=60)
from pydantic import BaseModel


class PaginatedResponse(BaseModel):
    items: list[dict]
    total: int
    page: int
    limit: int
    pages: int


class BulkDeleteRequest(BaseModel):
    ids: list[int]

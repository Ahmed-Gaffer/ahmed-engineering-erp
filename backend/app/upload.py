import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.config import settings
from app.dependencies import get_current_user, require_role
from app.core.logging import logger

router = APIRouter(prefix="/api/upload", tags=["upload"])
ALLOWED_EXTENSIONS = {".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".doc", ".docx", ".xls", ".xlsx", ".zip"}


@router.post("/")
async def upload_file(file: UploadFile = File(...), user=Depends(require_role("admin", "engineer"))):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)
    content = await file.read()
    with open(path, "wb") as f:
        f.write(content)
    logger.info("Uploaded file: %s -> %s by user %s", file.filename, path, user.id)
    return {"file_path": f"/uploads/{filename}", "filename": filename}

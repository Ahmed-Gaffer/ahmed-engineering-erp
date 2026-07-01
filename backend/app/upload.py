import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.config import settings
from app.dependencies import get_current_user, require_role
from app.core.logging import logger

router = APIRouter(prefix="/api/upload", tags=["upload"])
ALLOWED_EXTENSIONS = {".pdf", ".dwg", ".dxf", ".png", ".jpg", ".jpeg", ".tif", ".tiff", ".doc", ".docx", ".xls", ".xlsx", ".zip", ".gif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

# Magic byte signatures for content-type validation (MIME validation without external deps)
FILE_HEADER_SIGNATURES = {
    ".pdf": [b"%PDF"],
    ".jpg": [b"\xff\xd8\xff"],
    ".jpeg": [b"\xff\xd8\xff"],
    ".png": [b"\x89PNG\r\n\x1a\n"],
    ".gif": [b"GIF87a", b"GIF89a"],
    ".zip": [b"PK\x03\x04"],
    ".doc": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
    ".xls": [b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"],
    ".docx": [b"PK\x03\x04"],
    ".xlsx": [b"PK\x03\x04"],
}


def matches_header(data: bytes, ext: str) -> bool:
    sigs = FILE_HEADER_SIGNATURES.get(ext)
    if sigs is None:
        return True
    return any(data.startswith(s) for s in sigs)


# Ensure upload directory exists at module load time (not per-request)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)


@router.post("/")
async def upload_file(file: UploadFile = File(...), user=Depends(require_role("admin", "engineer"))):
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type {ext} not allowed")

    first_bytes = await file.read(32)
    if not matches_header(first_bytes, ext):
        raise HTTPException(status_code=400, detail=f"File content signature mismatch for type {ext}")

    filename = f"{uuid.uuid4().hex}{ext}"
    path = os.path.join(settings.UPLOAD_DIR, filename)

    total = len(first_bytes)
    try:
        with open(path, "wb") as f:
            f.write(first_bytes)
            while True:
                chunk = await file.read(64 * 1024)
                if not chunk:
                    break
                total += len(chunk)
                if total > MAX_FILE_SIZE:
                    raise HTTPException(status_code=413, detail=f"File exceeds {MAX_FILE_SIZE // (1024*1024)} MB limit")
                f.write(chunk)
    except Exception:
        if os.path.exists(path):
            os.remove(path)
        raise

    logger.info("Uploaded file: %s -> %s by user %s", file.filename, path, user.id)
    return {"file_path": f"/uploads/{filename}", "filename": filename}

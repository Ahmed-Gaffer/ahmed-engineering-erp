from app.core.crud import GenericCRUD
from app.drawing_revisions.models import DrawingRevision

revision_crud = GenericCRUD(DrawingRevision)

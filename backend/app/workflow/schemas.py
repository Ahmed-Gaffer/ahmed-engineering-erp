from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class WorkflowActionCreate(BaseModel):
    entity_type: str
    entity_id: int
    action: str
    comment: Optional[str] = None
    assigned_to: Optional[str] = None


class WorkflowLogResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    action: str
    from_status: Optional[str] = None
    to_status: Optional[str] = None
    actor_id: Optional[int] = None
    actor_name: Optional[str] = None
    assigned_to: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkflowTimelineResponse(BaseModel):
    entity_type: str
    entity_id: int
    current_status: str
    logs: List[WorkflowLogResponse]

from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    extracted_text: str | None
    ocr_confidence: float | None
    headlines: list[str] | None
    status: str
    uploaded_at: datetime

    model_config = {"from_attributes": True}
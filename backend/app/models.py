# from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy import Column, Integer, String, Text, DateTime, Float, JSON


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    extracted_text = Column(Text, nullable=True)

    ocr_confidence = Column(Float, nullable=True)
    headlines = Column(JSON, nullable=True)
    status = Column(String, default="completed")
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
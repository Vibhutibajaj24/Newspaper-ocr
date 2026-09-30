from sqlalchemy.orm import Session
from app.models import Document


def create_document(
    db: Session,
    filename: str,
    original_filename: str,
    extracted_text: str,
    ocr_confidence: float,
    headlines: list[str]
):
    document = Document(
        filename=filename,
        original_filename=original_filename,
        extracted_text=extracted_text,
        ocr_confidence=ocr_confidence,
        headlines=headlines,
        status="completed"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document


def get_documents(db: Session):
    return (
        db.query(Document)
        .order_by(Document.uploaded_at.desc())
        .all()
    )


def get_document(db: Session, document_id: int):
    return (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )


def delete_document(db: Session, document: Document):
    db.delete(document)
    db.commit()


def search_documents(db: Session, keyword: str):
    return (
        db.query(Document)
        .filter(Document.extracted_text.ilike(f"%{keyword}%"))
        .order_by(Document.uploaded_at.desc())
        .all()
    )
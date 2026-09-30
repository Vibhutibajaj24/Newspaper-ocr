import os
import uuid

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Depends
)

from sqlalchemy.orm import Session

# from app.services.ocr import extract_text_from_image, extract_text_from_pdf
from app.database import get_db
from app import crud
from app.schemas import DocumentResponse
from fastapi.responses import FileResponse
from app.services.ocr import (
    extract_text_from_image,
    extract_text_from_pdf,
    extract_headlines
)

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG, and PDF files are supported"
        )

    filename = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024):
                buffer.write(chunk)

        if extension == ".pdf":
            extracted_text, ocr_confidence = extract_text_from_pdf(file_path)
        else:
            extracted_text, ocr_confidence = extract_text_from_image(file_path)

        headlines = extract_headlines(extracted_text)

        document = crud.create_document(
            db=db,
            filename=filename,
            original_filename=file.filename,
            extracted_text=extracted_text,
            ocr_confidence=ocr_confidence,
            headlines=headlines
        )

        return document

    except Exception as exc:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except PermissionError:
                pass

        print(f"Document processing error: {exc}")

        raise HTTPException(
            status_code=500,
            detail="Document processing failed"
        )

@router.get("/")
def get_documents(db: Session = Depends(get_db)):
    return crud.get_documents(db)


@router.get("/{document_id}/file")
def get_document_file(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = os.path.join(UPLOAD_DIR, document.filename)

    if not os.path.exists(file_path):
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(file_path)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    return document


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
):
    document = crud.get_document(db, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    file_path = os.path.join(UPLOAD_DIR, document.filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    crud.delete_document(db, document)

    return {
        "message": "Document deleted successfully"
    }
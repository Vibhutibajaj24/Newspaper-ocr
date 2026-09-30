from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud
from app.schemas import DocumentResponse

router = APIRouter()


@router.get("/", response_model=list[DocumentResponse])
def search_documents(
    keyword: str,
    db: Session = Depends(get_db)
):
    keyword = keyword.strip()

    if not keyword:
        raise HTTPException(
            status_code=400,
            detail="Search keyword cannot be empty"
        )

    return crud.search_documents(db, keyword)
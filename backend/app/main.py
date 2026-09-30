from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import documents, search
from app.database import Base, engine
from app import models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Newspaper OCR API",
    description="API for uploading and extracting newspaper text",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    documents.router,
    prefix="/api/documents",
    tags=["Documents"]
)
app.include_router(
    search.router,
    prefix="/api/search",
    tags=["Search"]
)


@app.get("/")
def home():
    return {"message": "Newspaper OCR API is running"}
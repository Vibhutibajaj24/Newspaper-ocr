# Newspaper OCR

A full-stack newspaper digitization and OCR application that extracts searchable text from newspaper images and PDF files.

## Features

- Upload newspaper JPG, JPEG, PNG, and PDF files
- OCR-based text extraction using Tesseract
- Image preprocessing using OpenCV
- OCR confidence score
- Automatic headline detection
- Store documents and extracted text in PostgreSQL
- Search extracted newspaper content
- View uploaded newspaper files
- PDF preview inside the application
- Delete documents and associated files
- React-based dashboard

## Tech Stack

### Frontend
- React
- React Router
- Axios
- CSS

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

### OCR & Processing
- Tesseract OCR
- Pytesseract
- OpenCV
- Pillow
- PyMuPDF

## Project Structure
newspaper-ocr/
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   └── services/
│   ├── uploads/
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md


### How It Works:
1. User uploads a newspaper image or PDF.
2. Backend validates and stores the file.
3. OpenCV preprocesses the image to improve OCR quality.
4. Tesseract extracts the text.
5. OCR confidence is calculated.
6. Potential headlines are identified from the extracted text.
7. Document metadata and OCR results are stored in PostgreSQL.
8. Extracted content can be searched from the dashboard.

### Local Setup:
1. Backend
```
cd backend
python -m venv venv
```
Activate the virtual environment:
```
.\venv\Scripts\Activate.ps1
```
Install dependencies:
```
pip install -r requirements.txt
```
Create a .env file:
```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/newspaper_ocr
```
Start the backend:
```
uvicorn app.main:app --reload
```
Backend will run on:

http://localhost:8000

API documentation:

http://localhost:8000/docs


2. Frontend
Open another terminal:
```
cd frontend
npm install
npm run dev
```
Frontend will run on:

http://localhost:5173

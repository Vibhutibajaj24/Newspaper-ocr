import pytesseract
import pymupdf
import cv2
import numpy as np

from PIL import Image
from io import BytesIO


pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def preprocess_image(image):
    """
    Improve image quality before sending it to Tesseract.
    """

    # Convert PIL Image to NumPy array
    image = np.array(image)

    # Convert RGB to grayscale
    gray = cv2.cvtColor(
        image,
        cv2.COLOR_RGB2GRAY
    )

    # Reduce small noise
    denoised = cv2.GaussianBlur(
        gray,
        (3, 3),
        0
    )

    # Convert to black and white
    threshold = cv2.threshold(
        denoised,
        0,
        255,
        cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )[1]

    return threshold


def calculate_ocr_confidence(image):
    """
    Calculate average OCR confidence for the processed image.
    """

    data = pytesseract.image_to_data(
        image,
        lang="eng",
        output_type=pytesseract.Output.DICT
    )

    confidences = []

    for confidence in data["conf"]:
        try:
            confidence = float(confidence)

            if confidence >= 0:
                confidences.append(confidence)

        except ValueError:
            continue

    if not confidences:
        return 0

    return round(
        sum(confidences) / len(confidences),
        2
    )

def extract_headlines(text: str):
    """
    Extract likely newspaper headlines from OCR text
    using simple text-based rules.
    """

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    headlines = []

    for line in lines:

        # Ignore page markers
        if line.startswith("--- Page"):
            continue

        # Ignore very short lines
        if len(line) < 10:
            continue

        # Ignore very long paragraphs
        if len(line) > 120:
            continue

        words = line.split()

        # Headlines are usually not extremely long
        if len(words) > 15:
            continue

        # Calculate uppercase ratio
        uppercase_chars = sum(
            1 for char in line
            if char.isupper()
        )

        alphabetic_chars = sum(
            1 for char in line
            if char.isalpha()
        )

        if alphabetic_chars == 0:
            continue

        uppercase_ratio = (
            uppercase_chars / alphabetic_chars
        )

        # Likely headline
        if uppercase_ratio >= 0.6:
            headlines.append(line)

    return headlines

def extract_text_from_image(file_path: str):

    image = Image.open(file_path).convert("RGB")

    processed_image = preprocess_image(image)

    text = pytesseract.image_to_string(
        processed_image,
        lang="eng"
    )

    confidence = calculate_ocr_confidence(
        processed_image
    )

    return text.strip(), confidence


def extract_text_from_pdf(file_path: str):

    pdf = pymupdf.open(file_path)

    all_text = []
    all_confidences = []

    try:
        for page_number, page in enumerate(pdf, start=1):

            pixmap = page.get_pixmap(
                matrix=pymupdf.Matrix(2, 2)
            )

            image_bytes = pixmap.tobytes("png")

            image = Image.open(
                BytesIO(image_bytes)
            ).convert("RGB")

            processed_image = preprocess_image(image)

            text = pytesseract.image_to_string(
                processed_image,
                lang="eng"
            )

            confidence = calculate_ocr_confidence(
                processed_image
            )

            all_text.append(
                f"\n--- Page {page_number} ---\n"
                f"{text.strip()}"
            )

            all_confidences.append(confidence)

    finally:
        pdf.close()

    average_confidence = (
        round(
            sum(all_confidences) / len(all_confidences),
            2
        )
        if all_confidences
        else 0
    )

    return "\n".join(all_text).strip(), average_confidence
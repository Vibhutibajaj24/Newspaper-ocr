import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const selectFile = (selectedFile) => {
    setError("");
    setDocument(null);

    if (!selectedFile) return;

    const allowedExtensions = [".jpg", ".jpeg", ".png", ".pdf"];
    const extension = selectedFile.name
      .slice(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setFile(null);
      setError("Please select a JPG, PNG, or PDF file.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a newspaper file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setError("");
      setDocument(null);

      const response = await api.post(
        "/documents/upload",
        formData
      );

      setDocument(response.data);
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.detail || "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>NewsOCR</span>
        </div>

        <p className="sidebar-label">MENU</p>

        <Link to="/" className="sidebar-link">
          <span>▦</span> Dashboard
        </Link>

        <Link to="/upload" className="sidebar-link active">
          <span>＋</span> Upload Newspaper
        </Link>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span>📄</span>
            <p>Digitize your newspapers and make them searchable.</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Upload</p>
            <h1>Upload Newspaper</h1>
          </div>

          <Link to="/" className="back-button">
            ← Dashboard
          </Link>
        </header>

        <section className="upload-intro">
          <h2>Turn newspapers into searchable text</h2>
          <p>
            Upload a newspaper image or PDF. Our OCR engine will
            extract the text and save it to your library.
          </p>
        </section>

        <section className="upload-container">
          <form onSubmit={handleUpload}>
            <div
              className={`dropzone ${dragging ? "dragging" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">↑</div>

              <h3>Drag and drop your file here</h3>
              <p>or click to browse files from your computer</p>

              <span className="browse-button">Browse Files</span>

              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                hidden
                onChange={(e) => selectFile(e.target.files[0])}
              />
            </div>

            <div className="file-requirements">
              <span>Supported formats: JPG, JPEG, PNG, PDF</span>
              <span>Choose a file to get started</span>
            </div>

            {file && (
              <div className="selected-file">
                <div className="file-icon">
                  {file.name.toLowerCase().endsWith(".pdf")
                    ? "PDF"
                    : "IMG"}
                </div>

                <div className="selected-file-info">
                  <h4>{file.name}</h4>
                  <p>{formatFileSize(file.size)}</p>
                </div>

                <button
                  type="button"
                  className="remove-file"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  disabled={loading}
                  aria-label="Remove selected file"
                >
                  ×
                </button>
              </div>
            )}

            {error && <p className="upload-error">{error}</p>}

            <button
              type="submit"
              className="upload-submit"
              disabled={loading || !file}
            >
              {loading ? "Processing newspaper..." : "Upload & Extract Text"}
            </button>

            {loading && (
              <p className="processing-note">
                OCR is running. Large PDFs may take a little longer.
              </p>
            )}
          </form>
        </section>

        {document && (
          <section className="extraction-result">
            <div className="result-header">
              <div>
                <span className="success-label">✓ Processing complete</span>
                <h2>Extracted Text</h2>
                <p>{document.original_filename}</p>
              </div>

              <Link
                to={`/documents/${document.id}`}
                className="view-button"
              >
                View Document
              </Link>
            </div>

            <pre>
              {document.extracted_text || "No text could be extracted."}
            </pre>
          </section>
        )}

        <div className="upload-tip">
          <strong>Tip:</strong> For better OCR results, use clear,
          high-resolution newspaper images with minimal blur.
        </div>
      </main>
    </div>
  );
}

export default Upload;
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function DocumentDetails() {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get(`/documents/${id}`)
      .then((response) => {
        setDocument(response.data);
      })
      .catch(() => {
        setError("Document not found.");
      });
  }, [id]);

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(
        document.extracted_text || ""
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Unable to copy text.");
    }
  };

  if (error) {
    return (
      <div className="details-state">
        <p>{error}</p>
        <Link to="/" className="primary-button">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!document) {
    return <div className="details-state">Loading document...</div>;
  }

  const isPdf = document.original_filename
    .toLowerCase()
    .endsWith(".pdf");

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">N</div>
          <span>NewsOCR</span>
        </div>

        <p className="sidebar-label">MENU</p>

        <Link to="/" className="sidebar-link active">
          <span>▦</span> Dashboard
        </Link>

        <Link to="/upload" className="sidebar-link">
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
            <p className="breadcrumb">Workspace / Documents / Details</p>
            <h1>Document Details</h1>
          </div>

          <Link to="/" className="back-button">
            ← Dashboard
          </Link>
        </header>

        <section className="details-heading">
          <div className="details-file-icon">
            {isPdf ? "PDF" : "IMG"}
          </div>

          <div className="details-file-info">
            <h2>{document.original_filename}</h2>
            <p>
              Uploaded on{" "}
              {new Date(document.uploaded_at).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          <div className="details-badges">
            <span className="status-badge">Completed</span>

            {document.ocr_confidence !== null &&
                document.ocr_confidence !== undefined && (
                <span className="confidence-badge">
                    OCR {document.ocr_confidence.toFixed(1)}%
                </span>
                )}
            </div>
        </section>

        <section className="details-grid">
  <div className="preview-panel">
    <div className="panel-heading">
      <h3>Original Document</h3>
    </div>

    <div className="document-preview">
      {isPdf ? (
        <iframe
          src={`http://localhost:8000/api/documents/${document.id}/file`}
          title={document.original_filename}
          className="pdf-preview"
        />
      ) : (
        <img
          src={`http://localhost:8000/api/documents/${document.id}/file`}
          alt={document.original_filename}
          className="newspaper-preview"
        />
      )}
    </div>
  </div>

  <div className="details-right">
    <div className="headlines-panel">
      <div className="panel-heading">
        <div>
          <h3>Detected Headlines</h3>
          <p>Likely headlines identified from OCR text</p>
        </div>

        <span className="headline-count">
          {document.headlines?.length || 0}
        </span>
      </div>

      {document.headlines && document.headlines.length > 0 ? (
        <div className="headline-list">
          {document.headlines.map((headline, index) => (
            <div
              key={index}
              className="headline-item"
            >
              <span className="headline-number">
                {index + 1}
              </span>

              <p>{headline}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-headlines">
          <p>No headlines detected.</p>
        </div>
      )}
    </div>

    <div className="text-panel">
      <div className="panel-heading">
        <div>
          <h3>Extracted Text</h3>
          <p>
            Text recognized by OCR
            {document.ocr_confidence !== null &&
              document.ocr_confidence !== undefined && (
                <>
                  {" "}
                  • Confidence:{" "}
                  {document.ocr_confidence.toFixed(1)}%
                </>
              )}
          </p>
        </div>

        <button
          className="copy-button"
          onClick={copyText}
          disabled={!document.extracted_text}
        >
          {copied ? "Copied!" : "Copy Text"}
        </button>
      </div>

      <div className="ocr-text">
        {document.extracted_text ? (
          <pre>{document.extracted_text}</pre>
        ) : (
          <p className="no-text">
            No text could be extracted from this document.
          </p>
        )}
      </div>
    </div>
  </div>
</section>
      </main>
    </div>
  );
}

export default DocumentDetails;
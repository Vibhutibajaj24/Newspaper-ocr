import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import SearchBar from "../components/SearchBar";

function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/documents");
      setDocuments(response.data);
    } catch (err) {
      setError("Unable to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.delete(`/documents/${id}`);

      setDocuments((current) =>
        current.filter((doc) => doc.id !== id)
      );

      if (searchResults !== null) {
        setSearchResults((current) =>
          current.filter((doc) => doc.id !== id)
        );
      }
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  const displayedDocuments =
    searchResults !== null ? searchResults : documents;

  const pdfCount = documents.filter((doc) =>
    doc.original_filename.toLowerCase().endsWith(".pdf")
  ).length;

  const imageCount = documents.length - pdfCount;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

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
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Dashboard</h1>
          </div>

          <Link to="/upload" className="primary-button">
            + Upload Newspaper
          </Link>
        </header>

        <section className="welcome-section">
          <div>
            <h2>Your Newspaper Library</h2>
            <p>
              Upload, organize, and search text extracted from
              your newspapers.
            </p>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">▤</div>
            <div>
              <p>Total Documents</p>
              <h2>{documents.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">▣</div>
            <div>
              <p>PDF Documents</p>
              <h2>{pdfCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">▧</div>
            <div>
              <p>Image Documents</p>
              <h2>{imageCount}</h2>
            </div>
          </div>
        </section>

        <section className="documents-section">
          <div className="section-heading">
            <div>
              <h2>My Documents</h2>
              <p>Browse and manage your uploaded newspapers.</p>
            </div>
          </div>

          <SearchBar onResults={setSearchResults} />

          {searchResults !== null && (
            <button
              className="clear-search"
              onClick={() => setSearchResults(null)}
            >
              Clear search
            </button>
          )}

          {loading ? (
            <p className="status-message">Loading documents...</p>
          ) : error ? (
            <div className="status-message error">{error}</div>
          ) : displayedDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📂</div>
              <h3>No documents found</h3>
              <p>
                {searchResults !== null
                  ? "Try another search keyword."
                  : "Upload your first newspaper to get started."}
              </p>
              {searchResults === null && (
                <Link to="/upload" className="primary-button">
                  Upload Newspaper
                </Link>
              )}
            </div>
          ) : (
            <div className="document-list">
              {displayedDocuments.map((doc) => (
                <div className="document-row" key={doc.id}>
                  <div className="file-icon">
                    {doc.original_filename.toLowerCase().endsWith(".pdf")
                      ? "PDF"
                      : "IMG"}
                  </div>

                  <div className="document-info">
                    <h3>{doc.original_filename}</h3>
                    <p>
                      Uploaded {formatDate(doc.uploaded_at)}
                    </p>
                  </div>

                  <span className="status-badge">Completed</span>

                  <div className="document-actions">
                    <Link
                      to={`/documents/${doc.id}`}
                      className="view-button"
                    >
                      View
                    </Link>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(doc.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
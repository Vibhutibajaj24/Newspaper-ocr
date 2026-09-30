import { useState } from "react";
import api from "../services/api";

function SearchBar({ onResults }) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();

    const searchTerm = keyword.trim();

    if (!searchTerm) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.get("/search/", {
        params: {
          keyword: searchTerm,
        },
      });

      onResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="search-bar">
      <input
        type="text"
        placeholder="Search newspaper content..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      <button type="submit" disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default SearchBar;
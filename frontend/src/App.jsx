import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import DocumentDetails from "./pages/DocumentDetails";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/upload" element={<Upload />} />
        <Route
          path="/documents/:id"
          element={<DocumentDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
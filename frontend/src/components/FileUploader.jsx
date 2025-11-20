// FileUploader.jsx
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1";

export default function FileUploader({ onProcessed }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [lastError, setLastError] = useState(null);

  const pollingRef = useRef(null);
  const inputRef = useRef(null);

  // POLL STATUS
  useEffect(() => {
    if (!fileId) return;

    if (pollingRef.current) clearInterval(pollingRef.current);

    const poll = async () => {
      try {
        const res = await axios.get(`${API_BASE}/upload/files/${fileId}/status`);
        const s = res.data.status;

        setStatus(s);

        if (["processed", "failed"].includes(s)) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        if (s === "processed") {
          onProcessed(fileId);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    pollingRef.current = setInterval(poll, 3000);

    return () => clearInterval(pollingRef.current);
  }, [fileId]);

  // UPLOAD
  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setStatus("Uploading...");
    setLastError(null);

    const data = new FormData();
    data.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/upload/files/upload`, data);
      setFileId(res.data.file_id);
      setStatus("Processing started...");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
      setLastError(err?.response?.data || err.message);
    }

    setUploading(false);
  }

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2>CSV Upload</h2>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button disabled={!file || uploading} onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {status && (
        <div style={{ marginTop: 15 }}>
          <strong>Status:</strong> {status}
        </div>
      )}

      {lastError && (
        <p style={{ color: "crimson" }}>Error: {JSON.stringify(lastError)}</p>
      )}
    </div>
  );
}

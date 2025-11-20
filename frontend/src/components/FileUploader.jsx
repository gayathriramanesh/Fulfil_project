import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1";

export default function FileUploadAndTable() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [lastError, setLastError] = useState(null);

  const pollingRef = useRef(null);
  const inputRef = useRef(null);

  // Pagination state
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ------------------------------
  // POLLING FOR FILE STATUS
  // ------------------------------
  useEffect(() => {
    if (!fileId) return;

    if (pollingRef.current) clearInterval(pollingRef.current);

    const pollStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/upload/files/${fileId}/status`);
        const s = res.data.status;
        setStatus(s);

        if (["completed", "failed"].includes(s)) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }

        if (s === "processed") {
          // Reload the table after successful ingestion
          fetchProducts(1);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fileId]);

  // ------------------------------
  // HANDLE FILE UPLOAD
  // ------------------------------
  async function handleUpload() {
    if (!file) return;

    setUploading(true);
    setStatus("Uploading...");
    setLastError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/upload/files/upload`, formData);
      const { file_id } = res.data;

      setFileId(file_id);
      setStatus("File uploaded. Processing started...");
      setFile(null);

      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
      setLastError(err?.response?.data || err.message);
    }

    setUploading(false);
  }

  // ------------------------------
  // HANDLE RETRY
  // ------------------------------
  async function handleRetry() {
    if (!fileId) return;

    setStatus("Retrying...");
    await axios.post(`${API_BASE}/upload/files/${fileId}/retry`);
    setStatus("Reprocessing...");
  }

  // ------------------------------
  // PAGINATION: FETCH PRODUCTS
  // ------------------------------
  async function fetchProducts(p) {
    setLoadingProducts(true);

    try {
      const res = await axios.get(`${API_BASE}/upload/products`, {
        params: { page: p, limit: 50 },
      });

      setProducts(res.data.items);
      setPage(res.data.page);
      setPages(res.data.pages);
    } catch (err) {
      console.error("Fetch products error:", err);
    }

    setLoadingProducts(false);
  }

  // Fetch products on first render
  useEffect(() => {
    fetchProducts(1);
  }, []);

  const isCompleted = status === "processed";
  const isFailed = status === "failed";

  return (
    <div style={styles.container}>

      {/* ------------------ FILE UPLOAD SECTION ------------------ */}
      <h2>CSV Product Upload</h2>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.input}
      />

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        style={styles.button}
      >
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>

      {status && (
        <div
          style={{
            ...styles.statusBox,
            background: isCompleted ? "#d6ffe0" : isFailed ? "#ffe0e0" : "#eee",
            border: isCompleted
              ? "1px solid #2ecc71"
              : isFailed
              ? "1px solid crimson"
              : "1px solid #ccc",
          }}
        >
          <strong>Status:</strong>{" "}
          {isCompleted ? "Upload successful — yay 🎉" : status}
        </div>
      )}

      {isFailed && (
        <button onClick={handleRetry} style={styles.retryButton}>
          Retry
        </button>
      )}

      {lastError && (
        <p style={{ color: "crimson", marginTop: 8 }}>
          Error: {JSON.stringify(lastError)}
        </p>
      )}

      <hr style={{ margin: "30px 0" }} />

      {/* ------------------ PRODUCT TABLE SECTION ------------------ */}
      <h2>Uploaded Products</h2>

      {loadingProducts ? (
        <p>Loading...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Category</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.quantity}</td>
                <td>{p.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          disabled={page === 1}
          onClick={() => {
            fetchProducts(page - 1);
          }}
          style={styles.pageBtn}
        >
          Prev
        </button>

        <span>
          Page {page} / {pages}
        </span>

        <button
          disabled={page === pages}
          onClick={() => {
            fetchProducts(page + 1);
          }}
          style={styles.pageBtn}
        >
          Next
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "900px",
    margin: "50px auto",
    fontFamily: "Arial, sans-serif",
    paddingBottom: "80px",
  },
  input: { marginBottom: "15px" },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
    background: "#4e6cff",
    border: "none",
    color: "white",
    borderRadius: "6px",
    fontSize: "16px",
  },
  statusBox: {
    marginTop: "20px",
    padding: "10px",
    borderRadius: "6px",
  },
  retryButton: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "6px",
    background: "crimson",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px",
  },
  pagination: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageBtn: {
    padding: "8px 16px",
    background: "#4e6cff",
    border: "none",
    borderRadius: "4px",
    color: "white",
    cursor: "pointer",
  },
};

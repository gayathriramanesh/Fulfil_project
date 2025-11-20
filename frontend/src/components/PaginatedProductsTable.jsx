// PaginatedProductsTable.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000/api/v1";

export default function PaginatedProductsTable({ fileId }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const LIMIT = 50;

  // Fetch page when fileId or page changes
  useEffect(() => {
    if (!fileId) return;

    const fetchProducts = async () => {
      setLoading(true);

      try {
        const res = await axios.get(`${API_BASE}/upload/products`, {
          params: { file_id: fileId, page, limit: LIMIT },
        });

        setProducts(res.data.items);
        setPages(res.data.pages);
      } catch (err) {
        console.error("Pagination error:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [fileId, page]);

  // Reset page when fileId changes
  useEffect(() => {
    setPage(1);
  }, [fileId]);

  if (!fileId) return null;

  return (
    <div>
      <h2>Processed Products</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table border="1" cellPadding="8" width="100%">
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

          <div style={{ marginTop: "15px" }}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>

            <span style={{ margin: "0 10px" }}>
              Page {page} of {pages}
            </span>

            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

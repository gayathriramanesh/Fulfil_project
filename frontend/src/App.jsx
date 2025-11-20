import FileUploader from "./components/FileUploader";
import PaginatedProductsTable from "./components/PaginatedProductsTable";
import { useState } from "react";

export default function App() {
  const [activeFileId, setActiveFileId] = useState(null);

  return (
    <div style={{ width: "900px", margin: "50px auto" }}>
      <FileUploader onProcessed={(id) => setActiveFileId(id)} />

      <hr style={{ margin: "40px 0" }} />

      <PaginatedProductsTable fileId={activeFileId} />
    </div>
  );
}
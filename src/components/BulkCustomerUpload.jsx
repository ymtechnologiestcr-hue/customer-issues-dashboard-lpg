import { useState } from "react";
import { uploadBulkCustomers } from "../services/complaintsApi";
import "./BulkCustomerUpload.css"; // We will create this

export default function BulkCustomerUpload({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [globalError, setGlobalError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResponse(null);
      setGlobalError("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setResponse(null);
    setGlobalError("");

    try {
      const result = await uploadBulkCustomers(file);
      setResponse(result);
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Bulk upload failed:", error);
      setGlobalError(
        error.response?.data?.message || "Failed to connect to the server or upload file."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-upload-container">
      <h3 className="bulk-upload-title">Bulk Upload Customers</h3>
      <div className="bulk-upload-form">
        <input
          type="file"
          accept=".xlsx, .xls, .csv"
          onChange={handleFileChange}
          disabled={loading}
          className="bulk-upload-input"
        />
        <button
          type="button"
          className="primary-btn bulk-upload-btn"
          onClick={handleUpload}
          disabled={!file || loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {globalError && (
        <div className="bulk-upload-alert bulk-upload-error">
          <p>{globalError}</p>
        </div>
      )}

      {response && (
        <div className="bulk-upload-results">
          <div className="bulk-upload-alert bulk-upload-success">
            <p>
              <strong>{response.message || "Upload completed"}</strong>
            </p>
            <p>Success: {response.successCount || 0}</p>
            <p>Failed: {response.failCount || 0}</p>
          </div>

          {response.failCount > 0 && response.errors && response.errors.length > 0 && (
            <div className="bulk-upload-alert bulk-upload-warning">
              <h4>Row Errors:</h4>
              <ul className="bulk-upload-error-list">
                {response.errors.map((err, index) => (
                  <li key={index}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

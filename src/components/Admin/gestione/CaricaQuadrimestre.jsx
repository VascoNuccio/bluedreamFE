import React, { useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const CaricaQuadrimestre = () => {
  const { downloadQuadrimestre, uploadQuadrimestre } = useAuth();
  const fileInputRef = useRef(null);

  const handleUploadClick = () => fileInputRef.current.click();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) uploadQuadrimestre(file);
  };

  return (
    <div className="flex gap-4">
      <button onClick={downloadQuadrimestre} className="px-4 py-2 bg-blue-500 text-white rounded">
        Download Excel
      </button>

      <button onClick={handleUploadClick} className="px-4 py-2 bg-green-500 text-white rounded">
        Upload Excel
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
      />
    </div>
  );
};

export default CaricaQuadrimestre;

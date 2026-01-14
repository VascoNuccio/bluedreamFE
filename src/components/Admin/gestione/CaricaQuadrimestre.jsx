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
    <section style={{ display: "flex", justifyContent: "center", alignContent: "center", gap: "5rem", padding: "5rem" }}>
      
      <button onClick={downloadQuadrimestre} className="button_light">
        Download Excel
      </button>

      <button onClick={handleUploadClick} className="button_light">
        Upload Excel
      </button>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx, .xls"
        style={{ display: "none" }}
      />
    </section>
  );
};

export default CaricaQuadrimestre;

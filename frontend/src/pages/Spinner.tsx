import React from "react";
import "./Spinner.css";

const Spinner: React.FC = () => {
  return (
    <div className="loader-overlay">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
};

export default Spinner;

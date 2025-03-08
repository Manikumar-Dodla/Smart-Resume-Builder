import React from "react";
import './Loading.css';

function Loading({ text = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">{text}</p>
    </div>
  );
}

export default Loading;
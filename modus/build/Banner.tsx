import React from 'react';
import "./Banner.css";

const Banner: React.FC = () => {
  const modusLogoUri = document.getElementById('root')?.getAttribute('moduslogo') || ''; 
  return (
    <div className="banner">
      <div className="logo">
      <i className="modus-logo" style={{ backgroundImage: `url(${modusLogoUri})` }} aria-label="Modus Coder Logo"></i>
      </div>
      <h1>Modus Coder</h1>
      <p>A Trimble Assistant powered Gen-AI tool for creating UI code generation</p>
      <ul className="instructions">
        <li>📎 for using Image to Code Agent ( Form Components Only )</li>
        <li>Use the DropDown to select your Model</li>
      </ul>
    </div>
  );
};

export default Banner;
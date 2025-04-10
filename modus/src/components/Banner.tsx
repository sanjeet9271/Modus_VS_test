import React from 'react';
import "./Banner.css"

const Banner: React.FC = () => {
  const modusLogoUri = document.getElementById('root')?.getAttribute('moduslogo') || "https://modus-coder.trimble.cloud/assets/Images/modus-coder-logo.png";
  return (
    <div className="banner">
        <div className="logo">
        <img className='modus-logo' src={modusLogoUri} alt="Modus Coder Logo" />
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
import React from 'react';
import "./Banner.css"

const Banner: React.FC = () => {
  return (
    <div className="banner">
        <div className="logo">
        <img src="https://modus-coder.trimble.cloud/assets/Images/modus-coder-logo.png" alt="Modus Coder Logo" />
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
// Compare this snippet from modus/src/components/Banner.tsx:
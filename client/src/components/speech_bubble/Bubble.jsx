import React from 'react';
import './Bubble.css';

const Bubble = ({ children, position = 'left' }) => {
  return (
    <div className={`bubble-container bubble-${position}`}>
      <div className="bubble">
        {children}
      </div>
    </div>
  );
};

export default Bubble;

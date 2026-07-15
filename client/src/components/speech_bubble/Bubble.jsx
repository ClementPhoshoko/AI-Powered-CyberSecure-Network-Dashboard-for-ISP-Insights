import React from 'react';
import { motion } from 'framer-motion';
import './Bubble.css';

const Bubble = ({ children, position = 'left' }) => {
  return (
    <motion.div
      className={`bubble-container bubble-${position}`}
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="bubble">
        {children}
      </div>
    </motion.div>
  );
};

export default Bubble;

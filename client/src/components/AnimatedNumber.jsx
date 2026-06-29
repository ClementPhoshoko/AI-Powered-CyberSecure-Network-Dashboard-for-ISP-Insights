import { useState, useEffect, useRef } from 'react';

const AnimatedNumber = ({ value, suffix = '', prefix = '', duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startValue = useRef(0);
  const startTime = useRef(null);
  const animationFrame = useRef(null);

  useEffect(() => {
    // If value is 2026, just show it immediately - no animation needed
    if (value === 2026) {
      setDisplayValue(value);
      return;
    }

    startValue.current = displayValue;
    startTime.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function - ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = startValue.current + (value - startValue.current) * easeOut;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  const formatValue = (val) => {
    // Special case for 2026 - show the exact year
    if (value === 2026) {
      return '2026';
    }
    if (Number.isInteger(value)) {
      return Math.round(val).toLocaleString();
    }
    return val.toFixed(1);
  };

  return (
    <span>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
};

export default AnimatedNumber;

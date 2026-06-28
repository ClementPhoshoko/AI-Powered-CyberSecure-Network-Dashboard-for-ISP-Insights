import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './SpeedMeter.css';

const DEFAULT_SCALE_STOPS = [0, 5, 10, 50, 100, 250, 500, 750, 1000];
const MIN_ANGLE = -135;
const MAX_ANGLE = 135;
const VIEWBOX_WIDTH = 420;
const VIEWBOX_HEIGHT = 300;
const CENTER_X = 210;
const CENTER_Y = 190;
const OUTER_RADIUS = 150;
const ARC_SWEEP = MAX_ANGLE - MIN_ANGLE;
const ARC_LENGTH = OUTER_RADIUS * ((ARC_SWEEP * Math.PI) / 180);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildArcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

function buildScaleStops(min, max) {
  const values = [min, ...DEFAULT_SCALE_STOPS, max]
    .filter((item) => item >= min && item <= max)
    .sort((left, right) => left - right);

  return values.filter((item, index) => item !== values[index - 1]);
}

function valueToSegmentProgress(value, scaleStops) {
  if (scaleStops.length <= 1) {
    return 0;
  }

  const clamped = clamp(value, scaleStops[0], scaleStops[scaleStops.length - 1]);
  const segmentCount = scaleStops.length - 1;

  if (clamped <= scaleStops[0]) {
    return 0;
  }

  if (clamped >= scaleStops[scaleStops.length - 1]) {
    return 1;
  }

  for (let index = 0; index < segmentCount; index += 1) {
    const current = scaleStops[index];
    const next = scaleStops[index + 1];

    if (clamped <= next) {
      const span = next - current || 1;
      const localProgress = (clamped - current) / span;
      return (index + localProgress) / segmentCount;
    }
  }

  return 1;
}

function progressToAngle(progress) {
  return MIN_ANGLE + progress * ARC_SWEEP;
}

const SpeedMeter = ({
  value,
  min = 0,
  max = 1000,
  unit = 'Mbps',
  type = 'download',
  animated = true,
  showNeedle = true,
  showLabels = true
}) => {
  const numericValue = Number.isFinite(value) ? value : min;
  const clampedValue = clamp(numericValue, min, max);
  const [animatedValue, setAnimatedValue] = useState(clampedValue);
  const animatedValueRef = useRef(clampedValue);
  const [isConnecting, setIsConnecting] = useState(true);
  const previousTypeRef = useRef(type);

  const scaleStops = useMemo(() => buildScaleStops(min, max), [min, max]);
  const arcPath = useMemo(
    () => buildArcPath(CENTER_X, CENTER_Y, OUTER_RADIUS, MIN_ANGLE, MAX_ANGLE),
    []
  );

  useEffect(() => {
    if (previousTypeRef.current !== type) {
      // Reset to 0 when type changes (download ↔ upload)
      previousTypeRef.current = type;
      animatedValueRef.current = 0;
      setAnimatedValue(0);
    }
  }, [type]);

  useEffect(() => {
    if (!animated) {
      animatedValueRef.current = clampedValue;
      setAnimatedValue(clampedValue);
      return;
    }

    const fromValue = animatedValueRef.current;
    const delta = clampedValue - fromValue;
    const startTime = performance.now();
    const duration = 220;
    let frameId = 0;

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const nextValue = fromValue + delta * easeOutCubic(progress);

      animatedValueRef.current = nextValue;
      setAnimatedValue(nextValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [animated, clampedValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const animatedProgress = useMemo(
    () => valueToSegmentProgress(animatedValue, scaleStops),
    [animatedValue, scaleStops]
  );
  const needleAngle = useMemo(
    () => progressToAngle(animatedProgress),
    [animatedProgress]
  );
  const progressOffset = ARC_LENGTH * (1 - animatedProgress);

  const scaleMarks = useMemo(() => {
    const segmentCount = Math.max(scaleStops.length - 1, 1);

    return scaleStops.map((scaleValue, index) => {
      const progress = index / segmentCount;
      const angle = progressToAngle(progress);
      const tickStart = polarToCartesian(CENTER_X, CENTER_Y, OUTER_RADIUS + 10, angle);
      const tickEnd = polarToCartesian(CENTER_X, CENTER_Y, OUTER_RADIUS + 24, angle);
      const labelPoint = polarToCartesian(CENTER_X, CENTER_Y, OUTER_RADIUS + 46, angle);

      return {
        key: `${scaleValue}-${index}`,
        value: scaleValue,
        tickStart,
        tickEnd,
        labelPoint,
      };
    });
  }, [scaleStops]);

  return (
    <motion.div
      className={`speed-meter-container speed-meter-${type === 'upload' ? 'upload' : 'download'}`}
      role="img"
      aria-label={`Current speed ${animatedValue.toFixed(2)} ${unit}`}
      tabIndex={0}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <svg
        width={VIEWBOX_WIDTH}
        height={VIEWBOX_HEIGHT}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className="speed-meter-svg"
      >
        <defs>
          <linearGradient id="speedMeterNeedleGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="var(--text-inverse)" />
            <stop offset="100%" stopColor="var(--speed-meter-tone-dark)" />
          </linearGradient>
          <filter id="speedMeterGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d={arcPath}
          fill="none"
          stroke="var(--glass-bg)"
          strokeWidth="26"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke="var(--speed-meter-tone)"
          strokeWidth="26"
          strokeLinecap="round"
          strokeDasharray={ARC_LENGTH}
          strokeDashoffset={progressOffset}
        />
        {showLabels &&
          scaleMarks.map((mark) => (
            <g key={mark.key}>
              <line
                x1={mark.tickStart.x}
                y1={mark.tickStart.y}
                x2={mark.tickEnd.x}
                y2={mark.tickEnd.y}
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <text
                x={mark.labelPoint.x}
                y={mark.labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="speed-meter-label"
              >
                {mark.value}
              </text>
            </g>
          ))}
        {showNeedle && (
          <g transform={`rotate(${needleAngle} ${CENTER_X} ${CENTER_Y})`}>
            <path
              d={`
                M ${CENTER_X - 4} ${CENTER_Y}
                L ${CENTER_X} ${CENTER_Y - 112}
                L ${CENTER_X + 4} ${CENTER_Y}
                Z
              `}
              fill="url(#speedMeterNeedleGradient)"
              filter="url(#speedMeterGlow)"
              className="speed-meter-needle"
            />
            <circle
              cx={CENTER_X}
              cy={CENTER_Y - 112}
              r="5"
              fill="var(--text-inverse)"
              className="speed-meter-needle-cap"
            />
          </g>
        )}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="19"
          fill="var(--glass-bg-strong)"
          stroke="var(--glass-border-strong)"
          strokeWidth="2"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r="10"
          fill="var(--speed-meter-tone)"
          filter="url(#speedMeterGlow)"
        />
      </svg>
      <div className="speed-meter-center">
        <div className="speed-meter-value">{animatedValue.toFixed(2)}</div>
        <div className="speed-meter-unit">
          {isConnecting ? (
            <span className="connecting-text">Connecting</span>
          ) : (
            <span className="unit-container">
              {type === 'download' ? (
                <svg className="speed-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="speed-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 5L17 10" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 5V15" stroke="var(--speed-meter-tone)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              Mbps
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SpeedMeter;

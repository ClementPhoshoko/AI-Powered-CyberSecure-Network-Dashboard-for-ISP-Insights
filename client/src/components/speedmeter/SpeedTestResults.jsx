import React from 'react';
import { motion } from 'framer-motion';
import StatsCards from './StatsCards';
import TimeSeriesGraphs from './TimeSeriesGraphs';
import './SpeedTestResults.css';

const SpeedTestResults = ({ testResult }) => {
  return (
    <motion.div
      className="speed-test-results"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="results-header">
        <h2>Your Test Results</h2>
        <p className="results-subtitle">Network performance analysis</p>
      </div>

      <StatsCards testResult={testResult} />

      <TimeSeriesGraphs testResult={testResult} />
    </motion.div>
  );
};

export default SpeedTestResults;

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import './TimeSeriesGraphs.css';

const TimeSeriesGraphs = ({ testResult }) => {
  const downloadData = (testResult?.download_measurements || []).map((m, i) => ({
    name: `Test ${i + 1} (${m.file_size_mb}MB)`,
    speed: m.download_speed_mbps
  }));

  const uploadData = (testResult?.upload_measurements || []).map((m, i) => ({
    name: `Test ${i + 1} (${m.file_size_mb}MB)`,
    speed: m.upload_speed_mbps
  }));

  const pingData = (testResult?.ping_measurements || []).map((m) => ({
    name: `Ping ${m.sequence_number}`,
    latency: m.latency_ms
  }));

  const renderChart = (data, title, color, yLabel, ChartComponent = AreaChart) => {
    if (!data || data.length === 0) return null;

    return (
      <motion.div
        className="graph-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3 className="graph-title">{title}</h3>
        <ResponsiveContainer width="100%" height={200}>
          <ChartComponent data={data}>
            <defs>
              <linearGradient id={`color${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
            <XAxis
              dataKey="name"
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--text-muted)"
              tick={{ fontSize: 12 }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', style: { fill: 'var(--text-muted)' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)'
              }}
            />
            {ChartComponent === AreaChart ? (
              <Area
                type="monotone"
                dataKey="speed"
                stroke={color}
                fillOpacity={1}
                fill={`url(#color${title})`}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="latency"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </motion.div>
    );
  };

  return (
    <div className="graphs-container">
      {renderChart(downloadData, 'Download Speed Over Time', 'var(--download)', 'Mbps')}
      {renderChart(uploadData, 'Upload Speed Over Time', 'var(--upload)', 'Mbps')}
      {renderChart(pingData, 'Ping Latency', 'var(--ping)', 'ms', LineChart)}
    </div>
  );
};

export default TimeSeriesGraphs;

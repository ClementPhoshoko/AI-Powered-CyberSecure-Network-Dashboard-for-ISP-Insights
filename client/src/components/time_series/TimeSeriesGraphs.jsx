import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import './TimeSeriesGraphs.css';

const TimeSeriesGraphs = ({ testResult, chartColors = {} }) => {
  const defaultColors = {
    download: { stroke: 'var(--download)', fill: '#3B82F6' },
    upload: { stroke: 'var(--upload)', fill: '#8B5CF6' },
    ping: { stroke: 'var(--ping)', fill: '#22C55E' }
  };
  const colors = { ...defaultColors, ...chartColors };
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

  const renderChart = (data, title, { stroke, fill }, yLabel, ChartComponent = AreaChart) => {
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
                stroke={stroke}
                fillOpacity={0.3}
                fill={fill}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="latency"
                stroke={stroke}
                strokeWidth={2}
                dot={{ fill: stroke, r: 4 }}
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
      {renderChart(downloadData, 'Download Speed Over Time', colors.download, 'Mbps')}
      {renderChart(uploadData, 'Upload Speed Over Time', colors.upload, 'Mbps')}
      {renderChart(pingData, 'Ping Latency', colors.ping, 'ms', LineChart)}
    </div>
  );
};

export default TimeSeriesGraphs;

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import './TimeSeriesGraphs.css';

const MOBILE_QUERY = '(max-width: 640px)';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const handleChange = (event) => setIsMobile(event.matches);

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
};

const TimeSeriesChartTooltip = ({ active, payload, label, type }) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  
  let icon = null;
  let labelText = '';
  let unit = '';
  let color = '';

  if (type === 'download') {
    icon = (
      <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--download)', strokeWidth: 2 }} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    );
    labelText = 'Download';
    unit = 'Mbps';
    color = 'var(--download)';
  } else if (type === 'upload') {
    icon = (
      <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--upload)', strokeWidth: 2 }} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    );
    labelText = 'Upload';
    unit = 'Mbps';
    color = 'var(--upload)';
  } else if (type === 'ping') {
    icon = (
      <svg className="tooltip-icon" style={{ width: 14, height: 14, fill: 'none', stroke: 'var(--ping)', strokeWidth: 2 }} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    labelText = 'Ping';
    unit = 'ms';
    color = 'var(--ping)';
  }

  return (
    <div className="time-series-tooltip">
      <div className="time-series-tooltip-label">{label}</div>
      <div className="time-series-tooltip-row">
        <div className="time-series-tooltip-series">
          {icon}
          <span className="time-series-tooltip-name">{labelText}</span>
        </div>
        <span className="time-series-tooltip-value" style={{ color }}>
          {Number(value).toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
};

const TimeSeriesGraphs = ({ testResult, chartColors = {} }) => {
  const isMobile = useIsMobile();
  const measurementContext = testResult?.measurement_context || {};
  const latencyChartTitle = measurementContext.latency_label || 'HTTP probe latency';
  const defaultColors = {
    download: { stroke: 'var(--download)', fill: '#3B82F6' },
    upload: { stroke: 'var(--upload)', fill: '#8B5CF6' },
    ping: { stroke: 'var(--ping)', fill: '#22C55E' }
  };
  const colors = { ...defaultColors, ...chartColors };
  const downloadData = (testResult?.download_measurements || []).map((m, i) => ({
    name: isMobile ? `T${i + 1}` : `Test ${i + 1} (${m.file_size_mb}MB)`,
    speed: m.download_speed_mbps
  }));

  const uploadData = (testResult?.upload_measurements || []).map((m, i) => ({
    name: isMobile ? `T${i + 1}` : `Test ${i + 1} (${m.file_size_mb ?? m.size_mb}MB)`,
    speed: m.upload_speed_mbps
  }));

  const pingData = (testResult?.ping_measurements || []).map((m) => ({
    name: isMobile ? `P${Number(m.sequence_number) + 1}` : `Probe ${Number(m.sequence_number) + 1}`,
    latency: m.latency_ms
  }));

  const renderChart = (data, title, { stroke, fill }, yLabel, ChartComponent = AreaChart) => {
    if (!data || data.length === 0) return null;

    let type = 'download';
    if (title.toLowerCase().includes('upload')) {
      type = 'upload';
    } else if (title.toLowerCase().includes('ping') || title.toLowerCase().includes('latency') || yLabel === 'ms') {
      type = 'ping';
    }

    return (
      <motion.div
        className="graph-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <h3 className="graph-title">{title}</h3>
        <div className="graph-chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
              <XAxis
                dataKey="name"
                stroke="var(--text-muted)"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                angle={isMobile ? -35 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 52 : 30}
                interval={isMobile ? 'preserveStartEnd' : 0}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 34 : 48}
                label={
                  isMobile
                    ? undefined
                    : {
                        value: yLabel,
                        angle: -90,
                        position: 'insideLeft',
                        style: { fill: 'var(--text-muted)', fontSize: 11 }
                      }
                }
              />
              <Tooltip content={<TimeSeriesChartTooltip type={type} />} />
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
                  dot={{ fill: stroke, r: isMobile ? 3 : 4 }}
                  activeDot={{ r: isMobile ? 5 : 6 }}
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="graphs-container">
      {renderChart(downloadData, 'Download Speed Over Time', colors.download, 'Mbps')}
      {renderChart(uploadData, 'Upload Speed Over Time', colors.upload, 'Mbps')}
      {renderChart(pingData, latencyChartTitle, colors.ping, 'ms', LineChart)}
    </div>
  );
};

export default TimeSeriesGraphs;

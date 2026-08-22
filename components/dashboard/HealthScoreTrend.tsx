'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface HealthScoreTrendProps {
  trendHistory: { date: string; score: number }[];
}

export default function HealthScoreTrend({ trendHistory }: HealthScoreTrendProps) {
  if (!trendHistory || trendHistory.length === 0) return null;

  const firstScore = trendHistory[0].score;
  const lastScore = trendHistory[trendHistory.length - 1].score;
  const delta = lastScore - firstScore;
  const isPositive = delta >= 0;

  // Chart coordinates
  const height = 140;
  const width = 420;
  const padding = 25;

  const minScore = Math.min(...trendHistory.map(d => d.score), 40);
  const maxScore = Math.max(...trendHistory.map(d => d.score), 100);

  const getX = (index: number) => padding + (index / (trendHistory.length - 1)) * (width - 2 * padding);
  const getY = (score: number) => height - padding - ((score - minScore) / (maxScore - minScore)) * (height - 2 * padding);

  const points = trendHistory.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');
  const areaPoints = `${getX(0)},${height - padding} ${points} ${getX(trendHistory.length - 1)},${height - padding}`;

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan)'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Health Score Longitudinal Trend</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>90-Day progression analysis</p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          background: isPositive ? 'var(--normal-bg)' : 'var(--warning-bg)',
          color: isPositive ? 'var(--normal)' : 'var(--warning)',
          fontSize: '0.8rem',
          fontWeight: 700
        }}>
          {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{delta > 0 ? `+${delta}` : delta} pts (90 Days)</span>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255, 255, 255, 0.08)" />

          {/* Gradient Area */}
          <polygon points={areaPoints} fill="url(#scoreAreaGrad)" />

          {/* Trend Line */}
          <polyline
            fill="none"
            stroke="#06b6d4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Interactive Data Points */}
          {trendHistory.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.score);
            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#0b0f19"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  style={{ filter: 'drop-shadow(0 0 4px #06b6d4)' }}
                />
                <text
                  x={cx}
                  y={cy - 10}
                  textAnchor="middle"
                  fill="var(--text-main)"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {d.score}
                </text>
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  fill="var(--text-dim)"
                  fontSize="9.5"
                  fontFamily="var(--font-sans)"
                >
                  {d.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

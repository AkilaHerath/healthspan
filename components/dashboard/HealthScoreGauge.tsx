'use client';

import React from 'react';
import { HealthScoreBreakdown } from '@/lib/types';
import { Activity, Sparkles, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

interface HealthScoreGaugeProps {
  scoreData: HealthScoreBreakdown;
  onExploreInsights: () => void;
}

export default function HealthScoreGauge({ scoreData, onExploreInsights }: HealthScoreGaugeProps) {
  const { overallScore, scoreGrade, contributions } = scoreData;

  // Circumference for circular gauge
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 85) return '#10b981'; // Emerald
    if (score >= 70) return '#06b6d4'; // Cyan
    if (score >= 55) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(overallScore);

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--emerald)'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Overall Health Score</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Multi-factor physiological index</p>
          </div>
        </div>
        <span className={`badge ${overallScore >= 80 ? 'badge-normal' : overallScore >= 60 ? 'badge-warning' : 'badge-critical'}`}>
          {scoreGrade}
        </span>
      </div>

      {/* Gauge and Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: '24px', alignItems: 'center' }}>
        {/* SVG Circular Ring */}
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
            {/* Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="12"
            />
            {/* Progress */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={scoreColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.5s ease',
                filter: `drop-shadow(0 0 8px ${scoreColor}60)`
              }}
            />
          </svg>

          {/* Centered Score Display */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}>
            <span className="mono-num" style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
              {overallScore}
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '2px' }}>
              out of 100
            </span>
          </div>
        </div>

        {/* Contributing Factors & Animated Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {contributions.map((c, idx) => {
            const barColor = c.score >= 80 ? 'var(--emerald)' : c.score >= 60 ? 'var(--amber)' : 'var(--critical)';
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {c.category} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({c.weight}% weight)</span>
                  </span>
                  <span className="mono-num" style={{ fontWeight: 700, color: barColor }}>
                    {c.score}/100
                  </span>
                </div>
                
                {/* Progress bar container */}
                <div style={{
                  width: '100%',
                  height: '7px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${c.score}%`,
                    height: '100%',
                    background: barColor,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 1s ease-out',
                    boxShadow: `0 0 8px ${barColor}80`
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                  {c.details}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Updated automatically based on time-series inputs
        </span>
        <button
          onClick={onExploreInsights}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', gap: '6px' }}
        >
          <Sparkles size={13} style={{ color: 'var(--cyan)' }} />
          Inspect Risk Projections
        </button>
      </div>
    </div>
  );
}

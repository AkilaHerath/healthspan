'use client';

import React, { useState } from 'react';
import { LabResultRecord } from '@/lib/types';
import { ShieldCheck, AlertCircle, Sparkles, TrendingUp, Info } from 'lucide-react';

interface LabTimeSeriesChartProps {
  labResults: LabResultRecord[];
  selectedBiomarker: string;
  onSelectBiomarker: (testName: string) => void;
}

export default function LabTimeSeriesChart({
  labResults,
  selectedBiomarker,
  onSelectBiomarker
}: LabTimeSeriesChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    record: LabResultRecord;
    valStr: string;
    isOut: boolean;
  } | null>(null);

  // Group all available biomarker test names
  const availableBiomarkers = Array.from(new Set(labResults.map(r => r.testName)));

  // Filter for active biomarker
  const biomarkerRecords = labResults
    .filter(r => r.testName === selectedBiomarker)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (availableBiomarkers.length === 0) {
    return null;
  }

  const activeRecord = biomarkerRecords[biomarkerRecords.length - 1];
  const unit = activeRecord?.unit || '';
  const refRange = activeRecord?.referenceRange || { min: 0, max: 100, unit: '' };
  const panelName = activeRecord?.panel || 'Panel';

  // SVG Chart dimensions
  const width = 760;
  const height = 260;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const values = biomarkerRecords.map(r => r.value);
  let minVal = Math.min(...values, refRange.min * 0.85);
  let maxVal = Math.max(...values, refRange.max * 1.15);

  minVal = Math.floor(minVal * 0.95);
  maxVal = Math.ceil(maxVal * 1.05);
  if (minVal === maxVal) {
    minVal -= 5;
    maxVal += 5;
  }

  const getX = (idx: number) => {
    if (biomarkerRecords.length === 1) return (width - paddingLeft - paddingRight) / 2 + paddingLeft;
    return paddingLeft + (idx / (biomarkerRecords.length - 1)) * (width - paddingLeft - paddingRight);
  };

  const getY = (val: number) => {
    return height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatFullDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const points = biomarkerRecords.map((r, idx) => {
    const val = r.value;
    const isOut = val < refRange.min || val > refRange.max;
    return {
      x: getX(idx),
      y: getY(val),
      val,
      record: r,
      isOut
    };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');

  // Calculate Reference Band coordinates
  const refMinY = Math.min(height - paddingBottom, Math.max(paddingTop, getY(refRange.min)));
  const refMaxY = Math.min(height - paddingBottom, Math.max(paddingTop, getY(refRange.max)));
  const refBandTop = Math.min(refMinY, refMaxY);
  const refBandHeight = Math.abs(refMinY - refMaxY);

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--cyan)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {selectedBiomarker} Longitudinal Trend
            </h3>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              <ShieldCheck size={11} /> {panelName}
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Reference Range: <strong style={{ color: 'var(--emerald)' }}>{refRange.optimal || `${refRange.min} - ${refRange.max} ${unit}`}</strong> &bull; Red dots flag abnormal or critical spikes
          </p>
        </div>
      </div>

      {biomarkerRecords.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No data points found for this biomarker.
        </div>
      ) : (
        /* Interactive SVG Chart */
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '600px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="labLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--cyan)" />
                <stop offset="100%" stopColor="var(--indigo)" />
              </linearGradient>
              <linearGradient id="labAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const yVal = minVal + pct * (maxVal - minVal);
              const yPos = getY(yVal);
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={width - paddingRight}
                    y2={yPos}
                    stroke="rgba(255, 255, 255, 0.07)"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={paddingLeft - 10}
                    y={yPos + 4}
                    fill="var(--text-dim)"
                    fontSize="10"
                    textAnchor="end"
                    className="mono-num"
                  >
                    {yVal.toFixed(yVal % 1 === 0 ? 0 : 1)}
                  </text>
                </g>
              );
            })}

            {/* Reference Range Optimal Green Band */}
            {refRange && refBandHeight > 0 && (
              <g>
                <rect
                  x={paddingLeft}
                  y={refBandTop}
                  width={width - paddingLeft - paddingRight}
                  height={refBandHeight}
                  fill="rgba(16, 185, 129, 0.12)"
                  stroke="rgba(16, 185, 129, 0.35)"
                  strokeDasharray="3,3"
                />
                <text
                  x={width - paddingRight - 8}
                  y={refBandTop + 14}
                  fill="var(--emerald)"
                  fontSize="9.5"
                  fontWeight="700"
                  textAnchor="end"
                  opacity="0.9"
                >
                  Optimal Band ({refRange.min} - {refRange.max} {unit})
                </text>
              </g>
            )}

            {/* Area fill under curve */}
            {points.length > 1 && (
              <polygon
                points={`
                  ${points[0].x},${height - paddingBottom}
                  ${polylineStr}
                  ${points[points.length - 1].x},${height - paddingBottom}
                `}
                fill="url(#labAreaGrad)"
              />
            )}

            {/* Trend line */}
            {points.length > 1 && (
              <polyline
                fill="none"
                stroke="url(#labLineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylineStr}
              />
            )}

            {/* X-axis date labels */}
            {points.map((p, idx) => (
              <g key={`x-lbl-${idx}`}>
                <line
                  x1={p.x}
                  y1={height - paddingBottom}
                  x2={p.x}
                  y2={height - paddingBottom + 5}
                  stroke="rgba(255, 255, 255, 0.2)"
                />
                <text
                  x={p.x}
                  y={height - paddingBottom + 18}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="middle"
                  className="mono-num"
                >
                  {formatDate(p.record.timestamp)}
                </text>
              </g>
            ))}

            {/* Data Point Markers */}
            {points.map((p, idx) => {
              const isSelected = hoveredPoint?.record.id === p.record.id;
              return (
                <g key={`pt-${idx}`} style={{ cursor: 'pointer' }}>
                  {p.isOut && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 11 : 8}
                      fill="rgba(239, 68, 68, 0.25)"
                    />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isSelected ? 6.5 : 4.5}
                    fill={p.isOut ? 'var(--critical)' : 'var(--emerald)'}
                    stroke="#0a0e1a"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint({
                      x: p.x,
                      y: p.y,
                      record: p.record,
                      valStr: `${p.val} ${unit}`,
                      isOut: p.isOut
                    })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Card */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                top: Math.max(10, hoveredPoint.y - 85),
                left: Math.min(width - 220, Math.max(20, hoveredPoint.x - 100)),
                background: 'rgba(15, 23, 42, 0.95)',
                backdropFilter: 'blur(12px)',
                border: hoveredPoint.isOut ? '1px solid var(--critical)' : '1px solid var(--emerald)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                pointerEvents: 'none',
                zIndex: 10,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                minWidth: '180px'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {formatFullDate(hoveredPoint.record.timestamp)}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                <span className="mono-num" style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: hoveredPoint.isOut ? 'var(--critical)' : 'var(--emerald)'
                }}>
                  {hoveredPoint.valStr}
                </span>
                <span className={`badge ${hoveredPoint.isOut ? 'badge-critical' : 'badge-normal'}`} style={{ fontSize: '0.62rem' }}>
                  {hoveredPoint.record.status.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Source: {hoveredPoint.record.source === 'ocr_upload' ? `AI OCR Ingest (${hoveredPoint.record.ocrConfidence || 95}%)` : 'Manual Entry'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

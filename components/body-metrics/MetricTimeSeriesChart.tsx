'use client';

import React, { useState } from 'react';
import { BodyMetricRecord } from '@/lib/types';
import { ShieldCheck, AlertCircle, Info } from 'lucide-react';

interface MetricTimeSeriesChartProps {
  records: BodyMetricRecord[];
  metricType: 'weight' | 'bmi' | 'bp' | 'waist' | 'heartRate';
  metricTitle: string;
  unit: string;
  referenceBand?: {
    min: number;
    max: number;
    label: string;
  };
  bpReferenceBand?: {
    systolicMax: number;
    diastolicMax: number;
  };
}

export default function MetricTimeSeriesChart({
  records,
  metricType,
  metricTitle,
  unit,
  referenceBand,
  bpReferenceBand
}: MetricTimeSeriesChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    record: BodyMetricRecord;
    valStr: string;
    isOut: boolean;
  } | null>(null);

  if (!records || records.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No time-series data recorded yet for this metric.
      </div>
    );
  }

  // Sort chronologically
  const sorted = [...records].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const width = 760;
  const height = 260;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  // Extract values based on metricType
  let allValues: number[] = [];
  if (metricType === 'bp') {
    sorted.forEach(r => {
      if (r.bloodPressure) {
        allValues.push(r.bloodPressure.systolic);
        allValues.push(r.bloodPressure.diastolic);
      }
    });
    if (allValues.length === 0) allValues = [120, 80];
  } else {
    sorted.forEach(r => {
      let val = 0;
      if (metricType === 'weight') val = r.weightKg || 0;
      else if (metricType === 'bmi') val = r.bmi || 0;
      else if (metricType === 'waist') val = r.waistCircumferenceCm || 0;
      else if (metricType === 'heartRate') val = r.heartRateBpm || 0;
      if (val > 0) allValues.push(val);
    });
  }

  let minVal = Math.min(...allValues);
  let maxVal = Math.max(...allValues);

  if (referenceBand) {
    minVal = Math.min(minVal, referenceBand.min * 0.9);
    maxVal = Math.max(maxVal, referenceBand.max * 1.1);
  } else if (metricType === 'bp') {
    minVal = Math.min(minVal, 50);
    maxVal = Math.max(maxVal, 160);
  }

  // Add margin
  minVal = Math.floor(minVal * 0.95);
  maxVal = Math.ceil(maxVal * 1.05);
  if (minVal === maxVal) {
    minVal -= 5;
    maxVal += 5;
  }

  const getX = (idx: number) => {
    if (sorted.length === 1) return (width - paddingLeft - paddingRight) / 2 + paddingLeft;
    return paddingLeft + (idx / (sorted.length - 1)) * (width - paddingLeft - paddingRight);
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

  // Build points for single value
  const singlePoints = sorted.map((r, idx) => {
    let val = 0;
    if (metricType === 'weight') val = r.weightKg || 0;
    else if (metricType === 'bmi') val = r.bmi || 0;
    else if (metricType === 'waist') val = r.waistCircumferenceCm || 0;
    else if (metricType === 'heartRate') val = r.heartRateBpm || 0;
    return { x: getX(idx), y: getY(val), val, record: r, isOut: referenceBand ? (val < referenceBand.min || val > referenceBand.max) : false };
  });

  const singlePolyline = singlePoints.map(p => `${p.x},${p.y}`).join(' ');

  // Build points for BP
  const bpSystolicPoints = sorted.map((r, idx) => ({
    x: getX(idx),
    y: getY(r.bloodPressure?.systolic || 120),
    val: r.bloodPressure?.systolic || 120,
    record: r,
    isOut: (r.bloodPressure?.systolic || 120) >= 130
  }));

  const bpDiastolicPoints = sorted.map((r, idx) => ({
    x: getX(idx),
    y: getY(r.bloodPressure?.diastolic || 80),
    val: r.bloodPressure?.diastolic || 80,
    record: r,
    isOut: (r.bloodPressure?.diastolic || 80) >= 80
  }));

  const bpSysPolyline = bpSystolicPoints.map(p => `${p.x},${p.y}`).join(' ');
  const bpDiaPolyline = bpDiastolicPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{metricTitle} Time-Series Trend</h3>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              <ShieldCheck size={11} /> Clinical Range Overlay
            </span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Green band indicates optimal reference range &bull; Red/Amber markers flag out-of-range readings
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', background: 'rgba(16, 185, 129, 0.25)', border: '1px solid var(--emerald)', borderRadius: '3px' }} />
            <span style={{ color: 'var(--text-muted)' }}>Target Range ({referenceBand ? `${referenceBand.min} - ${referenceBand.max} ${unit}` : '< 120/80 mmHg'})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--critical)', boxShadow: '0 0 6px var(--critical)' }} />
            <span style={{ color: 'var(--critical)', fontWeight: 600 }}>Out of Range</span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '600px' }}>
          {/* Reference Range Shaded Band (Green Zone) */}
          {referenceBand && (
            <rect
              x={paddingLeft}
              y={getY(referenceBand.max)}
              width={width - paddingLeft - paddingRight}
              height={Math.max(4, getY(referenceBand.min) - getY(referenceBand.max))}
              fill="rgba(16, 185, 129, 0.12)"
              stroke="rgba(16, 185, 129, 0.3)"
              strokeDasharray="4 4"
            />
          )}

          {metricType === 'bp' && (
            <rect
              x={paddingLeft}
              y={getY(120)}
              width={width - paddingLeft - paddingRight}
              height={Math.max(4, getY(60) - getY(120))}
              fill="rgba(16, 185, 129, 0.1)"
              stroke="rgba(16, 185, 129, 0.25)"
              strokeDasharray="4 4"
            />
          )}

          {/* Grid horizontal lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const val = minVal + ratio * (maxVal - minVal);
            const y = getY(val);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="2 2"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fill="var(--text-dim)"
                  fontSize="10"
                  fontFamily="var(--font-mono)"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* X Axis Date labels */}
          {sorted.map((r, idx) => {
            const x = getX(idx);
            return (
              <g key={r.id}>
                <line x1={x} y1={height - paddingBottom} x2={x} y2={height - paddingBottom + 5} stroke="rgba(255, 255, 255, 0.15)" />
                <text
                  x={x}
                  y={height - paddingBottom + 18}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10.5"
                  fontFamily="var(--font-sans)"
                >
                  {formatDate(r.timestamp)}
                </text>
              </g>
            );
          })}

          {/* Lines & Data points */}
          {metricType === 'bp' ? (
            <>
              {/* Systolic Line */}
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={bpSysPolyline}
              />
              {/* Diastolic Line */}
              <polyline
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={bpDiaPolyline}
              />

              {/* Systolic Points */}
              {bpSystolicPoints.map((p, idx) => (
                <circle
                  key={`sys-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={p.isOut ? "6" : "4.5"}
                  fill={p.isOut ? "var(--critical)" : "#0b0f19"}
                  stroke={p.isOut ? "#ffffff" : "#f43f5e"}
                  strokeWidth="2"
                  style={{
                    cursor: 'pointer',
                    filter: p.isOut ? 'drop-shadow(0 0 6px var(--critical))' : 'none'
                  }}
                  onMouseEnter={() => setHoveredPoint({
                    index: idx,
                    x: p.x,
                    y: p.y,
                    record: p.record,
                    valStr: `Systolic ${p.val} mmHg (Diastolic ${p.record.bloodPressure?.diastolic} mmHg)`,
                    isOut: p.isOut
                  })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}

              {/* Diastolic Points */}
              {bpDiastolicPoints.map((p, idx) => (
                <circle
                  key={`dia-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="#0b0f19"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint({
                    index: idx,
                    x: p.x,
                    y: p.y,
                    record: p.record,
                    valStr: `Diastolic ${p.val} mmHg (Systolic ${p.record.bloodPressure?.systolic} mmHg)`,
                    isOut: p.isOut
                  })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </>
          ) : (
            <>
              {/* Single Metric Polyline */}
              <polyline
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={singlePolyline}
              />

              {/* Data points */}
              {singlePoints.map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r={p.isOut ? "6.5" : "5"}
                  fill={p.isOut ? "var(--critical)" : "#0b0f19"}
                  stroke={p.isOut ? "#ffffff" : "#10b981"}
                  strokeWidth="2.5"
                  style={{
                    cursor: 'pointer',
                    filter: p.isOut ? 'drop-shadow(0 0 8px var(--critical))' : 'drop-shadow(0 0 4px #10b98180)'
                  }}
                  onMouseEnter={() => setHoveredPoint({
                    index: idx,
                    x: p.x,
                    y: p.y,
                    record: p.record,
                    valStr: `${p.val} ${unit}`,
                    isOut: p.isOut
                  })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              ))}
            </>
          )}
        </svg>

        {/* Hover Tooltip Card */}
        {hoveredPoint && (
          <div style={{
            position: 'absolute',
            left: `${hoveredPoint.x}px`,
            top: `${Math.max(10, hoveredPoint.y - 75)}px`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-surface)',
            border: `1px solid ${hoveredPoint.isOut ? 'var(--critical)' : 'var(--emerald)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '8px 12px',
            boxShadow: 'var(--shadow-md)',
            pointerEvents: 'none',
            zIndex: 30,
            whiteSpace: 'nowrap'
          }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
              {formatFullDate(hoveredPoint.record.timestamp)}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: hoveredPoint.isOut ? 'var(--critical)' : 'var(--emerald)' }}>
              {hoveredPoint.valStr}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Status: {hoveredPoint.isOut ? '⚠️ Out of Target Range' : '✓ Normal'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

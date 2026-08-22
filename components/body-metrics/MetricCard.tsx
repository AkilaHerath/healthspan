'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id: string;
  title: string;
  value: string | number;
  unit: string;
  subValue?: string;
  status: 'normal' | 'warning' | 'critical';
  statusLabel: string;
  icon: LucideIcon;
  iconColor: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function MetricCard({
  title,
  value,
  unit,
  subValue,
  status,
  statusLabel,
  icon: Icon,
  iconColor,
  isSelected,
  onSelect
}: MetricCardProps) {
  const getBorderColor = () => {
    if (isSelected) return 'var(--emerald)';
    if (status === 'critical') return 'var(--critical-border)';
    if (status === 'warning') return 'var(--warning-border)';
    return 'var(--border-subtle)';
  };

  const getBadgeClass = () => {
    if (status === 'critical') return 'badge-critical';
    if (status === 'warning') return 'badge-warning';
    return 'badge-normal';
  };

  return (
    <div
      className="glass-card interactive"
      onClick={onSelect}
      style={{
        padding: '20px',
        borderColor: getBorderColor(),
        background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
        boxShadow: isSelected ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: `${iconColor}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor
          }}>
            <Icon size={16} />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {title}
          </span>
        </div>
        <span className={`badge ${getBadgeClass()}`}>
          {statusLabel}
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="mono-num" style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            {value}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {unit}
          </span>
        </div>
        {subValue && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
            {subValue}
          </div>
        )}
      </div>

      <div style={{
        fontSize: '0.72rem',
        color: isSelected ? 'var(--emerald)' : 'var(--text-dim)',
        fontWeight: isSelected ? 700 : 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 'auto'
      }}>
        <span>{isSelected ? '● Active Chart View' : 'Click to graph trend'}</span>
      </div>
    </div>
  );
}

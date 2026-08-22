'use client';

import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))',
      borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
      padding: collapsed ? '6px 20px' : '10px 20px',
      fontSize: '0.82rem',
      color: '#cbd5e1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      zIndex: 40
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--amber)',
          flexShrink: 0
        }}>
          <ShieldAlert size={14} />
        </div>
        <div>
          <span style={{ fontWeight: 700, color: 'var(--amber)', marginRight: '6px' }}>
            CLINICAL ANALYTICAL DISCLAIMER:
          </span>
          {!collapsed ? (
            <span>
              HealthSpan is an analytical health record and multi-metric risk prediction platform designed for research and preventive decision-support. It does not replace professional medical diagnosis, clinical judgment, or emergency intervention. Always consult a licensed healthcare provider for individualized care.
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>
              Analytical & risk prediction prototype for informational decision-support only.
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center'
        }}
        title={collapsed ? "Expand disclaimer" : "Minimize disclaimer"}
        aria-label="Toggle Disclaimer"
      >
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </div>
  );
}

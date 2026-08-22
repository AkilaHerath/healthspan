'use client';

import React from 'react';
import { ClinicalInsight } from '@/lib/types';
import { Sparkles, AlertTriangle, AlertCircle, Info, Stethoscope, ArrowRight } from 'lucide-react';

interface TopInsightsListProps {
  insights: ClinicalInsight[];
  onExploreAll: () => void;
}

export default function TopInsightsList({ insights, onExploreAll }: TopInsightsListProps) {
  const topFive = insights.slice(0, 5);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="badge badge-critical"><AlertCircle size={12} /> Critical Risk</span>;
      case 'warning':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> Warning</span>;
      default:
        return <span className="badge badge-info"><Info size={12} /> Optimization</span>;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan)'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Top 5 Clinical Risk & Longevity Insights</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ranked multi-domain predictive insights</p>
          </div>
        </div>

        <button
          onClick={onExploreAll}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.8rem', gap: '6px' }}
        >
          <span>View All in Engine</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topFive.map((insight, idx) => (
          <div
            key={insight.id || idx}
            style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              background: insight.severity === 'critical' ? 'rgba(239, 68, 68, 0.05)' : insight.severity === 'warning' ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-subtle)',
              border: `1px solid ${insight.severity === 'critical' ? 'var(--critical-border)' : insight.severity === 'warning' ? 'var(--warning-border)' : 'var(--border-subtle)'}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)' }}>
                  {idx + 1}. {insight.title}
                </span>
              </div>
              {getSeverityBadge(insight.severity)}
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              {insight.finding}
            </p>

            {/* Metrics Involved Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 600 }}>Factors:</span>
              {insight.metricsInvolved.map((m, mIdx) => (
                <span key={mIdx} style={{
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)'
                }}>
                  {m}
                </span>
              ))}

              {insight.doctorConsultRequired && (
                <span style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  color: 'var(--amber)',
                  fontWeight: 600
                }}>
                  <Stethoscope size={13} />
                  Doctor Consult Advised
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

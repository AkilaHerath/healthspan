'use client';

import React from 'react';
import { ClinicalInsight } from '@/lib/types';
import { AlertTriangle, AlertCircle, Info, Stethoscope, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface InsightCardProps {
  insight: ClinicalInsight;
}

export default function InsightCard({ insight }: InsightCardProps) {
  const getSeverityBadge = () => {
    switch (insight.severity) {
      case 'critical':
        return (
          <span className="badge badge-critical" style={{ gap: '6px', padding: '4px 12px' }}>
            <AlertCircle size={13} /> Critical Risk Trajectory
          </span>
        );
      case 'warning':
        return (
          <span className="badge badge-warning" style={{ gap: '6px', padding: '4px 12px' }}>
            <AlertTriangle size={13} /> Predictive Warning
          </span>
        );
      default:
        return (
          <span className="badge badge-info" style={{ gap: '6px', padding: '4px 12px' }}>
            <Info size={13} /> Optimization Opportunity
          </span>
        );
    }
  };

  const getBorderColor = () => {
    switch (insight.severity) {
      case 'critical': return 'var(--critical-border)';
      case 'warning': return 'var(--warning-border)';
      default: return 'var(--border-subtle)';
    }
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '24px',
        borderColor: getBorderColor(),
        background: insight.severity === 'critical' 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(17, 24, 39, 0.85))'
          : insight.severity === 'warning'
          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(17, 24, 39, 0.85))'
          : 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="badge badge-normal" style={{ fontSize: '0.68rem', marginBottom: '6px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-muted)' }}>
            Category: {insight.category}
          </span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '4px' }}>
            {insight.title}
          </h3>
        </div>
        {getSeverityBadge()}
      </div>

      {/* Clinical Finding */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.25)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.88rem',
        color: 'var(--text-main)',
        lineHeight: 1.5
      }}>
        <strong>Clinical Finding:</strong> {insight.finding}
      </div>

      {/* Cross-Domain Factors Involved */}
      <div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
          Cross-Domain Metrics Analyzed:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {insight.metricsInvolved.map((m, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '0.75rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                fontWeight: 600
              }}
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Actionable Lifestyle Suggestions */}
      {insight.lifestyleSuggestions && insight.lifestyleSuggestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={15} />
            <span>Targeted Lifestyle & Preventive Recommendations:</span>
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
            {insight.lifestyleSuggestions.map((s, idx) => (
              <li key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ color: 'var(--emerald)', fontWeight: 800 }}>&bull;</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Doctor Consult Notice */}
      {insight.doctorConsultRequired && (
        <div style={{
          marginTop: 'auto',
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid var(--warning-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Stethoscope size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
            <strong>Physician Consultation Callout:</strong> {insight.doctorConsultReason || 'Schedule follow-up review with your primary care provider.'}
          </div>
        </div>
      )}
    </div>
  );
}

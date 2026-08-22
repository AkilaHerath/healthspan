'use client';

import React, { useState } from 'react';
import { LabResultRecord, LabPanelType } from '@/lib/types';
import { CLINICAL_REFERENCE_RANGES, classifyLabResult } from '@/lib/referenceRanges';
import { FlaskConical, Plus, X, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ManualLabEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<LabResultRecord, 'id'>) => void;
}

export default function ManualLabEntryModal({
  isOpen,
  onClose,
  onSave
}: ManualLabEntryModalProps) {
  const [panel, setPanel] = useState<LabPanelType>('Blood Sugar');
  const [testName, setTestName] = useState('Fasting Blood Sugar');
  const [value, setValue] = useState<number | ''>(95);
  const [dateTime, setDateTime] = useState(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  if (!isOpen) return null;

  // Available tests for chosen panel
  const availableTests = Object.entries(CLINICAL_REFERENCE_RANGES)
    .filter(([_, ref]) => ref.panel === panel)
    .map(([name]) => name);

  const currentRef = CLINICAL_REFERENCE_RANGES[testName] || {
    min: 0,
    max: 100,
    unit: 'mg/dL',
    optimal: 'Normal range',
    panel: 'Blood Sugar' as const,
    category: 'Glycemic Control'
  };

  const numVal = typeof value === 'number' ? value : 0;
  const classification = classifyLabResult(testName, numVal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === '') return;

    onSave({
      timestamp: new Date(dateTime).toISOString(),
      panel,
      testName,
      value: Number(value),
      unit: currentRef.unit,
      referenceRange: {
        min: currentRef.min,
        max: currentRef.max,
        optimal: currentRef.optimal
      },
      status: classification.status,
      source: 'manual',
      reviewedByPatient: true
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--cyan), var(--emerald))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <FlaskConical size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Manual Lab Result Entry</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Enter single biomarker value with unit validation</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Draw / Collection Timestamp</label>
              <input
                type="datetime-local"
                className="form-input mono-num"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Diagnostic Panel</label>
                <select
                  className="form-select"
                  value={panel}
                  onChange={e => {
                    const newPanel = e.target.value as LabPanelType;
                    setPanel(newPanel);
                    const firstTest = Object.entries(CLINICAL_REFERENCE_RANGES).find(([_, ref]) => ref.panel === newPanel);
                    if (firstTest) setTestName(firstTest[0]);
                  }}
                >
                  <option value="Blood Sugar">Blood Sugar Panel</option>
                  <option value="Lipid Panel">Lipid Panel (Cholesterol)</option>
                  <option value="Renal Function">Renal Function (Kidney)</option>
                  <option value="Liver Function">Liver Function (Hepatic)</option>
                  <option value="Hemoglobin">Hemoglobin & Hematology</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Biomarker Test</label>
                <select
                  className="form-select"
                  value={testName}
                  onChange={e => setTestName(e.target.value)}
                >
                  {availableTests.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Value & Unit input */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Measured Value</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input mono-num"
                  placeholder="e.g. 95"
                  value={value}
                  onChange={e => setValue(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measurement</label>
                <input
                  type="text"
                  className="form-input mono-num"
                  value={currentRef.unit}
                  disabled
                  style={{ opacity: 0.8 }}
                />
              </div>
            </div>

            {/* Instant Clinical Validation Preview */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Standard Reference Range:</span>
                <span className="mono-num" style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                  {currentRef.optimal || `${currentRef.min} - ${currentRef.max} ${currentRef.unit}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Clinical Status:</span>
                <span className={`badge ${classification.status === 'normal' ? 'badge-normal' : classification.status === 'borderline' ? 'badge-warning' : 'badge-critical'}`}>
                  {classification.message}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={15} />
              Save Lab Biomarker
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

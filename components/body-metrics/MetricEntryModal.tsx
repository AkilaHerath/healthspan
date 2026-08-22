'use client';

import React, { useState } from 'react';
import { BodyMetricRecord } from '@/lib/types';
import { calculateBMI, classifyBMI, classifyBP } from '@/lib/referenceRanges';
import { Scale, HeartPulse, X, Plus, Calendar, Clock } from 'lucide-react';

interface MetricEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<BodyMetricRecord, 'id' | 'bmi' | 'status'>, reason?: string) => void;
  initialHeightCm: number;
  initialWeightKg: number;
}

export default function MetricEntryModal({
  isOpen,
  onClose,
  onSave,
  initialHeightCm,
  initialWeightKg
}: MetricEntryModalProps) {
  // Format now as YYYY-MM-DDTHH:mm
  const getNowFormatted = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [dateTime, setDateTime] = useState(getNowFormatted());
  const [weightKg, setWeightKg] = useState<number | ''>(initialWeightKg || '');
  const [heightCm, setHeightCm] = useState<number | ''>(initialHeightCm || '');
  const [waistCm, setWaistCm] = useState<number | ''>('');
  const [systolic, setSystolic] = useState<number | ''>('');
  const [diastolic, setDiastolic] = useState<number | ''>('');
  const [heartRate, setHeartRate] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('Routine time-series biometric measurement');

  if (!isOpen) return null;

  const currentBMI = calculateBMI(Number(weightKg) || 0, Number(heightCm) || 0);
  const bmiClass = classifyBMI(currentBMI);
  const bpClass = (systolic && diastolic) ? classifyBP(Number(systolic), Number(diastolic)) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    const record: Omit<BodyMetricRecord, 'id' | 'bmi' | 'status'> = {
      timestamp: new Date(dateTime).toISOString(),
      weightKg: Number(weightKg),
      heightCm: Number(heightCm) || undefined,
      waistCircumferenceCm: Number(waistCm) || undefined,
      bloodPressure: (systolic && diastolic) ? {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: Number(heartRate) || undefined
      } : undefined,
      heartRateBpm: Number(heartRate) || undefined,
      notes: notes.trim() || undefined
    };

    onSave(record, reason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--emerald), var(--teal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Log Time-Series Body Metrics</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Granular vitals with timestamp & audit trail</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Timestamp input */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} style={{ color: 'var(--cyan)' }} />
                <span>Measurement Timestamp (Exact Date & Time)</span>
              </label>
              <input
                type="datetime-local"
                className="form-input mono-num"
                value={dateTime}
                onChange={e => setDateTime(e.target.value)}
                required
              />
            </div>

            {/* Weight & Height Row */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Body Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input mono-num"
                  placeholder="e.g. 78.5"
                  value={weightKg}
                  onChange={e => setWeightKg(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input mono-num"
                  placeholder="e.g. 178"
                  value={heightCm}
                  onChange={e => setHeightCm(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            {/* Realtime BMI Preview Bar */}
            {currentBMI > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Computed BMI:</span>
                  <span className="mono-num" style={{ fontSize: '1.15rem', fontWeight: 800, color: bmiClass.color }}>
                    {currentBMI.toFixed(1)} kg/m²
                  </span>
                </div>
                <span className={`badge ${bmiClass.status === 'normal' ? 'badge-normal' : bmiClass.status === 'warning' ? 'badge-warning' : 'badge-critical'}`}>
                  {bmiClass.label}
                </span>
              </div>
            )}

            {/* Waist Circumference & Heart Rate */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Waist Circumference (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-input mono-num"
                  placeholder="e.g. 96"
                  value={waistCm}
                  onChange={e => setWaistCm(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resting Heart Rate (bpm)</label>
                <input
                  type="number"
                  className="form-input mono-num"
                  placeholder="e.g. 72"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value === '' ? '' : parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Blood Pressure Row */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Blood Pressure (mmHg)
                </span>
                {bpClass && (
                  <span className={`badge ${bpClass.status === 'normal' ? 'badge-normal' : bpClass.status === 'warning' ? 'badge-warning' : 'badge-critical'}`} style={{ fontSize: '0.7rem' }}>
                    {bpClass.label}
                  </span>
                )}
              </div>

              <div className="grid-2">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Systolic (Upper)</label>
                  <input
                    type="number"
                    className="form-input mono-num"
                    placeholder="120"
                    value={systolic}
                    onChange={e => setSystolic(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.78rem' }}>Diastolic (Lower)</label>
                  <input
                    type="number"
                    className="form-input mono-num"
                    placeholder="80"
                    value={diastolic}
                    onChange={e => setDiastolic(e.target.value === '' ? '' : parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* Clinical Notes & Audit Reason */}
            <div className="form-group">
              <label className="form-label">Clinical / Context Notes</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Measured fasting in the morning after 10 mins seated rest"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Audit Log Reason</label>
              <input
                type="text"
                className="form-input"
                placeholder="Reason for recording measurement"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Plus size={15} />
              Save Time-Series Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

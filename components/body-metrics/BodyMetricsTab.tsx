'use client';

import React, { useState } from 'react';
import { HealthSpanStore, BodyMetricRecord } from '@/lib/types';
import { calculateBMI, classifyBMI, classifyBP, BODY_METRICS_RANGES } from '@/lib/referenceRanges';
import { addBodyMetric, updateBodyMetric, deleteBodyMetric } from '@/lib/storage';
import MetricCard from './MetricCard';
import MetricTimeSeriesChart from './MetricTimeSeriesChart';
import MetricEntryModal from './MetricEntryModal';
import AuditTrailModal from './AuditTrailModal';
import { Scale, HeartPulse, Ruler, Activity, PlusCircle, History, Edit2, Trash2, ShieldCheck } from 'lucide-react';

interface BodyMetricsTabProps {
  store: HealthSpanStore;
  onUpdateStore: (store: HealthSpanStore) => void;
}

export default function BodyMetricsTab({ store, onUpdateStore }: BodyMetricsTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<'weight' | 'bmi' | 'bp' | 'waist' | 'heartRate'>('weight');
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Edit / Delete states
  const [editingRecord, setEditingRecord] = useState<BodyMetricRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('Incorrect sensor calibration');

  const { bodyMetrics } = store.timeSeries;
  const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const latestBody = sortedMetrics[sortedMetrics.length - 1];

  const currentWeight = latestBody?.weightKg || store.profile.baselineBiometrics.initialWeightKg;
  const currentHeight = latestBody?.heightCm || store.profile.baselineBiometrics.initialHeightCm;
  const currentBMI = latestBody?.bmi || calculateBMI(currentWeight, currentHeight);
  const bmiClass = classifyBMI(currentBMI);

  const bp = latestBody?.bloodPressure || { systolic: 118, diastolic: 76, pulse: 70 };
  const bpClass = classifyBP(bp.systolic, bp.diastolic);

  const waist = latestBody?.waistCircumferenceCm || 92;
  const heartRate = latestBody?.heartRateBpm || bp.pulse || 70;

  const handleSaveNewMetric = (record: Omit<BodyMetricRecord, 'id' | 'bmi' | 'status'>, reason?: string) => {
    const updated = addBodyMetric(store, record, reason);
    onUpdateStore(updated);
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated = updateBodyMetric(store, editingRecord.id, editingRecord, editReason || 'Data entry correction');
    onUpdateStore(updated);
    setEditingRecord(null);
    setEditReason('');
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const updated = deleteBodyMetric(store, deleteTargetId, deleteReason);
    onUpdateStore(updated);
    setDeleteTargetId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Body Metrics & Vitals Tracker</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Granular time-series measurements with automated BMI & clinical reference validation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="btn btn-secondary"
            style={{ gap: '8px' }}
          >
            <History size={16} />
            <span>View Audit Trail</span>
          </button>
          <button
            onClick={() => setIsEntryModalOpen(true)}
            className="btn btn-primary"
            style={{ gap: '8px' }}
          >
            <PlusCircle size={16} />
            <span>Log Measurement</span>
          </button>
        </div>
      </div>

      {/* Click-to-Select Metric Cards Grid */}
      <div className="grid-4">
        <MetricCard
          id="weight"
          title="Body Weight"
          value={currentWeight}
          unit="kg"
          subValue={`Baseline: ${store.profile.baselineBiometrics.initialWeightKg} kg`}
          status={currentWeight > 80 ? 'warning' : 'normal'}
          statusLabel={currentWeight > 80 ? 'Elevated' : 'Normal'}
          icon={Scale}
          iconColor="#10b981"
          isSelected={selectedMetric === 'weight'}
          onSelect={() => setSelectedMetric('weight')}
        />

        <MetricCard
          id="bmi"
          title="Calculated BMI"
          value={currentBMI.toFixed(1)}
          unit="kg/m²"
          subValue={`Target: 18.5 - 24.9 kg/m²`}
          status={bmiClass.status}
          statusLabel={bmiClass.label}
          icon={Activity}
          iconColor="#06b6d4"
          isSelected={selectedMetric === 'bmi'}
          onSelect={() => setSelectedMetric('bmi')}
        />

        <MetricCard
          id="bp"
          title="Blood Pressure"
          value={`${bp.systolic}/${bp.diastolic}`}
          unit="mmHg"
          subValue={`MAP: ${Math.round(bp.diastolic + (bp.systolic - bp.diastolic) / 3)} mmHg`}
          status={bpClass.status}
          statusLabel={bpClass.label}
          icon={HeartPulse}
          iconColor="#ef4444"
          isSelected={selectedMetric === 'bp'}
          onSelect={() => setSelectedMetric('bp')}
        />

        <MetricCard
          id="waist"
          title="Waist Circumference"
          value={waist}
          unit="cm"
          subValue="Threshold: < 102 cm (Male)"
          status={waist >= 102 ? 'critical' : waist >= 98 ? 'warning' : 'normal'}
          statusLabel={waist >= 102 ? 'High Risk' : waist >= 98 ? 'Borderline' : 'Normal'}
          icon={Ruler}
          iconColor="#f59e0b"
          isSelected={selectedMetric === 'waist'}
          onSelect={() => setSelectedMetric('waist')}
        />
      </div>

      {/* Dynamic Time-Series Chart */}
      {selectedMetric === 'weight' && (
        <MetricTimeSeriesChart
          records={bodyMetrics}
          metricType="weight"
          metricTitle="Body Weight (kg)"
          unit="kg"
          referenceBand={{ min: 65, max: 79, label: 'Optimal Weight Range' }}
        />
      )}

      {selectedMetric === 'bmi' && (
        <MetricTimeSeriesChart
          records={bodyMetrics}
          metricType="bmi"
          metricTitle="Body Mass Index (BMI)"
          unit="kg/m²"
          referenceBand={{ min: 18.5, max: 24.9, label: 'Normal BMI (18.5 - 24.9)' }}
        />
      )}

      {selectedMetric === 'bp' && (
        <MetricTimeSeriesChart
          records={bodyMetrics}
          metricType="bp"
          metricTitle="Blood Pressure (Systolic & Diastolic)"
          unit="mmHg"
          bpReferenceBand={{ systolicMax: 120, diastolicMax: 80 }}
        />
      )}

      {selectedMetric === 'waist' && (
        <MetricTimeSeriesChart
          records={bodyMetrics}
          metricType="waist"
          metricTitle="Waist Circumference (cm)"
          unit="cm"
          referenceBand={{ min: 75, max: 94, label: 'Low Metabolic Risk' }}
        />
      )}

      {/* Historical Time-Series Log Table with Edit & Audit Actions */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Historical Time-Series Log</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              All measurements stored with ISO timestamps & auditable edit trails
            </p>
          </div>
          <span className="badge badge-normal">
            {bodyMetrics.length} Records
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Weight (kg)</th>
                <th style={{ padding: '10px 12px' }}>BMI</th>
                <th style={{ padding: '10px 12px' }}>Blood Pressure</th>
                <th style={{ padding: '10px 12px' }}>Waist (cm)</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Notes</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...bodyMetrics].reverse().map(record => {
                const bmi = record.bmi || calculateBMI(record.weightKg || 75, record.heightCm || 178);
                return (
                  <tr key={record.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td className="mono-num" style={{ padding: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="mono-num" style={{ padding: '12px' }}>{record.weightKg || '—'} kg</td>
                    <td className="mono-num" style={{ padding: '12px', fontWeight: 700 }}>{bmi.toFixed(1)}</td>
                    <td className="mono-num" style={{ padding: '12px' }}>
                      {record.bloodPressure ? `${record.bloodPressure.systolic}/${record.bloodPressure.diastolic} mmHg` : '—'}
                    </td>
                    <td className="mono-num" style={{ padding: '12px' }}>{record.waistCircumferenceCm || '—'} cm</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${record.status === 'normal' ? 'badge-normal' : record.status === 'warning' ? 'badge-warning' : 'badge-critical'}`} style={{ fontSize: '0.68rem' }}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-dim)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.notes || '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => setEditingRecord({ ...record })}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px' }}
                          title="Edit record (with audit trail)"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(record.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--critical)' }}
                          title="Delete record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      <MetricEntryModal
        isOpen={isEntryModalOpen}
        onClose={() => setIsEntryModalOpen(false)}
        onSave={handleSaveNewMetric}
        initialHeightCm={store.profile.baselineBiometrics.initialHeightCm}
        initialWeightKg={store.profile.baselineBiometrics.initialWeightKg}
      />

      {/* Audit Trail Modal */}
      <AuditTrailModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditTrail={store.auditTrail}
      />

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Edit Measurement Record</h3>
              <button onClick={() => setEditingRecord(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input mono-num"
                    value={editingRecord.weightKg || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, weightKg: parseFloat(e.target.value) || undefined })}
                    required
                  />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Systolic BP</label>
                    <input
                      type="number"
                      className="form-input mono-num"
                      value={editingRecord.bloodPressure?.systolic || ''}
                      onChange={e => setEditingRecord({
                        ...editingRecord,
                        bloodPressure: {
                          systolic: parseInt(e.target.value) || 120,
                          diastolic: editingRecord.bloodPressure?.diastolic || 80
                        }
                      })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Diastolic BP</label>
                    <input
                      type="number"
                      className="form-input mono-num"
                      value={editingRecord.bloodPressure?.diastolic || ''}
                      onChange={e => setEditingRecord({
                        ...editingRecord,
                        bloodPressure: {
                          systolic: editingRecord.bloodPressure?.systolic || 120,
                          diastolic: parseInt(e.target.value) || 80
                        }
                      })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mandatory Audit Reason for Edit</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Correcting typo in weight entry"
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save & Record Audit Diff</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--critical)' }}>Confirm Record Deletion</h3>
              <button onClick={() => setDeleteTargetId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                This record will be removed from active time-series calculations, but an immutable audit trail entry will be retained for regulatory compliance.
              </p>
              <div className="form-group">
                <label className="form-label">Reason for Deletion</label>
                <input
                  type="text"
                  className="form-input"
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setDeleteTargetId(null)}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

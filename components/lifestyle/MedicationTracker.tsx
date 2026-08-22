'use client';

import React, { useState } from 'react';
import { MedicationRecord } from '@/lib/types';
import { Pill, Plus, CheckCircle2, Clock, AlertCircle, Bell, Shield, Edit2, Trash2 } from 'lucide-react';

interface MedicationTrackerProps {
  medications: MedicationRecord[];
  onAddMedication: (record: Omit<MedicationRecord, 'id'>) => void;
  onMarkTaken: (id: string) => void;
  onUpdateMedication?: (id: string, updates: Partial<MedicationRecord>, reason: string) => void;
  onDeleteMedication?: (id: string, reason: string) => void;
}

export default function MedicationTracker({
  medications,
  onAddMedication,
  onMarkTaken,
  onUpdateMedication,
  onDeleteMedication
}: MedicationTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [condition, setCondition] = useState('Type 2 Diabetes');
  const [drugName, setDrugName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [scheduleTimeStr, setScheduleTimeStr] = useState('08:00');

  const [editingRecord, setEditingRecord] = useState<MedicationRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('Updated prescription dosage/schedule');
  const [deleteReason, setDeleteReason] = useState('Medication discontinued by physician');

  // Check for due or overdue meds
  const now = new Date();
  const currentHours = now.getHours();

  const dueMedications = medications.filter(m => {
    if (!m.active) return false;
    if (!m.lastTakenTimestamp) return true;
    const lastTaken = new Date(m.lastTakenTimestamp);
    const isSameDay = lastTaken.toDateString() === now.toDateString();
    return !isSameDay;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drugName || !dosage) return;

    onAddMedication({
      condition,
      drugName,
      dosage,
      frequency,
      scheduleTime: scheduleTimeStr.split(',').map(s => s.trim()),
      startDate: new Date().toISOString().split('T')[0],
      active: true
    });

    setIsModalOpen(false);
    setDrugName('');
    setDosage('');
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateMedication) return;
    onUpdateMedication(editingRecord.id, editingRecord, editReason);
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId || !onDeleteMedication) return;
    onDeleteMedication(deleteTargetId, deleteReason);
    setDeleteTargetId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Due Doses Alert Banner */}
      {dueMedications.length > 0 ? (
        <div style={{
          background: 'var(--amber-bg)',
          border: '1px solid var(--amber-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Bell size={22} style={{ color: 'var(--amber)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--amber)' }}>
                {dueMedications.length} Scheduled Dose(s) Pending Today
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {dueMedications.map(m => `${m.drugName} (${m.dosage})`).join(', ')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {dueMedications.map(m => (
              <button
                key={m.id}
                onClick={() => onMarkTaken(m.id)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', gap: '4px', borderColor: 'var(--amber)' }}
              >
                <CheckCircle2 size={13} style={{ color: 'var(--emerald)' }} />
                <span>Mark {m.drugName.split(' ')[0]} Taken</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--normal-bg)',
          border: '1px solid var(--normal-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <CheckCircle2 size={20} style={{ color: 'var(--emerald)' }} />
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--emerald)' }}>
              All Active Medication Doses Up to Date
            </h4>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Excellent adherence tracked across all chronic disease management regimens.
            </p>
          </div>
        </div>
      )}

      {/* Top Header with Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Prescription & Chronic Illness Mapping</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Illnesses tracked: Diabetes, Hypertension, Dyslipidemia with timing schedules
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
          style={{ gap: '8px' }}
        >
          <Plus size={16} />
          <span>Add Prescribed Medication</span>
        </button>
      </div>

      {/* Active Medications Cards Grid */}
      <div className="grid-3">
        {medications.map(med => (
          <div
            key={med.id}
            className="glass-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderLeft: '4px solid var(--emerald)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-info" style={{ fontSize: '0.68rem', marginBottom: '6px' }}>
                  {med.condition}
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '4px' }}>
                  {med.drugName}
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Dosage: <strong style={{ color: 'var(--text-main)' }}>{med.dosage}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setEditingRecord({ ...med })}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px' }}
                  title="Edit record (with audit trail)"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => setDeleteTargetId(med.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '4px 8px', color: 'var(--critical)' }}
                  title="Delete record"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <div><strong>Frequency:</strong> {med.frequency}</div>
              <div><strong>Schedule:</strong> {med.scheduleTime.join(', ')}</div>
            </div>

            <div style={{
              marginTop: 'auto',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                {med.lastTakenTimestamp ? `Last taken: ${new Date(med.lastTakenTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not taken yet today'}
              </span>
              <button
                onClick={() => onMarkTaken(med.id)}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
              >
                <CheckCircle2 size={12} style={{ color: 'var(--emerald)' }} />
                <span>Take Dose</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Add Prescribed Medication</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Associated Chronic Condition / Illness</label>
                  <select
                    className="form-select"
                    value={condition}
                    onChange={e => setCondition(e.target.value)}
                  >
                    <option value="Type 2 Diabetes">Type 2 Diabetes (Glycemic Control)</option>
                    <option value="Hypertension">Hypertension (Blood Pressure)</option>
                    <option value="Dyslipidemia">Dyslipidemia (Cholesterol / Lipids)</option>
                    <option value="Cardiovascular">Cardiovascular / Heart Disease</option>
                    <option value="General Health / Supplement">General Health / Supplement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Drug / Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Metformin Extended Release"
                    value={drugName}
                    onChange={e => setDrugName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Dosage & Strength</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 500mg"
                      value={dosage}
                      onChange={e => setDosage(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      className="form-select"
                      value={frequency}
                      onChange={e => setFrequency(e.target.value)}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Thrice daily">Thrice daily</option>
                      <option value="As needed">As needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Scheduled Time(s) (comma-separated 24h format)</label>
                  <input
                    type="text"
                    className="form-input mono-num"
                    placeholder="e.g. 08:00, 20:00"
                    value={scheduleTimeStr}
                    onChange={e => setScheduleTimeStr(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Medication</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Medication Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Edit Medication: {editingRecord.drugName}</h3>
              <button onClick={() => setEditingRecord(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Associated Condition</label>
                  <select
                    className="form-select"
                    value={editingRecord.condition}
                    onChange={e => setEditingRecord({ ...editingRecord, condition: e.target.value })}
                  >
                    <option value="Type 2 Diabetes">Type 2 Diabetes (Glycemic Control)</option>
                    <option value="Hypertension">Hypertension (Blood Pressure)</option>
                    <option value="Dyslipidemia">Dyslipidemia (Cholesterol / Lipids)</option>
                    <option value="Cardiovascular">Cardiovascular / Heart Disease</option>
                    <option value="General Health / Supplement">General Health / Supplement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Drug / Brand Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRecord.drugName}
                    onChange={e => setEditingRecord({ ...editingRecord, drugName: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Dosage & Strength</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingRecord.dosage}
                      onChange={e => setEditingRecord({ ...editingRecord, dosage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Frequency</label>
                    <select
                      className="form-select"
                      value={editingRecord.frequency}
                      onChange={e => setEditingRecord({ ...editingRecord, frequency: e.target.value })}
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Thrice daily">Thrice daily</option>
                      <option value="As needed">As needed (PRN)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Log Reason for Modification</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editReason}
                    onChange={e => setEditReason(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingRecord(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes & Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Medication Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--critical)' }}>Discontinue / Delete Medication</h3>
              <button onClick={() => setDeleteTargetId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Are you sure you want to remove this medication from active prescriptions? An immutable audit entry will be generated.
              </p>
              <div className="form-group">
                <label className="form-label">Reason for Discontinuation / Deletion</label>
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

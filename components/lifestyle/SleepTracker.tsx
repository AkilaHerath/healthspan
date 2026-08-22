'use client';

import React, { useState } from 'react';
import { SleepRecord } from '@/lib/types';
import { Moon, Plus, Sparkles, Clock, Calendar, Edit2, Trash2 } from 'lucide-react';

interface SleepTrackerProps {
  sleepRecords: SleepRecord[];
  onAddSleep: (record: Omit<SleepRecord, 'id'>) => void;
  onUpdateSleep?: (id: string, updates: Partial<SleepRecord>, reason: string) => void;
  onDeleteSleep?: (id: string, reason: string) => void;
}

export default function SleepTracker({ sleepRecords, onAddSleep, onUpdateSleep, onDeleteSleep }: SleepTrackerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [durationHours, setDurationHours] = useState<number>(6.5);
  const [qualityScore, setQualityScore] = useState<number>(75);
  const [bedtime, setBedtime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('06:30');
  const [notes, setNotes] = useState('');

  const [editingRecord, setEditingRecord] = useState<SleepRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('Corrected sleep log');
  const [deleteReason, setDeleteReason] = useState('Incorrect sleep entry');

  const recentSleep = sleepRecords.slice(-7);
  const avgSleep = recentSleep.length > 0
    ? (recentSleep.reduce((acc, s) => acc + s.durationHours, 0) / recentSleep.length).toFixed(1)
    : '7.0';

  const avgQuality = recentSleep.length > 0
    ? Math.round(recentSleep.reduce((acc, s) => acc + (s.qualityScore || 70), 0) / recentSleep.length)
    : 75;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSleep({
      timestamp: new Date().toISOString(),
      durationHours: Number(durationHours),
      qualityScore: Number(qualityScore),
      bedtime,
      wakeTime,
      notes: notes.trim() || undefined
    });
    setIsModalOpen(false);
    setNotes('');
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateSleep) return;
    onUpdateSleep(editingRecord.id, editingRecord, editReason);
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId || !onDeleteSleep) return;
    onDeleteSleep(deleteTargetId, deleteReason);
    setDeleteTargetId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top summary cards */}
      <div className="grid-3">
        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--indigo)'
          }}>
            <Moon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>7-Day Average Duration</div>
            <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgSleep} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs/night</span></div>
            <div style={{ fontSize: '0.72rem', color: Number(avgSleep) < 7.0 ? 'var(--amber)' : 'var(--emerald)' }}>
              {Number(avgSleep) < 7.0 ? '⚠️ Sleep debt detected (< 7.0h)' : '✓ Meeting target range'}
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--cyan)'
          }}>
            <Sparkles size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Sleep Quality</div>
            <div className="mono-num" style={{ fontSize: '1.5rem', fontWeight: 800 }}>{avgQuality} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ 100</span></div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Restorative sleep index</div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
            style={{ width: '100%', gap: '8px' }}
          >
            <Plus size={16} />
            <span>Log Sleep Session</span>
          </button>
        </div>
      </div>

      {/* Recent Sleep History Table */}
      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Sleep Duration & Quality History</h3>
          <span className="badge badge-normal">{sleepRecords.length} Logged Nights</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Date</th>
                <th style={{ padding: '10px 12px' }}>Duration</th>
                <th style={{ padding: '10px 12px' }}>Bedtime - Wake Time</th>
                <th style={{ padding: '10px 12px' }}>Quality Score</th>
                <th style={{ padding: '10px 12px' }}>Notes</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...sleepRecords].reverse().map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td className="mono-num" style={{ padding: '12px', fontWeight: 600 }}>
                    {new Date(s.timestamp).toLocaleDateString()}
                  </td>
                  <td className="mono-num" style={{ padding: '12px', fontWeight: 700, color: s.durationHours < 6.5 ? 'var(--amber)' : 'var(--emerald)' }}>
                    {s.durationHours} hrs
                  </td>
                  <td className="mono-num" style={{ padding: '12px' }}>
                    {s.bedtime || '—'} → {s.wakeTime || '—'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                      {s.qualityScore || 75}/100
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-dim)' }}>
                    {s.notes || '—'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => setEditingRecord({ ...s })}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Edit record (with audit trail)"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(s.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--critical)' }}
                        title="Delete record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Log Sleep Record</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input mono-num"
                      value={durationHours}
                      onChange={e => setDurationHours(parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quality Score (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input mono-num"
                      value={qualityScore}
                      onChange={e => setQualityScore(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Bedtime</label>
                    <input
                      type="time"
                      className="form-input mono-num"
                      value={bedtime}
                      onChange={e => setBedtime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wake Time</label>
                    <input
                      type="time"
                      className="form-input mono-num"
                      value={wakeTime}
                      onChange={e => setWakeTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Deep sleep, woke refreshed"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Sleep Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Edit Sleep Record</h3>
              <button onClick={() => setEditingRecord(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Duration (Hours)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input mono-num"
                      value={editingRecord.durationHours}
                      onChange={e => setEditingRecord({ ...editingRecord, durationHours: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quality Score (1-100)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className="form-input mono-num"
                      value={editingRecord.qualityScore || 75}
                      onChange={e => setEditingRecord({ ...editingRecord, qualityScore: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Bedtime</label>
                    <input
                      type="time"
                      className="form-input mono-num"
                      value={editingRecord.bedtime || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, bedtime: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Wake Time</label>
                    <input
                      type="time"
                      className="form-input mono-num"
                      value={editingRecord.wakeTime || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, wakeTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Log Reason for Edit</label>
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

      {/* Delete Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--critical)' }}>Delete Sleep Record</h3>
              <button onClick={() => setDeleteTargetId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Are you sure you want to delete this sleep session? An immutable audit log entry will be created.
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

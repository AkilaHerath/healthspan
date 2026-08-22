'use client';

import React, { useState } from 'react';
import { LabResultRecord } from '@/lib/types';
import { ArrowUpDown, Filter, Sparkles, ShieldAlert, CheckCircle2, AlertCircle, Edit2, Trash2 } from 'lucide-react';

interface LabResultsTableProps {
  labResults: LabResultRecord[];
  onUpdateRecord?: (id: string, updates: Partial<LabResultRecord>, reason: string) => void;
  onDeleteRecord?: (id: string, reason: string) => void;
}

export default function LabResultsTable({ labResults, onUpdateRecord, onDeleteRecord }: LabResultsTableProps) {
  const [selectedPanel, setSelectedPanel] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [editingRecord, setEditingRecord] = useState<LabResultRecord | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [editReason, setEditReason] = useState('Updated lab measurement value');
  const [deleteReason, setDeleteReason] = useState('Incorrect lab result entry');

  const panels = ['all', 'Blood Sugar', 'Lipid Panel', 'Renal Function', 'Liver Function', 'Hemoglobin'];

  const filtered = labResults
    .filter(r => selectedPanel === 'all' || r.panel === selectedPanel)
    .sort((a, b) => {
      const tA = new Date(a.timestamp).getTime();
      const tB = new Date(b.timestamp).getTime();
      return sortOrder === 'desc' ? tB - tA : tA - tB;
    });

  // Group by date
  const groupedByDate: Record<string, LabResultRecord[]> = {};
  filtered.forEach(r => {
    const dateKey = new Date(r.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
    groupedByDate[dateKey].push(r);
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}><AlertCircle size={10} /> Critical</span>;
      case 'borderline':
        return <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}><ShieldAlert size={10} /> Borderline</span>;
      default:
        return <span className="badge badge-normal" style={{ fontSize: '0.68rem' }}><CheckCircle2 size={10} /> Normal</span>;
    }
  };

  const handleConfirmEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord || !onUpdateRecord) return;
    onUpdateRecord(editingRecord.id, editingRecord, editReason || 'Manual correction of lab value');
    setEditingRecord(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId || !onDeleteRecord) return;
    onDeleteRecord(deleteTargetId, deleteReason || 'Manual deletion of lab record');
    setDeleteTargetId(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Panel Filters & Sorting Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Filter size={13} /> Panel:
          </span>
          {panels.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPanel(p)}
              className={`btn btn-sm ${selectedPanel === p ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.75rem', padding: '4px 12px' }}
            >
              {p === 'all' ? 'All Panels' : p}
            </button>
          ))}
        </div>

        <button
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', gap: '6px' }}
        >
          <ArrowUpDown size={13} />
          <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
        </button>
      </div>

      {/* Grouped Results Cards */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No lab results match the selected panel filter.
        </div>
      ) : (
        Object.entries(groupedByDate).map(([dateStr, items]) => {
          const criticalCount = items.filter(i => i.status === 'critical').length;
          const borderlineCount = items.filter(i => i.status === 'borderline').length;

          return (
            <div key={dateStr} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Group Date Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '10px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>{dateStr}</h3>
                  <span className="badge badge-normal" style={{ fontSize: '0.68rem' }}>
                    {items.length} Biomarkers Tested
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  {criticalCount > 0 && (
                    <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                      {criticalCount} Critical
                    </span>
                  )}
                  {borderlineCount > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>
                      {borderlineCount} Borderline
                    </span>
                  )}
                  {criticalCount === 0 && borderlineCount === 0 && (
                    <span className="badge badge-normal" style={{ fontSize: '0.68rem' }}>
                      All Optimal
                    </span>
                  )}
                </div>
              </div>

              {/* Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <th style={{ padding: '8px 10px' }}>Biomarker / Test</th>
                      <th style={{ padding: '8px 10px' }}>Panel</th>
                      <th style={{ padding: '8px 10px' }}>Recorded Value</th>
                      <th style={{ padding: '8px 10px' }}>Clinical Reference Range</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                      <th style={{ padding: '8px 10px' }}>Source</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => {
                      const isOutOfRange = item.status !== 'normal';
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {item.testName}
                          </td>
                          <td style={{ padding: '10px', color: 'var(--text-dim)' }}>
                            {item.panel}
                          </td>
                          <td className="mono-num" style={{ padding: '10px' }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '1rem',
                              color: item.status === 'critical' ? 'var(--critical)' : item.status === 'borderline' ? 'var(--amber)' : 'var(--emerald)'
                            }}>
                              {item.value}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                              {item.unit}
                            </span>
                          </td>
                          <td className="mono-num" style={{ padding: '10px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                            {item.referenceRange.optimal || `${item.referenceRange.min} - ${item.referenceRange.max} ${item.unit}`}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {getStatusBadge(item.status)}
                          </td>
                          <td style={{ padding: '10px' }}>
                            {item.source === 'ocr_upload' ? (
                              <span style={{ fontSize: '0.72rem', color: 'var(--cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Sparkles size={11} /> OCR Ingest ({item.ocrConfidence || 95}%)
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                Manual Log
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '10px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                onClick={() => setEditingRecord({ ...item })}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px' }}
                                title="Edit record (with audit trail)"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTargetId(item.id)}
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
          );
        })
      )}

      {/* Edit Modal */}
      {editingRecord && (
        <div className="modal-overlay" onClick={() => setEditingRecord(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Edit Lab Result: {editingRecord.testName}</h3>
              <button onClick={() => setEditingRecord(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <form onSubmit={handleConfirmEdit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Value</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input mono-num"
                      value={editingRecord.value}
                      onChange={e => setEditingRecord({ ...editingRecord, value: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit</label>
                    <input
                      type="text"
                      className="form-input mono-num"
                      value={editingRecord.unit}
                      disabled
                      style={{ opacity: 0.8 }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Audit Log Reason for Modification</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Corrected entry following verified lab sheet"
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

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="modal-overlay" onClick={() => setDeleteTargetId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', color: 'var(--critical)' }}>Delete Lab Result</h3>
              <button onClick={() => setDeleteTargetId(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Are you sure you want to delete this lab result? An immutable audit log entry will be created.
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

'use client';

import React, { useState } from 'react';
import { LabResultRecord, ExtractedOcrField } from '@/lib/types';
import { classifyLabResult } from '@/lib/referenceRanges';
import { UploadCloud, Sparkles, AlertTriangle, CheckCircle2, FileText, ArrowRight, X, Edit3 } from 'lucide-react';

interface OcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBatch: (records: Omit<LabResultRecord, 'id'>[]) => void;
}

export default function OcrUploadModal({ isOpen, onClose, onConfirmBatch }: OcrUploadModalProps) {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload');
  const [dragActive, setDragActive] = useState(false);
  const [selectedPanelType, setSelectedPanelType] = useState('metabolic_panel');
  const [filename, setFilename] = useState('Metabolic_Lipid_Panel_Report.pdf');
  const [extractedFields, setExtractedFields] = useState<ExtractedOcrField[]>([]);
  const [scanProgress, setScanProgress] = useState(0);

  if (!isOpen) return null;

  const handleStartScan = (docType: string, fileTitle: string) => {
    setSelectedPanelType(docType);
    setFilename(fileTitle);
    setStep('scanning');
    setScanProgress(15);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 200);

    // Call OCR endpoint
    const formData = new FormData();
    formData.append('documentType', docType);

    fetch('/api/ocr-scan', {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          setExtractedFields(data.fields || []);
          setStep('review');
        }, 300);
      })
      .catch(err => {
        clearInterval(interval);
        console.error(err);
        setStep('upload');
      });
  };

  const handleValueChange = (index: number, newVal: number) => {
    const updated = [...extractedFields];
    updated[index].extractedValue = newVal;
    const classification = classifyLabResult(updated[index].testName, newVal);
    updated[index].status = classification.status;
    updated[index].verified = true;
    setExtractedFields(updated);
  };

  const handleConfirmAndIngest = () => {
    const timestamp = new Date().toISOString();
    const records: Omit<LabResultRecord, 'id'>[] = extractedFields.map(f => ({
      timestamp,
      panel: f.panel,
      testName: f.testName,
      value: f.extractedValue,
      unit: f.unit,
      referenceRange: {
        min: f.referenceMin,
        max: f.referenceMax
      },
      status: f.status,
      source: 'ocr_upload',
      ocrConfidence: f.confidence,
      reviewedByPatient: true
    }));

    onConfirmBatch(records);
    onClose();
    setStep('upload');
  };

  const lowConfidenceCount = extractedFields.filter(f => f.isLowConfidence).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
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
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>AI OCR Lab Report Scanner</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Automated document parsing with confidence scoring & verification gate
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* STEP 1: Upload Dropzone */}
          {step === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  handleStartScan('metabolic_panel', file ? file.name : 'Uploaded_Lab_Report.pdf');
                }}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--emerald)' : 'rgba(255, 255, 255, 0.15)'}`,
                  background: dragActive ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all var(--transition-normal)'
                }}
                onClick={() => handleStartScan('metabolic_panel', 'Quest_Diagnostics_Metabolic_Report.pdf')}
              >
                <div style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'rgba(6, 182, 212, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cyan)',
                  marginBottom: '14px'
                }}>
                  <UploadCloud size={28} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Drag & Drop Lab PDF or Scan Image
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '400px' }}>
                  Supports Quest Diagnostics, LabCorp, Hospital EHR exports (PDF, PNG, JPEG). Click anywhere to simulate upload.
                </p>
              </div>

              {/* Sample Quick Demo Files */}
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Or select a clinical test report sample:
                </span>
                <div className="grid-3" style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleStartScan('metabolic_panel', 'Metabolic_Lipid_Panel_Aug2026.pdf')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--cyan)' }}>Metabolic & Lipid Panel</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>FBS, HbA1c, Chol, LDL, HDL, Trig</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartScan('renal_liver_panel', 'Renal_Hepatic_Panel_Aug2026.pdf')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--emerald)' }}>Renal & Hepatic Panel</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Creatinine, eGFR, AST, ALT, BUN</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartScan('hematology_panel', 'Complete_Blood_Count_CBC.pdf')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '10px', flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--indigo)' }}>Hematology Panel</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Hemoglobin, Hematocrit, RBC</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Scanning Animation */}
          {step === 'scanning' && (
            <div style={{ padding: '50px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--emerald)',
                animation: 'pulseGlow 1.5s infinite'
              }}>
                <Sparkles size={30} />
              </div>

              <div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Analyzing {filename}...</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  OCR engine extracting numerical biomarker values, units, and confidence scores
                </p>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '320px', height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${scanProgress}%`, height: '100%', background: 'linear-gradient(90deg, var(--cyan), var(--emerald))', transition: 'width 0.3s ease' }} />
              </div>
              <span className="mono-num" style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{scanProgress}% Processed</span>
            </div>
          )}

          {/* STEP 3: Review & Confirm Step with Low-Confidence Flagging */}
          {step === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Alert notice if low confidence detected */}
              {lowConfidenceCount > 0 && (
                <div style={{
                  background: 'var(--amber-bg)',
                  border: '1px solid var(--amber-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertTriangle size={18} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                    <strong>{lowConfidenceCount} field(s) flagged with low OCR confidence (&lt;85%):</strong> Marked in amber below. Please review and adjust the extracted numbers before confirming.
                  </div>
                </div>
              )}

              {/* Extracted Fields Table */}
              <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-surface-elevated)', color: 'var(--text-muted)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                      <th style={{ padding: '10px 12px' }}>Biomarker</th>
                      <th style={{ padding: '10px 12px' }}>Extracted Value (Editable)</th>
                      <th style={{ padding: '10px 12px' }}>Unit</th>
                      <th style={{ padding: '10px 12px' }}>Confidence Score</th>
                      <th style={{ padding: '10px 12px' }}>Status Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedFields.map((field, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          background: field.isLowConfidence ? 'rgba(245, 158, 11, 0.08)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-main)' }}>
                          {field.testName}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              step="0.1"
                              className="form-input mono-num"
                              style={{
                                width: '100px',
                                padding: '5px 8px',
                                fontSize: '0.9rem',
                                borderColor: field.isLowConfidence ? 'var(--amber)' : 'var(--border-subtle)'
                              }}
                              value={field.extractedValue}
                              onChange={e => handleValueChange(idx, parseFloat(e.target.value) || 0)}
                            />
                            <Edit3 size={12} style={{ color: 'var(--text-dim)' }} />
                          </div>
                        </td>
                        <td className="mono-num" style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                          {field.unit}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {field.isLowConfidence ? (
                            <span className="badge badge-warning" style={{ fontSize: '0.68rem', gap: '4px' }}>
                              <AlertTriangle size={10} /> {field.confidence}% Confidence
                            </span>
                          ) : (
                            <span className="badge badge-normal" style={{ fontSize: '0.68rem', gap: '4px' }}>
                              <CheckCircle2 size={10} /> {field.confidence}% Confidence
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge ${field.status === 'normal' ? 'badge-normal' : field.status === 'borderline' ? 'badge-warning' : 'badge-critical'}`} style={{ fontSize: '0.68rem' }}>
                            {field.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === 'review' ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep('upload')}
              >
                Re-upload / Scan Another
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleConfirmAndIngest}
              >
                <CheckCircle2 size={16} />
                <span>Confirm & Ingest {extractedFields.length} Biomarkers</span>
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

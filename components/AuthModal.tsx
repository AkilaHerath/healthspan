'use client';

import React, { useState } from 'react';
import { Lock, Mail, UserCheck, Sparkles, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('admin@healthspan.com');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || 'Authentication failed.');
        setLoading(false);
        return;
      }
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('admin@healthspan.com');
    setPassword('admin123');
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@healthspan.com', password: 'admin123' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data?.error || 'Demo login failed.');
        setLoading(false);
        return;
      }
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '460px' }}>
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
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>{mode === 'login' ? 'HealthSpan Sign In' : 'Create Patient Account'}</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tenant: enterprise-01 (Secure sessions)</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Quick Demo Pill Banner */}
            {mode === 'login' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(6, 182, 212, 0.08))',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--emerald)' }}>
                    Demo Credentials
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    admin@healthspan.com &bull; admin123
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  disabled={loading}
                >
                  <Sparkles size={13} />
                  Quick Login
                </button>
              </div>
            )}

            {error && (
              <div style={{
                background: 'var(--critical-bg)',
                border: '1px solid var(--critical-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: 'var(--critical)',
                fontSize: '0.82rem'
              }}>
                {error}
              </div>
            )}

            {mode === 'signup' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Morgan"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                  <UserCheck size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@healthspan.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--cyan)',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In to HealthSpan' : 'Create & Initialize Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

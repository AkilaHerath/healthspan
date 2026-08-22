'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  LayoutDashboard, 
  Scale, 
  HeartPulse, 
  FlaskConical, 
  Sparkles, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  Moon, 
  Sun,
  ShieldCheck
} from 'lucide-react';
import { HealthSpanStore, InAppNotification } from '@/lib/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  store: HealthSpanStore;
  onOpenAuth: () => void;
  onLogout: () => void;
  onMarkNotificationRead: (id: string) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  store,
  onOpenAuth,
  onLogout,
  onMarkNotificationRead
}: NavbarProps) {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const unreadNotifs = store.notifications.filter(n => !n.read);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'body-metrics', label: 'Body Metrics', icon: Scale },
    { id: 'lifestyle', label: 'Lifestyle', icon: HeartPulse },
    { id: 'lab-results', label: 'Lab Results', icon: FlaskConical },
    { id: 'insights', label: 'Insights & Risk Engine', icon: Sparkles, highlight: true },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.92)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 20px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.35)'
          }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #ffffff 40%, #10b981 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                HealthSpan
              </span>
              <span className="badge badge-normal" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                <ShieldCheck size={11} /> Enterprise
              </span>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Clinical Intelligence & Risk Engine
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs-container" style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 1 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`tab-btn ${isActive ? 'active' : ''}`}
                title={item.label}
                style={{
                  position: 'relative',
                  ...(item.highlight && !isActive ? { color: '#67e8f9' } : {})
                }}
              >
                <Icon size={16} />
                <span className="tab-label">{item.label}</span>
                {item.id === 'notifications' && unreadNotifs.length > 0 && (
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: 'var(--critical)',
                    position: 'absolute',
                    top: '6px',
                    right: '6px'
                  }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Notifications, Theme, User Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Notifications Quick Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 10px', position: 'relative' }}
              title="Notifications"
            >
              <Bell size={17} />
              {unreadNotifs.length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--critical)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifMenu && (
              <div style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
                padding: '12px',
                zIndex: 100
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Recent Alerts</span>
                  <button
                    onClick={() => { setActiveTab('notifications'); setShowNotifMenu(false); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--emerald)', fontSize: '0.75rem', cursor: 'pointer' }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                  {store.notifications.slice(0, 4).map(n => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      style={{
                        padding: '8px 10px',
                        background: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.08)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div style={{ fontWeight: 600, color: n.type === 'critical' ? 'var(--critical)' : n.type === 'warning' ? 'var(--amber)' : 'var(--emerald)' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {n.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            style={{ padding: '8px 10px' }}
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)'
          }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--indigo), var(--cyan))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.8rem'
            }}>
              {store.profile.fullName.charAt(0) || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.profile.fullName}
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>
                {store.account.email}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px'
              }}
              title="Sign Out / Switch Account"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

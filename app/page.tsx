'use client';

import React, { useState, useEffect } from 'react';
import { HealthSpanStore, HealthScoreBreakdown, ClinicalInsight, BodyMetricRecord } from '@/lib/types';
import { SEED_DEMO_STORE } from '@/lib/seedData';
import { getLocalStore, saveLocalStore, addBodyMetric } from '@/lib/storage';
import { calculateHealthScore } from '@/lib/healthScoreCalculator';
import { generatePredictiveInsights } from '@/lib/riskPredictionEngine';

import DisclaimerBanner from '@/components/DisclaimerBanner';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import MetricEntryModal from '@/components/body-metrics/MetricEntryModal';

import DashboardTab from '@/components/dashboard/DashboardTab';
import BodyMetricsTab from '@/components/body-metrics/BodyMetricsTab';
import LifestyleTab from '@/components/lifestyle/LifestyleTab';
import LabResultsTab from '@/components/lab-results/LabResultsTab';
import InsightsEngineTab from '@/components/insights/InsightsEngineTab';
import NotificationsTab from '@/components/notifications/NotificationsTab';
import SettingsTab from '@/components/settings/SettingsTab';

export default function HealthSpanApp() {
  const [store, setStore] = useState<HealthSpanStore>(SEED_DEMO_STORE);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from storage on mount
  useEffect(() => {
    setIsMounted(true);
    const loadedStore = getLocalStore();
    setStore(loadedStore);
  }, []);

  // Recalculate Health Score & Predictive Clinical Insights
  const scoreData: HealthScoreBreakdown = calculateHealthScore(store);
  const insights: ClinicalInsight[] = generatePredictiveInsights(store);

  const handleUpdateStore = (newStore: HealthSpanStore) => {
    setStore(newStore);
    saveLocalStore(newStore);
  };

  const handleMarkNotificationRead = (notifId: string) => {
    const updated: HealthSpanStore = {
      ...store,
      notifications: store.notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    };
    handleUpdateStore(updated);
  };

  const handleQuickLogSave = (record: Omit<BodyMetricRecord, 'id' | 'bmi' | 'status'>, reason?: string) => {
    const updated = addBodyMetric(store, record, reason);
    handleUpdateStore(updated);
  };

  const handleAccountPurged = () => {
    setStore(SEED_DEMO_STORE);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthOpen(true);
  };

  if (!isMounted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)'
      }}>
        Initializing HealthSpan Platform...
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Persistent Clinical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Primary Sticky Header & Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        store={store}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onMarkNotificationRead={handleMarkNotificationRead}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardTab
            store={store}
            scoreData={scoreData}
            insights={insights}
            onNavigateTab={setActiveTab}
            onOpenQuickLog={() => setIsQuickLogOpen(true)}
          />
        )}

        {activeTab === 'body-metrics' && (
          <BodyMetricsTab
            store={store}
            onUpdateStore={handleUpdateStore}
          />
        )}

        {activeTab === 'lifestyle' && (
          <LifestyleTab
            store={store}
            onUpdateStore={handleUpdateStore}
          />
        )}

        {activeTab === 'lab-results' && (
          <LabResultsTab
            store={store}
            onUpdateStore={handleUpdateStore}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsEngineTab
            store={store}
            scoreData={scoreData}
            insights={insights}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            store={store}
            scoreData={scoreData}
            insights={insights}
            onUpdateStore={handleUpdateStore}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            store={store}
            onUpdateStore={handleUpdateStore}
            onAccountPurged={handleAccountPurged}
          />
        )}
      </main>

      {/* Quick Time-Series Metric Log Modal (accessible from Dashboard header) */}
      <MetricEntryModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onSave={handleQuickLogSave}
        initialHeightCm={store.profile.baselineBiometrics.initialHeightCm}
        initialWeightKg={store.profile.baselineBiometrics.initialWeightKg}
      />

      {/* Auth / Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={newStore => {
          setStore(newStore);
          setActiveTab('dashboard');
        }}
      />
    </div>
  );
}

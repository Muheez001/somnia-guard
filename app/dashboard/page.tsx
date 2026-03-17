'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { WalletProfile, WalletEvent, Stats } from '@/lib/types';
import { calculateRiskScore, getRiskLevel, buildInitialProfile } from '@/lib/heuristics';
import { saveProfiles, loadProfiles, clearProfiles } from '@/lib/storage';
import StatsBar from '@/components/StatsBar';
import WalletFeed from '@/components/WalletFeed';
import ClaimSimulator from '@/components/ClaimSimulator';
import ActivityChart from '@/components/ActivityChart';
import ClusterGraph from '@/components/ClusterGraph';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Map<string, WalletProfile>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const profilesArray = Array.from(profiles.values());

  const stats: Stats = {
    total: profilesArray.length,
    safe: profilesArray.filter((p) => p.riskLevel === 'SAFE').length,
    suspicious: profilesArray.filter((p) => p.riskLevel === 'SUSPICIOUS').length,
    flagged: profilesArray.filter((p) => p.riskLevel === 'FLAGGED').length,
  };

  // Process an incoming event (from SSE or simulator)
  const processEvent = useCallback((event: {
    participant: string;
    questId: number;
    timestamp: number;
    blockNumber: number;
  }) => {
    setProfiles((prev) => {
      const next = new Map(prev);
      const existing = next.get(event.participant);

      const walletEvent: WalletEvent = {
        id: `${event.participant}-${event.timestamp}-${Math.random().toString(36).slice(2, 6)}`,
        address: event.participant,
        questId: event.questId,
        timestamp: event.timestamp,
        blockNumber: event.blockNumber,
      };

      let profile: WalletProfile;
      if (existing) {
        profile = {
          ...existing,
          claims: [...existing.claims, walletEvent],
        };
      } else {
        profile = buildInitialProfile(event.participant, walletEvent);
      }

      const { score, reasons } = calculateRiskScore(profile, next);
      profile.riskScore = score;
      profile.riskLevel = getRiskLevel(score);
      profile.riskReasons = reasons;
      profile.isFlagged = score >= 70;

      next.set(event.participant, profile);
      return next;
    });
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadProfiles();
    if (stored.size > 0) {
      setProfiles(stored);
    }
    setInitialized(true);
  }, []);

  // Save to localStorage when profiles change
  useEffect(() => {
    if (initialized && profiles.size > 0) {
      saveProfiles(profiles);
    }
  }, [profiles, initialized]);

  // SSE connection
  useEffect(() => {
    // Suppress MetaMask auto-injection errors
    const handler = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes('MetaMask')) e.preventDefault();
    };
    window.addEventListener('unhandledrejection', handler);

    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      console.log('SSE connected');
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.error) {
          console.error('SSE error event:', event.error);
          return;
        }
        console.log('SSE event:', event);
        processEvent(event);
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      setError('Connection lost — retrying...');
    };

    return () => {
      window.removeEventListener('unhandledrejection', handler);
      eventSource.close();
    };
  }, [processEvent]);

  const handleClear = () => {
    clearProfiles();
    setProfiles(new Map());
  };

  const totalClaims = profilesArray.reduce((sum, p) => sum + p.claims.length, 0);

  return (
    <main style={{ minHeight: '100vh', position: 'relative' }}>
      {/* ── Ambient Background ──────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-15%', left: '-5%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,229,160,0.04) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'subtle-drift 20s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(168,85,247,0.03) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'subtle-drift 25s ease-in-out infinite reverse',
        }} />
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{
        borderBottom: '1px solid var(--border-glass)',
        padding: '14px 24px',
        background: 'rgba(8, 9, 13, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 10,
              textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7,
                background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: '#080a0e',
              }}>S</div>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 1 }}>
                SOMNIAGUARD
              </span>
            </Link>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              marginLeft: 8,
            }}>
              <span className={`status-dot ${connected ? 'status-dot-safe' : 'status-dot-danger'}`} />
              <span style={{
                fontSize: 11,
                color: connected ? 'var(--accent-teal)' : 'var(--accent-red)',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                {connected ? 'CONNECTED' : (
                  <>
                    <AlertCircle size={10} /> {error ? 'RECONNECTING' : 'CONNECTING'}
                  </>
                )}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="hide-mobile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
              <a
                href={`https://shannon-explorer.somnia.network/address/${process.env.NEXT_PUBLIC_QUEST_REGISTRY}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: 'var(--accent-purple)', textDecoration: 'none' }}
              >
                QuestRegistry ↗
              </a>
              <a
                href={`https://shannon-explorer.somnia.network/address/${process.env.NEXT_PUBLIC_SYBIL_GUARD}`}
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: 11, color: 'var(--accent-purple)', textDecoration: 'none' }}
              >
                SybilGuard ↗
              </a>
            </div>
            {profiles.size > 0 && (
              <button
                onClick={handleClear}
                className="btn-outline btn-sm"
                style={{ fontSize: 11 }}
              >
                Clear Data
              </button>
            )}
          </div>
        </div>

        {error && (
          <div style={{
            maxWidth: 1400, margin: '10px auto 0',
            padding: '8px 14px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 8,
            background: 'rgba(239, 68, 68, 0.05)',
            fontSize: 12, color: 'var(--accent-red)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
      </div>

      {/* ── Main Content ────────────────────────────────────── */}
      <div style={{
        maxWidth: 1400, margin: '0 auto',
        padding: '20px 24px',
      }}>
        <StatsBar stats={stats} />

        <div className="dashboard-layout" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 280px',
          gap: 16,
          alignItems: 'start',
        }}>
          <WalletFeed profiles={profilesArray} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ActivityChart totalClaims={totalClaims} />
            <ClusterGraph profiles={profilesArray} />
            <ClaimSimulator onSimulateEvent={processEvent} />

            {/* Network Info Card */}
            <div className="glass-card-static" style={{ padding: '20px' }}>
              <div style={{
                fontSize: 10, letterSpacing: 2,
                color: 'var(--text-muted)', marginBottom: 12,
              }}>
                NETWORK
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Chain', value: 'Somnia Testnet' },
                  { label: 'Chain ID', value: '50312' },
                  { label: 'Protocol', value: 'Reactivity SSE' },
                ].map((row) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12,
                  }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-geist-mono), monospace',
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dashboard-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

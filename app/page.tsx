'use client';

import { useEffect, useRef, useState } from 'react';
import { WalletProfile, WalletEvent, Stats } from '@/lib/types';
import { calculateRiskScore, getRiskLevel, buildInitialProfile } from '@/lib/heuristics';
import { subscribeToQuestEvents } from '@/lib/reactivity';
import StatsBar from '@/components/StatsBar';
import WalletFeed from '@/components/WalletFeed';

export default function Dashboard() {
  const [profiles, setProfiles] = useState<Map<string, WalletProfile>>(new Map());
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  const profilesArray = Array.from(profiles.values());

  const stats: Stats = {
    total: profilesArray.length,
    safe: profilesArray.filter((p) => p.riskLevel === 'SAFE').length,
    suspicious: profilesArray.filter((p) => p.riskLevel === 'SUSPICIOUS').length,
    flagged: profilesArray.filter((p) => p.riskLevel === 'FLAGGED').length,
  };

  useEffect(() => {
    // Suppress MetaMask auto-injection errors
    window.addEventListener('unhandledrejection', (e) => {
      if (e.reason?.message?.includes('MetaMask')) {
        e.preventDefault();
      }
    });

    const eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      console.log('SSE connected');
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        console.log('SSE event received:', event);

        setProfiles((prev) => {
          const next = new Map(prev);
          const existing = next.get(event.participant);

          const walletEvent: WalletEvent = {
            id: `${event.participant}-${event.timestamp}`,
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
      } catch (err) {
        console.error('Failed to parse SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setConnected(false);
      setError('Connection lost — retrying...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <main style={{
      fontFamily: "'Courier New', monospace",
      background: '#080b10',
      minHeight: '100vh',
      color: '#c8d6e5',
      padding: '0',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1a2535',
        padding: '20px 28px',
        background: 'linear-gradient(180deg, #0d1420 0%, #080b10 100%)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: connected ? '#00ff9d' : '#ef4444',
                boxShadow: connected ? '0 0 10px #00ff9d' : '0 0 10px #ef4444',
                animation: 'pulse 2s infinite',
              }} />
              <span style={{
                fontSize: 10,
                color: connected ? '#00ff9d' : '#ef4444',
                letterSpacing: 4,
                textTransform: 'uppercase',
              }}>
                {connected ? 'Reactivity Connected' : error ? 'Connection Failed' : 'Connecting...'}
              </span>
            </div>
            <h1 style={{
              margin: '4px 0 2px',
              fontSize: 22, fontWeight: 700,
              color: '#fff', letterSpacing: 3,
            }}>
              SOMNIA GUARD
            </h1>
            <p style={{ margin: 0, fontSize: 11, color: '#4a6080', letterSpacing: 1 }}>
              Real-time Bot & Sybil Detection · Powered by Somnia Reactivity
            </p>
          </div>

          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', gap: 6,
          }}>
            <div style={{
              fontSize: 10, color: '#4a6080',
              letterSpacing: 1,
            }}>
              CONTRACTS
            </div>
            
            <a
              href={`https://shannon-explorer.somnia.network/address/${process.env.NEXT_PUBLIC_QUEST_REGISTRY}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 11, color: '#a855f7',
                fontFamily: 'monospace', textDecoration: 'none',
              }}
            >
              QuestRegistry ↗
            </a>
            
            <a
              href={`https://shannon-explorer.somnia.network/address/${process.env.NEXT_PUBLIC_SYBIL_GUARD}`}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 11, color: '#a855f7',
                fontFamily: 'monospace', textDecoration: 'none',
              }}
            >
              SybilGuard ↗
            </a>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 12, padding: '8px 14px',
            border: '1px solid #ef444433',
            borderRadius: 6, background: '#ef444408',
            fontSize: 12, color: '#ef4444',
          }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ padding: '24px 28px' }}>
        <StatsBar stats={stats} />
        <WalletFeed profiles={profilesArray} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080b10; }
        ::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 3px; }
      `}</style>
    </main>
  );
}

import { WalletProfile } from '@/lib/types';
import RiskBadge from './RiskBadge';
import { useState } from 'react';
import { Activity, Loader2, MousePointer2, AlertTriangle } from 'lucide-react';

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(timestamp: number) {
  const diff = Math.floor(Date.now() / 1000) - timestamp;
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function WalletFeed({
  profiles,
}: {
  profiles: WalletProfile[];
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedProfile = profiles.find((p) => p.address === selected);

  return (
    <div className="wallet-feed-grid" style={{
      display: 'grid',
      gridTemplateColumns: '1fr 360px',
      gap: 16,
    }}>
      {/* Live Feed */}
      <div className="glass-card-static" style={{ overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Activity size={12} className="text-accent-teal" />
          <span style={{ fontSize: 12, color: 'var(--accent-teal)', letterSpacing: 2, fontWeight: 600 }}>
            LIVE FEED
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {profiles.length} wallets
          </span>
        </div>

        <div style={{ maxHeight: 520, overflowY: 'auto' }}>
          {profiles.length === 0 ? (
            <div style={{
              padding: 48, textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 14,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
            }}>
              <Loader2 size={32} className="animate-spin" style={{ opacity: 0.4 }} />
              Listening for quest claims...
            </div>
          ) : (
            [...profiles].reverse().map((profile) => (
              <div
                key={profile.address}
                onClick={() => setSelected(
                  selected === profile.address ? null : profile.address
                )}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-glass)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: selected === profile.address
                    ? 'rgba(255,255,255,0.04)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: profile.riskLevel === 'FLAGGED'
                      ? 'rgba(239,68,68,0.1)'
                      : profile.riskLevel === 'SUSPICIOUS'
                      ? 'rgba(245,158,11,0.1)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${
                      profile.riskLevel === 'FLAGGED'
                        ? 'rgba(239,68,68,0.2)'
                        : profile.riskLevel === 'SUSPICIOUS'
                        ? 'rgba(245,158,11,0.2)'
                        : 'var(--border-glass)'
                    }`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'var(--text-muted)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontWeight: 600,
                  }}>
                    {profile.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 14, color: 'var(--text-primary)',
                      fontFamily: 'var(--font-geist-mono), monospace',
                      fontWeight: 500,
                    }}>
                      {shortAddr(profile.address)}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {profile.claims.length} claim{profile.claims.length !== 1 ? 's' : ''}
                      {' · '}
                      {timeAgo(profile.claims[profile.claims.length - 1].timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700,
                    color: profile.riskScore >= 70 ? 'var(--accent-red)'
                      : profile.riskScore >= 40 ? 'var(--accent-amber)' : 'var(--accent-teal)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}>
                    {profile.riskScore}
                  </span>
                  <RiskBadge level={profile.riskLevel} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="glass-card-static wallet-detail-panel" style={{ overflow: 'hidden' }}>
        {!selectedProfile ? (
          <div style={{
            height: '100%', minHeight: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 13, padding: 24,
            textAlign: 'center', flexDirection: 'column', gap: 12,
          }}>
            <MousePointer2 size={28} style={{ opacity: 0.3 }} />
            Select a wallet to see risk breakdown
          </div>
        ) : (
          <div style={{ padding: 24 }}>
            <div style={{
              fontSize: 11, color: 'var(--text-muted)',
              letterSpacing: 2, marginBottom: 14,
            }}>
              WALLET DETAIL
            </div>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace', fontSize: 13,
              color: 'var(--text-primary)', marginBottom: 16,
              wordBreak: 'break-all', lineHeight: 1.6,
            }}>
              {selectedProfile.address}
            </div>

            <RiskBadge level={selectedProfile.riskLevel} />

            <div style={{
              marginTop: 20, display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 10,
            }}>
              {[
                { label: 'RISK SCORE', value: `${selectedProfile.riskScore}/100` },
                { label: 'TOTAL CLAIMS', value: selectedProfile.claims.length },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '12px 14px',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{
                    fontSize: 10, color: 'var(--text-muted)',
                    letterSpacing: 1, marginBottom: 6,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 20, fontWeight: 700,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {selectedProfile.riskReasons.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  letterSpacing: 2, marginBottom: 10,
                }}>
                  RISK FACTORS
                </div>
                {selectedProfile.riskReasons.map((reason, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    border: '1px solid rgba(239, 68, 68, 0.15)',
                    borderRadius: 8,
                    background: 'rgba(239, 68, 68, 0.04)',
                    fontSize: 13, color: 'var(--accent-red)',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <AlertTriangle size={14} /> {reason}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <div style={{
                fontSize: 11, color: 'var(--text-muted)',
                letterSpacing: 2, marginBottom: 10,
              }}>
                CLAIM HISTORY
              </div>
              {selectedProfile.claims.map((claim, i) => (
                <div key={i} style={{
                  padding: '8px 14px',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 6,
                  fontSize: 12, color: 'var(--text-secondary)',
                  marginBottom: 4,
                  fontFamily: 'var(--font-geist-mono), monospace',
                }}>
                  Quest #{claim.questId} · {timeAgo(claim.timestamp)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .wallet-feed-grid {
            grid-template-columns: 1fr !important;
          }
          .wallet-detail-panel {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
}

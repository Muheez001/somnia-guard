'use client';

import { WalletProfile } from '@/lib/types';
import RiskBadge from './RiskBadge';
import { useState } from 'react';

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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
      {/* Live Feed */}
      <div style={{
        border: '1px solid #1a2535',
        borderRadius: 8,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #1a2535',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#0d1420',
        }}>
          <div style={{
            width: 7, height: 7,
            borderRadius: '50%',
            background: '#00ff9d',
            boxShadow: '0 0 8px #00ff9d',
            animation: 'pulse 2s infinite',
          }} />
          <span style={{ fontSize: 11, color: '#00ff9d', letterSpacing: 2 }}>
            LIVE FEED
          </span>
          <span style={{ fontSize: 11, color: '#4a6080', marginLeft: 'auto' }}>
            {profiles.length} wallets detected
          </span>
        </div>

        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
          {profiles.length === 0 ? (
            <div style={{
              padding: 40,
              textAlign: 'center',
              color: '#4a6080',
              fontSize: 13,
            }}>
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
                  padding: '12px 16px',
                  borderBottom: '1px solid #1a2535',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: selected === profile.address
                    ? '#0d1420' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 6,
                    background: '#1a2535',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10, color: '#4a6080', fontFamily: 'monospace',
                  }}>
                    {profile.address.slice(2, 4).toUpperCase()}
                  </div>
                  <div>
                    <div style={{
                      fontSize: 13, color: '#e2e8f0',
                      fontFamily: 'monospace', fontWeight: 500,
                    }}>
                      {shortAddr(profile.address)}
                    </div>
                    <div style={{ fontSize: 11, color: '#4a6080', marginTop: 2 }}>
                      {profile.claims.length} claim{profile.claims.length !== 1 ? 's' : ''}
                      {' · '}
                      {timeAgo(profile.claims[profile.claims.length - 1].timestamp)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: profile.riskScore >= 70 ? '#ef4444'
                      : profile.riskScore >= 40 ? '#f59e0b' : '#00ff9d',
                    fontFamily: 'monospace',
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
      <div style={{
        border: '1px solid #1a2535',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#0d1420',
      }}>
        {!selectedProfile ? (
          <div style={{
            height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#4a6080', fontSize: 12, padding: 24,
            textAlign: 'center',
          }}>
            Click any wallet to see risk breakdown
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            <div style={{
              fontSize: 10, color: '#4a6080',
              letterSpacing: 2, marginBottom: 12,
            }}>
              WALLET DETAIL
            </div>
            <div style={{
              fontFamily: 'monospace', fontSize: 12,
              color: '#e2e8f0', marginBottom: 16,
              wordBreak: 'break-all',
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
                  padding: '10px 12px',
                  border: '1px solid #1a2535',
                  borderRadius: 6,
                }}>
                  <div style={{
                    fontSize: 9, color: '#4a6080',
                    letterSpacing: 1, marginBottom: 4,
                  }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontSize: 18, fontWeight: 700,
                    color: '#e2e8f0', fontFamily: 'monospace',
                  }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {selectedProfile.riskReasons.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{
                  fontSize: 10, color: '#4a6080',
                  letterSpacing: 2, marginBottom: 8,
                }}>
                  RISK FACTORS
                </div>
                {selectedProfile.riskReasons.map((reason, i) => (
                  <div key={i} style={{
                    padding: '8px 12px',
                    border: '1px solid #ef444422',
                    borderRadius: 6,
                    background: '#ef444408',
                    fontSize: 12, color: '#ef4444',
                    marginBottom: 6,
                  }}>
                    ⚠ {reason}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{
                fontSize: 10, color: '#4a6080',
                letterSpacing: 2, marginBottom: 8,
              }}>
                CLAIM HISTORY
              </div>
              {selectedProfile.claims.map((claim, i) => (
                <div key={i} style={{
                  padding: '6px 12px',
                  border: '1px solid #1a2535',
                  borderRadius: 4,
                  fontSize: 11, color: '#4a6080',
                  marginBottom: 4,
                  fontFamily: 'monospace',
                }}>
                  Quest #{claim.questId} · {timeAgo(claim.timestamp)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

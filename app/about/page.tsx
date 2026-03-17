import Link from 'next/link';
import { FileText, Zap, Search, Shield, ArrowLeft, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    num: '01',
    title: 'Quest Claim On-chain',
    desc: 'A user calls claimQuest() on the QuestRegistry contract deployed on Somnia Testnet. The transaction emits a QuestClaimed event.',
    icon: <FileText size={22} />,
    color: 'var(--accent-teal)',
  },
  {
    num: '02',
    title: 'Reactivity Push',
    desc: 'Somnia Reactivity detects the event and pushes it via WebSocket in real-time — no polling needed. Events arrive within milliseconds.',
    icon: <Zap size={22} />,
    color: 'var(--accent-purple)',
  },
  {
    num: '03',
    title: 'Risk Analysis',
    desc: 'The heuristic engine scores each wallet on 4 factors: wallet age, claim velocity, rapid-claim bursts, and address cluster patterns.',
    icon: <Search size={22} />,
    color: 'var(--accent-amber)',
  },
  {
    num: '04',
    title: 'Dashboard Alert',
    desc: 'Results stream to the live dashboard via SSE. Wallets are tagged SAFE, SUSPICIOUS, or FLAGGED with detailed risk breakdowns.',
    icon: <Shield size={22} />,
    color: 'var(--accent-red)',
  },
];

const HEURISTICS = [
  {
    name: 'New Wallet Detection',
    weight: '30 pts',
    desc: 'Flags wallets less than 7 days old — common trait of bot-created accounts.',
  },
  {
    name: 'Low Activity Analysis',
    weight: '25 pts',
    desc: 'Single-claim wallets with no history signal disposable bot accounts.',
  },
  {
    name: 'Rapid Claim Detection',
    weight: '40 pts',
    desc: 'Detects 3+ claims within a 60-second window — automated scripting signature.',
  },
  {
    name: 'Address Cluster Matching',
    weight: '50 pts',
    desc: 'Identifies wallets with sequential address suffixes (< 5 hex distance) — Sybil farm pattern.',
  },
];

const TECH = [
  { name: 'Somnia Network', role: 'L1 Blockchain' },
  { name: 'Somnia Reactivity SDK', role: 'Real-time event streaming' },
  { name: 'Solidity', role: 'Smart contracts' },
  { name: 'Next.js 14', role: 'Full-stack framework' },
  { name: 'viem', role: 'EVM client library' },
  { name: 'Server-Sent Events', role: 'Backend → Frontend stream' },
];

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient BG */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '10%', right: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'subtle-drift 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', left: '-5%',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,229,160,0.05) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'subtle-drift 18s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(8, 9, 13, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent-teal), var(--accent-purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#080a0e',
            }}>S</div>
            <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1 }}>SOMNIAGUARD</span>
          </Link>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/" className="btn-outline btn-sm" style={{ gap: 6 }}>
              <ArrowLeft size={14} /> Home
            </Link>
            <Link href="/dashboard" className="btn-primary btn-sm" style={{ gap: 6 }}>
              Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 800, margin: '0 auto',
        padding: '80px 24px 60px', textAlign: 'center',
      }}>
        <h1 className="animate-fade-in" style={{
          fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: 700,
          marginBottom: 16,
          background: 'linear-gradient(180deg, #ffffff 30%, var(--text-secondary) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          How SomniaGuard Works
        </h1>
        <p className="animate-fade-in-delay-1" style={{
          fontSize: 16, color: 'var(--text-secondary)',
          lineHeight: 1.7, maxWidth: 560, margin: '0 auto',
        }}>
          A real-time on-chain intelligence system that detects and flags bot farms
          and Sybil attacks on Somnia Network quest rewards.
        </p>
      </section>

      {/* Architecture Flow */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} className="animate-fade-in" style={{
              display: 'flex', gap: 24, alignItems: 'flex-start',
              animationDelay: `${i * 0.1}s`,
            }}>
              {/* Timeline */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minWidth: 48,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: `${s.color}12`, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {s.icon}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    width: 2, height: 40,
                    background: `linear-gradient(180deg, ${s.color}40, transparent)`,
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0, flex: 1 }}>
                <div style={{
                  fontSize: 11, color: s.color, letterSpacing: 2,
                  fontFamily: 'var(--font-geist-mono), monospace',
                  marginBottom: 4,
                }}>
                  STEP {s.num}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Risk Heuristics */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
          Risk Scoring Engine
        </h2>
        <p style={{
          fontSize: 15, color: 'var(--text-secondary)', textAlign: 'center',
          marginBottom: 36, maxWidth: 500, margin: '0 auto 36px',
        }}>
          Wallets are scored 0-100. Scores ≥ 70 = FLAGGED, ≥ 40 = SUSPICIOUS.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 14,
        }}>
          {HEURISTICS.map((h) => (
            <div key={h.name} className="glass-card" style={{ padding: '24px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 10,
              }}>
                <h4 style={{ fontSize: 14, fontWeight: 600 }}>{h.name}</h4>
                <span style={{
                  fontSize: 12, color: 'var(--accent-teal)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontWeight: 700,
                }}>
                  {h.weight}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{h.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <h2 style={{ fontSize: 28, fontWeight: 600, marginBottom: 36, textAlign: 'center' }}>
          Tech Stack
        </h2>
        <div className="glass-card-static" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 1, overflow: 'hidden',
          background: 'var(--border-glass)',
        }}>
          {TECH.map((t) => (
            <div key={t.name} style={{
              padding: '20px 24px', background: 'var(--bg-primary)',
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.role}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 900, margin: '0 auto',
        padding: '0 24px 80px', textAlign: 'center',
      }}>
        <div className="glass-card-static" style={{ padding: '48px 32px' }}>
          <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
            Ready to see it in action?
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Launch the dashboard, simulate claims, and watch Sybil detection in real-time.
          </p>
          <Link href="/dashboard" className="btn-primary" style={{ gap: 8 }}>
            Launch Dashboard <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border-glass)',
        padding: '24px', textAlign: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        Built for Somnia Network · DoraHacks 2026 · by{' '}
        <a href="https://x.com/_mprime" target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent-teal)', textDecoration: 'none' }}>_mprime</a>
      </footer>
    </main>
  );
}

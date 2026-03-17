'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Zap, Target, Unlink, Shield, ArrowRight, Github, ChevronDown } from 'lucide-react';

/* ── Data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: 'Real-time Detection',
    desc: 'Catch suspicious activity the instant it happens via Somnia Reactivity push.',
    accent: 'var(--accent-purple)',
  },
  {
    icon: <Target size={22} />,
    title: 'Risk Scoring',
    desc: 'Multi-factor heuristic analysis scoring every wallet 0-100 across wallet age, velocity, and clusters.',
    accent: 'var(--accent-pink)',
  },
  {
    icon: <Unlink size={22} />,
    title: 'Sybil Cluster Detection',
    desc: 'Identifies sequential address patterns that indicate coordinated Sybil farm operations.',
    accent: 'var(--accent-amber)',
  },
  {
    icon: <Shield size={22} />,
    title: 'On-chain Integration',
    desc: 'Smart contracts on Somnia Testnet — QuestRegistry for claims, SybilGuard for flagging.',
    accent: 'var(--accent-teal)',
  },
];

const STATS = [
  { value: '<50ms', label: 'Detection Latency' },
  { value: '4', label: 'Risk Heuristics' },
  { value: '100%', label: 'On-chain Verified' },
  { value: 'Live', label: 'Reactivity Feed' },
];

/* ── Page ──────────────────────────────────────────────────────── */
export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Mascot transforms (parallax + scale)
  const mascotY = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const mascotScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const mascotOpacity = useTransform(scrollYProgress, [0.6, 0.8], [1, 0]);

  // Narrative text transforms
  const narrativeOpacity = useTransform(scrollYProgress, [0.15, 0.25, 0.4, 0.5], [0, 1, 1, 0]);
  const narrativeY = useTransform(scrollYProgress, [0.15, 0.25], [60, 0]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {/* Grid Background */}
      <div className="grid-bg" />

      {/* Ambient Purple Glow Orbs */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'subtle-drift 22s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(217,70,239,0.08) 0%, transparent 65%)',
          borderRadius: '50%',
          animation: 'subtle-drift 28s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '30%', left: '40%',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 60%)',
          borderRadius: '50%',
          animation: 'subtle-drift 18s ease-in-out infinite',
        }} />
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '14px 24px',
        borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(6, 0, 15, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: '#fff',
              boxShadow: '0 0 20px rgba(168,85,247,0.4)',
            }}>S</div>
            <span style={{
              fontSize: 16, fontWeight: 700, letterSpacing: 2,
              background: 'linear-gradient(135deg, #fff, var(--accent-purple))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              SOMNIAGUARD
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/about" className="btn-outline btn-sm hide-mobile">
              How It Works
            </Link>
            <a
              href="https://github.com/Muheez001/somnia-guard"
              target="_blank" rel="noreferrer"
              className="btn-outline btn-sm hide-mobile"
              style={{ gap: 6 }}
            >
              <Github size={14} /> GitHub ↗
            </a>
            <Link href="/dashboard" className="btn-primary btn-sm" style={{ gap: 6 }}>
              Launch Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
           SECTION 1 — Hero with Mascot
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 60px',
        overflow: 'hidden',
      }}>
        {/* Mascot */}
        <motion.div
          style={{
            y: mascotY,
            scale: mascotScale,
            opacity: mascotOpacity,
            animation: 'mascot-float 6s ease-in-out infinite, neon-pulse 4s ease-in-out infinite',
            marginBottom: 32,
          }}
        >
          <Image
            src="/mascot.png"
            alt="SomniaGuard Mascot"
            width={280}
            height={280}
            priority
            style={{
              filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.5))',
              objectFit: 'contain',
            }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 100,
            border: '1px solid var(--border-glass)',
            background: 'rgba(168,85,247,0.08)',
            fontSize: 13, color: 'var(--accent-purple)',
            marginBottom: 24,
            letterSpacing: 1,
          }}>
            <span className="status-dot status-dot-safe" style={{ width: 6, height: 6 }} />
            Powered by Somnia Reactivity
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            marginBottom: 20,
            background: 'linear-gradient(180deg, #ffffff 20%, var(--accent-purple) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Guarding Web3<br />From the Shadows
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontSize: 'clamp(15px, 1.8vw, 18px)',
            color: 'var(--text-secondary)',
            maxWidth: 520, lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          Real-time bot &amp; Sybil detection for Somnia Network quest rewards.
          Detect suspicious wallet behavior before damage is done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <Link href="/dashboard" className="btn-primary" style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            color: '#fff',
            boxShadow: '0 4px 30px rgba(168,85,247,0.4)',
            gap: 8,
          }}>
            Launch Dashboard <ArrowRight size={18} />
          </Link>
          <a
            href="https://shannon-explorer.somnia.network/address/0x1B512eAB79ab56841De99884498A320cab61b1E6"
            target="_blank" rel="noreferrer"
            className="btn-outline"
            style={{ borderColor: 'rgba(168,85,247,0.3)', gap: 8 }}
          >
            View Contracts ↗
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            position: 'absolute', bottom: 40,
            fontSize: 12, color: 'var(--text-muted)',
            letterSpacing: 3, textTransform: 'uppercase',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>scroll to explore</span>
          <ChevronDown size={14} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           SECTION 2 — Narrative ("Two Worlds")
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 24px',
      }}>
        <motion.div
          style={{
            opacity: narrativeOpacity,
            y: narrativeY,
            maxWidth: 700,
            textAlign: 'center',
          }}
        >
          <p style={{
            fontSize: 'clamp(20px, 3vw, 32px)',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
          }}>
            Web3 rewards are under siege.{' '}
            <span style={{ color: '#fff', fontWeight: 600 }}>Bot farms</span> and{' '}
            <span style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>Sybil attackers</span>{' '}
            drain quest incentives meant for real users.
          </p>
          <p style={{
            fontSize: 'clamp(18px, 2.5vw, 26px)',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            marginTop: 24,
          }}>
            SomniaGuard watches every claim in real-time,
            <br />scoring risk and flagging threats{' '}
            <span style={{ color: 'var(--accent-pink)', fontWeight: 600 }}>before damage is done.</span>
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           SECTION 3 — Stats Row
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 850, margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 1,
            borderRadius: 16,
            overflow: 'hidden',
            border: '1px solid var(--border-glass)',
            background: 'var(--border-glass)',
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{
              padding: '28px 16px',
              background: 'var(--bg-primary)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 26, fontWeight: 700,
                color: 'var(--accent-purple)',
                fontFamily: 'var(--font-geist-mono), monospace',
                marginBottom: 6,
                textShadow: '0 0 20px rgba(168,85,247,0.4)',
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: 0.5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           SECTION 4 — Feature Cards
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px 100px',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <h2 style={{
            fontSize: 'clamp(26px, 3.5vw, 40px)',
            fontWeight: 700, marginBottom: 12,
            background: 'linear-gradient(135deg, #fff, var(--accent-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Four Layers of Defense
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            From event streaming to cluster analysis — protection at every level.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-60px' }}
              className="glass-card"
              style={{ padding: '28px 24px' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${f.accent}12`,
                border: `1px solid ${f.accent}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
                boxShadow: `0 0 20px ${f.accent}15`,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>
                {f.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
           SECTION 5 — Contracts + CTA
         ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        padding: '0 24px 80px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="glass-card-static"
          style={{
            padding: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 24,
            borderColor: 'rgba(168,85,247,0.2)',
            background: 'rgba(168,85,247,0.04)',
          }}
        >
          <div>
            <div style={{
              fontSize: 11, color: 'var(--accent-purple)',
              letterSpacing: 3, marginBottom: 12, fontWeight: 600,
            }}>
              DEPLOYED CONTRACTS · SOMNIA TESTNET
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a
                href="https://shannon-explorer.somnia.network/address/0x1B512eAB79ab56841De99884498A320cab61b1E6"
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 13, color: 'var(--accent-pink)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textDecoration: 'none',
                }}
              >
                QuestRegistry: 0x1B51...1E6 ↗
              </a>
              <a
                href="https://shannon-explorer.somnia.network/address/0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986"
                target="_blank" rel="noreferrer"
                style={{
                  fontSize: 13, color: 'var(--accent-pink)',
                  fontFamily: 'var(--font-geist-mono), monospace',
                  textDecoration: 'none',
                }}
              >
                SybilGuard: 0x93dF...986 ↗
              </a>
            </div>
          </div>
          <Link href="/dashboard" className="btn-primary" style={{
            background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-pink))',
            color: '#fff',
            boxShadow: '0 4px 30px rgba(168,85,247,0.3)',
            gap: 8,
          }}>
            Launch Dashboard <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid var(--border-glass)',
        padding: '28px',
        textAlign: 'center',
        fontSize: 13, color: 'var(--text-muted)',
      }}>
        Built for Somnia Network · DoraHacks 2026 · by{' '}
        <a href="https://x.com/_mprime" target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent-purple)', textDecoration: 'none' }}>
          _mprime
        </a>
      </footer>
    </div>
  );
}

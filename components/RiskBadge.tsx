import { RiskLevel } from '@/lib/types';

const config = {
  SAFE: {
    label: 'SAFE',
    color: '#00ff9d',
    bg: 'rgba(0,255,157,0.1)',
    border: 'rgba(0,255,157,0.3)',
    dot: '#00ff9d',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    dot: '#f59e0b',
  },
  FLAGGED: {
    label: 'FLAGGED',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.3)',
    dot: '#ef4444',
  },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const c = config[level];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding: '3px 10px',
      borderRadius: 4,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.color,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: 2,
      fontFamily: 'monospace',
    }}>
      <span style={{
        width: 6, height: 6,
        borderRadius: '50%',
        background: c.dot,
        boxShadow: `0 0 6px ${c.dot}`,
        animation: level === 'FLAGGED' ? 'pulse 1s infinite' : 'none',
      }} />
      {c.label}
    </span>
  );
}

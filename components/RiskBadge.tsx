import { RiskLevel } from '@/lib/types';

const config = {
  SAFE: {
    label: 'SAFE',
    color: 'var(--accent-teal)',
    bg: 'rgba(0, 229, 160, 0.08)',
    border: 'rgba(0, 229, 160, 0.2)',
  },
  SUSPICIOUS: {
    label: 'SUSPICIOUS',
    color: 'var(--accent-amber)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  FLAGGED: {
    label: 'FLAGGED',
    color: 'var(--accent-red)',
    bg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.2)',
  },
};

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const c = config[level];
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 12px',
      borderRadius: 8,
      border: `1px solid ${c.border}`,
      background: c.bg,
      color: c.color,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.5,
    }}>
      <span className={`status-dot ${
        level === 'SAFE' ? 'status-dot-safe' :
        level === 'SUSPICIOUS' ? 'status-dot-warn' : 'status-dot-danger'
      }`} style={{ width: 6, height: 6 }} />
      {c.label}
    </span>
  );
}

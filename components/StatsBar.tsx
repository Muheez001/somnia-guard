import { Stats } from '@/lib/types';

export default function StatsBar({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'TOTAL', value: stats.total, color: 'var(--text-primary)', glow: '' },
    { label: 'SAFE', value: stats.safe, color: 'var(--accent-teal)', glow: 'glow-teal' },
    { label: 'SUSPICIOUS', value: stats.suspicious, color: 'var(--accent-amber)', glow: '' },
    { label: 'FLAGGED', value: stats.flagged, color: 'var(--accent-red)', glow: stats.flagged > 0 ? 'glow-red' : '' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 20,
    }} className="stats-grid">
      {cards.map((card) => (
        <div key={card.label} className={`glass-card-static ${card.glow}`} style={{
          padding: '20px',
        }}>
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: 2,
            marginBottom: 10,
          }}>
            {card.label}
          </div>
          <div style={{
            fontSize: 32,
            fontWeight: 700,
            color: card.color,
            fontFamily: 'var(--font-geist-mono), monospace',
            lineHeight: 1,
          }}>
            {card.value}
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}

import { Stats } from '@/lib/types';

export default function StatsBar({ stats }: { stats: Stats }) {
  const cards = [
    { label: 'TOTAL', value: stats.total, color: '#c8d6e5' },
    { label: 'SAFE', value: stats.safe, color: '#00ff9d' },
    { label: 'SUSPICIOUS', value: stats.suspicious, color: '#f59e0b' },
    { label: 'FLAGGED', value: stats.flagged, color: '#ef4444' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 24,
    }}>
      {cards.map((card) => (
        <div key={card.label} style={{
          padding: '16px 20px',
          border: `1px solid ${card.color}22`,
          borderRadius: 8,
          background: `${card.color}08`,
        }}>
          <div style={{
            fontSize: 10,
            color: '#4a6080',
            letterSpacing: 2,
            marginBottom: 8,
          }}>
            {card.label}
          </div>
          <div style={{
            fontSize: 28,
            fontWeight: 700,
            color: card.color,
            fontFamily: 'monospace',
          }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';

interface DataPoint {
  time: number;
  count: number;
  label: string;
}

interface ActivityChartProps {
  totalClaims: number;
}

export default function ActivityChart({ totalClaims }: ActivityChartProps) {
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const prevCountRef = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const newCount = totalClaims - prevCountRef.current;
    prevCountRef.current = totalClaims;

    setDataPoints((prev) => {
      const next = [
        ...prev,
        {
          time: now,
          count: newCount > 0 ? newCount : 0,
          label: new Date(now).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
        },
      ];
      // Keep last 20 data points
      return next.slice(-20);
    });
  }, [totalClaims]);

  // Auto-tick every 5s even without new claims
  useEffect(() => {
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const now = Date.now();
        const next = [
          ...prev,
          {
            time: now,
            count: 0,
            label: new Date(now).toLocaleTimeString([], { minute: '2-digit', second: '2-digit' }),
          },
        ];
        return next.slice(-20);
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxCount = Math.max(...dataPoints.map((d) => d.count), 1);
  const chartW = 100; // percentage
  const chartH = 80;

  return (
    <div className="glass-card-static" style={{ padding: '16px 20px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)' }}>
          ACTIVITY
        </span>
        <span style={{
          fontSize: 12, color: 'var(--accent-teal)',
          fontFamily: 'var(--font-geist-mono), monospace',
        }}>
          {totalClaims} total
        </span>
      </div>

      <div style={{ height: chartH, position: 'relative' }}>
        {dataPoints.length < 2 ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: 12,
          }}>
            Collecting data...
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${dataPoints.length * 20} ${chartH}`}
            preserveAspectRatio="none"
            style={{ width: '100%', height: '100%' }}
          >
            {/* Gradient fill */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-teal)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-teal)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area fill */}
            <path
              d={(() => {
                const points = dataPoints.map((d, i) => {
                  const x = i * 20;
                  const y = chartH - (d.count / maxCount) * (chartH - 8);
                  return `${x},${y}`;
                });
                const lastX = (dataPoints.length - 1) * 20;
                return `M0,${chartH} L${points.join(' L')} L${lastX},${chartH} Z`;
              })()}
              fill="url(#chartGrad)"
            />

            {/* Line */}
            <polyline
              points={dataPoints.map((d, i) => {
                const x = i * 20;
                const y = chartH - (d.count / maxCount) * (chartH - 8);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="var(--accent-teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {dataPoints.map((d, i) => {
              if (d.count === 0) return null;
              const x = i * 20;
              const y = chartH - (d.count / maxCount) * (chartH - 8);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="var(--accent-teal)"
                  style={{ filter: 'drop-shadow(0 0 4px rgba(0,229,160,0.5))' }}
                >
                  <animate
                    attributeName="r"
                    from="0"
                    to="3"
                    dur="0.3s"
                    fill="freeze"
                  />
                </circle>
              );
            })}
          </svg>
        )}

        {/* Zero line */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 1, background: 'var(--border-glass)',
        }} />
      </div>

      {/* Time labels */}
      {dataPoints.length >= 2 && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: 6, fontSize: 9, color: 'var(--text-muted)',
          fontFamily: 'var(--font-geist-mono), monospace',
        }}>
          <span>{dataPoints[0]?.label}</span>
          <span>{dataPoints[dataPoints.length - 1]?.label}</span>
        </div>
      )}
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { WalletProfile } from '@/lib/types';

interface ClusterGraphProps {
  profiles: WalletProfile[];
}

interface Node {
  id: string;
  short: string;
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'FLAGGED';
  riskScore: number;
  claims: number;
  x: number;
  y: number;
}

interface Edge {
  from: string;
  to: string;
}

const COLORS = {
  SAFE: '#00e5a0',
  SUSPICIOUS: '#f59e0b',
  FLAGGED: '#ef4444',
};

export default function ClusterGraph({ profiles }: ClusterGraphProps) {
  const { nodes, edges } = useMemo(() => {
    if (profiles.length === 0) return { nodes: [], edges: [] };

    const W = 360;
    const H = 220;
    const CX = W / 2;
    const CY = H / 2;

    // Position nodes in a circular layout
    const nodeList: Node[] = profiles.slice(0, 20).map((p, i) => {
      const angle = (2 * Math.PI * i) / Math.min(profiles.length, 20);
      const radius = Math.min(W, H) * 0.35;
      // Jitter for organic feel
      const jx = (Math.sin(i * 7.3) * 15);
      const jy = (Math.cos(i * 5.7) * 12);

      return {
        id: p.address,
        short: `${p.address.slice(0, 6)}...${p.address.slice(-4)}`,
        riskLevel: p.riskLevel,
        riskScore: p.riskScore,
        claims: p.claims.length,
        x: CX + Math.cos(angle) * radius + jx,
        y: CY + Math.sin(angle) * radius + jy,
      };
    });

    // Find cluster edges — wallets with similar address suffixes
    const edgeList: Edge[] = [];
    for (let i = 0; i < nodeList.length; i++) {
      for (let j = i + 1; j < nodeList.length; j++) {
        const suffA = parseInt(nodeList[i].id.toLowerCase().slice(-4), 16);
        const suffB = parseInt(nodeList[j].id.toLowerCase().slice(-4), 16);
        if (Math.abs(suffA - suffB) <= 5) {
          edgeList.push({ from: nodeList[i].id, to: nodeList[j].id });
        }
      }
    }

    return { nodes: nodeList, edges: edgeList };
  }, [profiles]);

  if (profiles.length === 0) {
    return (
      <div className="glass-card-static" style={{ padding: '16px 20px' }}>
        <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)' }}>
          CLUSTER MAP
        </span>
        <div style={{
          height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-muted)', fontSize: 12,
        }}>
          Waiting for wallet data...
        </div>
      </div>
    );
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="glass-card-static" style={{ padding: '16px 20px', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 8,
      }}>
        <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)' }}>
          CLUSTER MAP
        </span>
        {edges.length > 0 && (
          <span style={{
            fontSize: 10, padding: '2px 8px', borderRadius: 4,
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--accent-red)',
          }}>
            {edges.length} connection{edges.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <svg viewBox="0 0 360 220" style={{ width: '100%', height: 'auto' }}>
        {/* Edges */}
        {edges.map((e, i) => {
          const from = nodeMap.get(e.from);
          const to = nodeMap.get(e.to);
          if (!from || !to) return null;
          return (
            <line
              key={`e-${i}`}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="rgba(239, 68, 68, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="8" to="0"
                dur="1s"
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {/* Nodes */}
        {nodes.map((n) => {
          const color = COLORS[n.riskLevel];
          const r = 8 + Math.min(n.claims, 5) * 2;
          return (
            <g key={n.id}>
              {/* Glow */}
              <circle
                cx={n.x} cy={n.y} r={r + 6}
                fill={color}
                opacity={0.08}
              />
              {/* Node */}
              <circle
                cx={n.x} cy={n.y} r={r}
                fill={`${color}18`}
                stroke={color}
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  from="0" to={String(r)}
                  dur="0.5s"
                  fill="freeze"
                />
              </circle>
              {/* Score label */}
              <text
                x={n.x} y={n.y + 3.5}
                textAnchor="middle"
                fill={color}
                fontSize="8"
                fontWeight="700"
                fontFamily="monospace"
              >
                {n.riskScore}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 14, justifyContent: 'center',
        marginTop: 8,
      }}>
        {['SAFE', 'SUSPICIOUS', 'FLAGGED'].map((level) => (
          <div key={level} style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 10,
            color: 'var(--text-muted)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: COLORS[level as keyof typeof COLORS],
            }} />
            {level}
          </div>
        ))}
      </div>
    </div>
  );
}

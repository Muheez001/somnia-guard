import { useState } from 'react';
import { Zap, Network } from 'lucide-react';

const RANDOM_ADDRESSES = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
  '0x53d284357ec70cE289D6D64134DfAc8E511c8a3C',
  '0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98',
  '0x1B3cB81E51011b549d78bf720b0d924ac763A7C2',
  '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  '0xBE0EB53F46CD790Cd13851d5EFF43D12404d33E8',
  '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf',
  // Sybil cluster addresses
  '0x000000000000000000000000000000000000fA01',
  '0x000000000000000000000000000000000000fA02',
  '0x000000000000000000000000000000000000fA03',
];

interface ClaimSimulatorProps {
  onSimulateEvent: (event: {
    participant: string;
    questId: number;
    timestamp: number;
    blockNumber: number;
  }) => void;
}

export default function ClaimSimulator({ onSimulateEvent }: ClaimSimulatorProps) {
  const [questId, setQuestId] = useState(1);
  const [isBursting, setIsBursting] = useState(false);

  function randomAddr() {
    return RANDOM_ADDRESSES[Math.floor(Math.random() * RANDOM_ADDRESSES.length)];
  }

  function simulateSingle(address?: string) {
    onSimulateEvent({
      participant: address || randomAddr(),
      questId,
      timestamp: Math.floor(Date.now() / 1000),
      blockNumber: 1_000_000 + Math.floor(Math.random() * 50_000),
    });
  }

  async function simulateBurst() {
    setIsBursting(true);
    const addr = randomAddr();
    for (let i = 0; i < 5; i++) {
      simulateSingle(addr);
      await new Promise((r) => setTimeout(r, 200));
    }
    setIsBursting(false);
  }

  function simulateSybilCluster() {
    // Send claims from all 3 similar-suffix addresses
    const sybilAddrs = RANDOM_ADDRESSES.slice(-3);
    sybilAddrs.forEach((addr, i) => {
      setTimeout(() => simulateSingle(addr), i * 300);
    });
  }

  return (
    <div className="glass-card-static" style={{ padding: '20px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
      }}>
        <span style={{
          fontSize: 10, letterSpacing: 2, color: 'var(--text-muted)',
          textTransform: 'uppercase',
        }}>
          Test Panel
        </span>
        <span style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 4,
          background: 'rgba(168, 85, 247, 0.12)',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          color: 'var(--accent-purple)',
        }}>
          DEV
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quest:</label>
        <select
          value={questId}
          onChange={(e) => setQuestId(Number(e.target.value))}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)',
            borderRadius: 8, padding: '6px 10px', color: 'var(--text-primary)',
            fontSize: 12, outline: 'none', cursor: 'pointer',
          }}
        >
          {[1, 2, 3, 4, 5].map((id) => (
            <option key={id} value={id} style={{ background: '#1a1a2e' }}>
              Quest #{id}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => simulateSingle()}
          className="btn-outline btn-sm"
          style={{ justifyContent: 'center', width: '100%' }}
        >
          + Single Claim
        </button>
        <button
          onClick={simulateBurst}
          disabled={isBursting}
          className="btn-primary btn-sm btn-danger"
          style={{
            justifyContent: 'center', width: '100%',
            opacity: isBursting ? 0.6 : 1,
            gap: 8,
          }}
        >
          <Zap size={14} /> {isBursting ? 'Bursting...' : 'Burst (5 rapid claims)'}
        </button>
        <button
          onClick={simulateSybilCluster}
          className="btn-outline btn-sm"
          style={{
            justifyContent: 'center', width: '100%',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            color: 'var(--accent-amber)',
            gap: 8,
          }}
        >
          <Network size={14} /> Sybil Cluster (3 similar wallets)
        </button>
      </div>
    </div>
  );
}

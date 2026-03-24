'use client';

import { useEffect, useState, useRef } from 'react';
import { Activity, Database, Zap, Cpu, History, AlertCircle, RefreshCw, Pause, Play, ChevronUp } from 'lucide-react';

interface Block {
  number: number;
  hash: string;
  timestamp: number;
  transactionsCount: number;
  gasUsed: number;
  miner: string;
}

export default function LiveExplorer() {
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Buffer to store incoming blocks from WebSocket
  const blockBuffer = useRef<Block[]>([]);
  const lastProcessedBlock = useRef<number>(0);

  useEffect(() => {
    setError(null);
    const eventSource = new EventSource('/api/network-activity');

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === 'ping') return;
        if (data.type === 'error') {
          setError(data.message);
          return;
        }

        if (data.type === 'block') {
          // Add to buffer if it's a new block
          if (data.number > lastProcessedBlock.current) {
            blockBuffer.current.push(data);
            setPendingCount(blockBuffer.current.length);
          }
        }
      } catch (err) {
        console.error('Failed to parse block data:', err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      setError('WebSocket connection dropped. Retrying...');
    };

    return () => {
      eventSource.close();
    };
  }, [retryCount]);

  // UI Update Loop: Every 3 seconds, move one block from buffer to visible state
  // This prevents the "absurd speed" and letting the user actually read the data.
  useEffect(() => {
    const timer = setInterval(() => {
      if (isPaused || blockBuffer.current.length === 0) return;

      const nextBlock = blockBuffer.current.shift();
      if (nextBlock) {
        lastProcessedBlock.current = nextBlock.number;
        setVisibleBlocks((prev) => [nextBlock, ...prev].slice(0, 30));
        setPendingCount(blockBuffer.current.length);
      }
    }, 3000); // 3-second stable interval

    return () => clearInterval(timer);
  }, [isPaused]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setVisibleBlocks([]);
    blockBuffer.current = [];
  };

  return (
    <div className="glass-card-static" style={{ height: '600px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(8, 9, 13, 0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-teal)'
          }}>
            <Database size={16} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: 0.5 }}>
              NETWORK EXPLORER
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: 1 }}>
              SOMNIA TESTNET
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {pendingCount > 0 && !isPaused && (
            <div style={{ fontSize: 11, color: 'var(--accent-teal)', fontWeight: 600 }} className="animate-pulse">
              {pendingCount} new block{pendingCount !== 1 ? 's' : ''} queued...
            </div>
          )}
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-glass)',
              borderRadius: 6,
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: 'var(--text-primary)',
              transition: 'all 0.2s'
            }}
          >
            {isPaused ? <Play size={12} fill="currentColor" /> : <Pause size={12} fill="currentColor" />}
            {isPaused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Main Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(0,0,0,0.2)'
      }}>
        {error && (
          <div style={{ padding: 16, borderRadius: 10, background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)', fontSize: 13, display: 'flex', gap: 10 }}>
            <AlertCircle size={18} />
            <div>
              {error}
              <button onClick={handleRetry} style={{ display: 'block', marginTop: 8, background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 11 }}>
                Try reconnecting
              </button>
            </div>
          </div>
        )}

        {visibleBlocks.length === 0 && !error ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ opacity: 0.3 }} />
            <div style={{ fontSize: 13 }}>Syncing with Somnia WebSocket...</div>
          </div>
        ) : (
          visibleBlocks.map((block, index) => (
            <div key={`${block.hash}-${block.number}`} style={{
              padding: '14px 18px',
              borderRadius: 8,
              background: index === 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-glass)',
              display: 'grid',
              gridTemplateColumns: '100px 1fr 100px',
              gap: 16,
              alignItems: 'center',
              animation: index === 0 ? 'slide-down 0.4s ease-out' : 'none',
              transition: 'all 0.3s ease'
            }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>BLOCK</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-teal)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                  #{block.number}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>HASH / DATA</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-geist-mono), monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {block.hash.slice(0, 24)}...
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                   <span style={{ fontSize: 10, color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Activity size={10} /> {block.transactionsCount} txs
                   </span>
                   <span style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <History size={10} /> {(block.gasUsed / 1e6).toFixed(2)}M gas
                   </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>PROCESSED</div>
                <div style={{ fontSize: 11, color: 'var(--text-primary)' }}>
                   Live
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: '10px 24px',
        borderTop: '1px solid var(--border-glass)',
        background: 'rgba(8, 9, 13, 0.6)',
        fontSize: 10,
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className={`status-dot ${connected ? 'status-dot-safe' : 'status-dot-danger'}`} style={{ width: 6, height: 6 }} />
          CONNECTED TO SHANNON TESTNET
        </div>
        <span>STABLE REFRESH: 3.0s</span>
      </div>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

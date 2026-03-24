import { NextRequest } from 'next/server';
import { createPublicClient, webSocket, defineChain, formatEther } from 'viem';

const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.infra.testnet.somnia.network'],
      webSocket: ['wss://api.infra.testnet.somnia.network/ws'],
    },
  },
});

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
export const dynamic = 'force-dynamic';

// ── Demo simulation ──────────────────────────────────────────────────
function randomTransfer() {
  const wallets = [
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
    '0x53d284357ec70cE289D6D64134DfAc8E511c8a3C',
    '0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98',
    // Example Sybil cluster
    '0x000000000000000000000000000000000000bA01',
    '0x000000000000000000000000000000000000bA02',
    '0x000000000000000000000000000000000000bA03',
  ];
  return {
    participant: wallets[Math.floor(Math.random() * wallets.length)],
    amount: '0.1',
    from: '0x1234Fauc3t456789012345678901234567890123', // Common sender
    timestamp: Math.floor(Date.now() / 1000),
    blockNumber: 1_200_000,
  };
}

// ── SSE Route ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      if (DEMO_MODE) {
        const interval = setInterval(() => {
          try {
            const event = randomTransfer();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch { clearInterval(interval); }
        }, 4000);
        req.signal.addEventListener('abort', () => clearInterval(interval));
        return;
      }

      // ── Live STT Transfer Monitor ────────────────────────────────
      try {
        const publicClient = createPublicClient({
          chain: somniaTestnet,
          transport: webSocket(),
        });

        const unwatch = publicClient.watchBlocks({
          includeTransactions: true,
          onBlock: (block) => {
            block.transactions.forEach((tx: any) => {
              // We only care about base STT transfers (value > 0)
              if (tx.value > BigInt(0)) {
                const event = {
                  participant: tx.to,      // Recipient
                  fromAddress: tx.from,    // Sender (Funding source)
                  amount: formatEther(tx.value),
                  timestamp: Number(block.timestamp),
                  blockNumber: Number(block.number),
                  hash: tx.hash
                };

                console.log('[NativeTransfer] Detected:', event.participant, 'from:', event.fromAddress);
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
              }
            });
          },
          onError: (err) => console.error('Transfer Watch Error:', err)
        });

        req.signal.addEventListener('abort', unwatch);
      } catch (err) {
        console.error('SSE Stream error:', err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
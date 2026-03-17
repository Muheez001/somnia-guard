/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPublicClient, webSocket, defineChain, keccak256, toBytes } from 'viem';
import { SDK } from '@somnia-chain/reactivity';

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
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
});

// Define the correct event signature for QuestClaimed

const QUEST_CLAIMED_TOPIC = keccak256(
  toBytes('QuestClaimed(address,uint256,uint256)')
);

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const dynamic = 'force-dynamic';

// ── Demo simulation helpers ─────────────────────────────────────────
const DEMO_WALLETS = [
  '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28',
  '0x53d284357ec70cE289D6D64134DfAc8E511c8a3C',
  '0xFBb1b73C4f0BDa4f67dcA266ce6Ef42f520fBB98',
  '0x1B3cB81E51011b549d78bf720b0d924ac763A7C2',
  '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
  '0xBE0EB53F46CD790Cd13851d5EFF43D12404d33E8',
  '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf',
  // Sybil cluster — addresses with similar suffixes for heuristic testing
  '0x000000000000000000000000000000000000fA01',
  '0x000000000000000000000000000000000000fA02',
  '0x000000000000000000000000000000000000fA03',
];

function randomDemoEvent() {
  const wallet = DEMO_WALLETS[Math.floor(Math.random() * DEMO_WALLETS.length)];
  return {
    participant: wallet,
    questId: Math.floor(Math.random() * 5) + 1,
    timestamp: Math.floor(Date.now() / 1000),
    blockNumber: 1_000_000 + Math.floor(Math.random() * 50_000),
  };
}

// ── SSE Route ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Keep-alive ping every 20 s
      const keepAlive = setInterval(() => {
        try { controller.enqueue(encoder.encode(': ping\n\n')); } catch { /* stream closed */ }
      }, 20_000);

      const cleanup = () => {
        clearInterval(keepAlive);
      };

      req.signal.addEventListener('abort', () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });

      // ── Demo / simulation mode ──────────────────────────────────
      if (DEMO_MODE) {
        console.log('[SomniaGuard] Demo mode active — generating simulated events');
        const demoInterval = setInterval(() => {
          try {
            const event = randomDemoEvent();
            console.log('[DEMO] Sending simulated event:', event);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          } catch {
            clearInterval(demoInterval);
          }
        }, 3_000 + Math.random() * 4_000); // every 3-7 seconds

        req.signal.addEventListener('abort', () => clearInterval(demoInterval));
        return;
      }

      // ── Live Reactivity subscription ────────────────────────────
      try {
        const publicClient = createPublicClient({
          chain: somniaTestnet,
          transport: webSocket(), // SDK requires webSocket, NOT http
        });

        const sdk = new SDK({ public: publicClient });

        const result: any = await sdk.subscribe({
          ethCalls: [],
          eventContractSources: [
            process.env.NEXT_PUBLIC_QUEST_REGISTRY as `0x${string}`,
          ],
          topicOverrides: [QUEST_CLAIMED_TOPIC],
          onData: (data: any) => {
            try {
              console.log('=== SERVER EVENT ===', JSON.stringify(data));

              const topics = data?.result?.topics;
              if (!topics || topics.length < 2) return;

              const participant = '0x' + topics[1].slice(-40);
              const questId = topics[2] ? parseInt(topics[2], 16) : 0;
              const blockNumber = data?.result?.blockNumber ?? 0;

              const event = {
                participant,
                questId,
                timestamp: Math.floor(Date.now() / 1000),
                blockNumber,
              }; 

              console.log('Sending event to client:', event);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            } catch (err) {
              console.error('Parse error:', err);
            }
          },
          onError: (err: any) => {
            console.error('SDK error:', err);
          },
          onlyPushChanges: false,
        });

        // SDK returns Error object on failure instead of throwing
        if (result instanceof Error) {
          console.error('SDK subscribe failed:', result.message);
          const errorMsg = `data: ${JSON.stringify({ error: result.message })}\n\n`;
          controller.enqueue(encoder.encode(errorMsg));
          return;
        }

        console.log('Server subscribed to QuestClaimed events');

        req.signal.addEventListener('abort', () => {
          if (result && typeof result.unsubscribe === 'function') {
            result.unsubscribe();
          }
        });
      } catch (err) {
        console.error('Stream setup error:', err);
        const errorMsg = `data: ${JSON.stringify({ error: String(err) })}\n\n`;
        try { controller.enqueue(encoder.encode(errorMsg)); } catch { /* stream closed */ }
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
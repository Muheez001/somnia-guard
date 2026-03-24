import { NextRequest } from 'next/server';
import { createPublicClient, webSocket, http, defineChain } from 'viem';

const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_SOMNIA_RPC || 'https://api.infra.testnet.somnia.network'],
      webSocket: [process.env.NEXT_PUBLIC_SOMNIA_WS || 'wss://api.infra.testnet.somnia.network/ws'],
    },
  },
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const wsUrl = process.env.NEXT_PUBLIC_SOMNIA_WS || 'wss://api.infra.testnet.somnia.network/ws';
      
      const publicClient = createPublicClient({
        chain: somniaTestnet,
        transport: webSocket(wsUrl, {
          retryCount: 3,
          timeout: 20_000,
        }),
      });

      console.log('[NetworkActivity] Starting live block listener with WS:', wsUrl);

      const sendEvent = (data: any) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          // Stream might be closed
        }
      };

      // Keep-alive
      const keepAlive = setInterval(() => sendEvent({ type: 'ping' }), 15000);

      const unwatch = publicClient.watchBlocks({
        onBlock: (block) => {
          sendEvent({
            type: 'block',
            number: Number(block.number),
            hash: block.hash,
            timestamp: Number(block.timestamp),
            transactionsCount: block.transactions.length,
            gasUsed: Number(block.gasUsed),
            miner: block.miner,
          });
        },
        onError: (err) => {
          const errMsg = err instanceof Error ? err.message : (err as any)?.message || 'WebSocket Error';
          console.error('[NetworkActivity] Watch error:', errMsg);
          sendEvent({ type: 'error', message: errMsg });
        }
      });

      req.signal.addEventListener('abort', () => {
        console.log('[NetworkActivity] Client disconnected');
        clearInterval(keepAlive);
        unwatch();
        try { controller.close(); } catch { /* ignore */ }
      });
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

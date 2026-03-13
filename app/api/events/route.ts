/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { createPublicClient, http, defineChain } from 'viem';
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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const publicClient = createPublicClient({
          chain: somniaTestnet,
          transport: http(),
        });

        const sdk = new SDK({ public: publicClient });

        const sub: any = await sdk.subscribe({
          ethCalls: [],
          eventContractSources: [
            process.env.NEXT_PUBLIC_QUEST_REGISTRY as `0x${string}`,
          ],
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
              const message = `data: ${JSON.stringify(event)}\n\n`;
              controller.enqueue(encoder.encode(message));
            } catch (err) {
              console.error('Parse error:', err);
            }
          },
          onError: (err: any) => {
            console.error('SDK error:', err);
          },
          onlyPushChanges: false,
        });

        console.log('Server subscribed to QuestClaimed events');

        const keepAlive = setInterval(() => {
          controller.enqueue(encoder.encode(': ping\n\n'));
        }, 20000);

        req.signal.addEventListener('abort', () => {
          clearInterval(keepAlive);
          if (sub && typeof sub.unsubscribe === 'function') {
            sub.unsubscribe();
          }
          controller.close();
        });

      } catch (err) {
        console.error('Stream setup error:', err);
        controller.error(err);
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

import { createPublicClient, http, defineChain, formatEther } from 'viem';

const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://api.infra.testnet.somnia.network'],
    },
  },
});

// Separate HTTP client for read-only RPC calls (not WebSocket)
const rpcClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(),
});

export interface OnchainData {
  balance: string;       // formatted STT balance
  balanceRaw: bigint;
  txCount: number;       // nonce = total outgoing tx count
  isNewWallet: boolean;  // txCount < 5
  isLowBalance: boolean; // < 0.01 STT
}

const cache = new Map<string, { data: OnchainData; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute

export async function fetchOnchainData(address: string): Promise<OnchainData | null> {
  try {
    // Check cache
    const cached = cache.get(address.toLowerCase());
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const [balance, txCount] = await Promise.all([
      rpcClient.getBalance({ address: address as `0x${string}` }),
      rpcClient.getTransactionCount({ address: address as `0x${string}` }),
    ]);

    const data: OnchainData = {
      balance: formatEther(balance),
      balanceRaw: balance,
      txCount,
      isNewWallet: txCount < 5,
      isLowBalance: balance < BigInt(10_000_000_000_000_000), // < 0.01 STT
    };

    // Cache result
    cache.set(address.toLowerCase(), { data, timestamp: Date.now() });

    return data;
  } catch (err) {
    console.error('RPC fetch failed for', address, err);
    return null;
  }
}

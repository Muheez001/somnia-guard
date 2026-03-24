import {
  createPublicClient,
  webSocket,
  defineChain,
  keccak256,
  toBytes,
} from "viem";
import { SDK, SubscriptionCallback } from "@somnia-chain/reactivity";

export const somniaTestnet = defineChain({
  id: 50312,
  name: "Somnia Testnet",
  nativeCurrency: { name: "STT", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://api.infra.testnet.somnia.network"],
      webSocket: ["wss://api.infra.testnet.somnia.network/ws"],
    },
  },
  blockExplorers: {
    default: {
      name: "Somnia Explorer",
      url: "https://shannon-explorer.somnia.network",
    },
  },
});

export const QUEST_REGISTRY = process.env
  .NEXT_PUBLIC_QUEST_REGISTRY as `0x${string}`;
export const SYBIL_GUARD = process.env.NEXT_PUBLIC_SYBIL_GUARD as `0x${string}`;

// Correct keccak256 of event signature
export const QUEST_CLAIMED_TOPIC = keccak256(
  toBytes("QuestClaimed(address,uint256,uint256)"),
);

export interface ReactivityEvent {
  participant: string;
  questId: number;
  timestamp: number;
  blockNumber: number;
}

let sdkInstance: InstanceType<typeof SDK> | null = null;

function getSDK() {
  if (!sdkInstance) {
    // SDK requires webSocket transport — http() silently fails
    const publicClient = createPublicClient({
      chain: somniaTestnet,
      transport: webSocket(),
    });
    sdkInstance = new SDK({ public: publicClient });
  }
  return sdkInstance;
}

export async function subscribeToQuestEvents(
  onEvent: (event: ReactivityEvent) => void,
  onError?: (err: Error) => void,
) {
  const sdk = getSDK();

  const result = await sdk.subscribe({
    ethCalls: [],
    eventContractSources: [QUEST_REGISTRY],
    topicOverrides: [QUEST_CLAIMED_TOPIC],
    onData: (data: SubscriptionCallback) => {
      console.log("=== RAW REACTIVITY DATA ===");
      console.log(JSON.stringify(data, null, 2));
      console.log("===========================");

      try {
        const topics = data.result?.topics;
        const rawData = data.result?.data;

        if (!topics || topics.length < 2) {
          console.warn("No topics found. Full data:", data);
          return;
        }

        const participant = ("0x" + topics[1].slice(-40)) as string;
        const questId = topics[2] ? parseInt(topics[2], 16) : 0;
        const timestamp = rawData
          ? parseInt(rawData.slice(2, 66), 16)
          : Math.floor(Date.now() / 1000);

        console.log("Parsed:", { participant, questId, timestamp });

        onEvent({
          participant,
          questId,
          timestamp: timestamp || Math.floor(Date.now() / 1000),
          blockNumber: (data.result as { blockNumber?: number })?.blockNumber ?? 0,
        });
      } catch (err) {
        console.error("Parse error:", err);
        console.error("Raw data was:", data);
      }
    },
    onError: (err: Error) => {
      console.error("Reactivity error:", err);
      onError?.(err);
    },
    onlyPushChanges: false,
  });

  // SDK returns Error object on failure instead of throwing
  if (result instanceof Error) {
    console.error("SDK subscribe failed:", result.message);
    onError?.(result);
    throw result;
  }

  console.log("Subscribed to QuestClaimed events on:", QUEST_REGISTRY);
  return result;
}

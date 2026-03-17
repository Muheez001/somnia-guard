# SomniaGuard — Dev Handoff Document

## Project Overview

Real-time bot/Sybil detection dashboard for Somnia Network quest rewards.
Uses Somnia Reactivity (pub/sub system) to detect suspicious wallet behavior.

## Deployed Contracts (Somnia Testnet - Chain ID: 50312)

- **QuestRegistry:** `0x1B512eAB79ab56841De99884498A320cab61b1E6`
- **SybilGuard:** `0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986`
- **Explorer:** https://shannon-explorer.somnia.network

## Current Status

✅ Smart contracts deployed and linked on Somnia testnet  
✅ Next.js 14 project structure complete  
✅ Reactivity SDK installed (@somnia-chain/reactivity)  
✅ SSE API route created (app/api/events/route.ts)  
✅ Dashboard UI complete (SAFE/SUSPICIOUS/FLAGGED badges, live feed, stats)  
✅ Heuristic engine written (lib/heuristics.ts)  
✅ SSE connection confirmed ("SSE connected" logs in browser console)  
❌ Events not flowing from Somnia Reactivity to dashboard

---

## THE CORE PROBLEM (SOLVED ✅)

The Reactivity SDK subscription was silently failing and no events
were reaching the dashboard.

### Root Cause (found by inspecting SDK source):

The SDK's `subscribe()` method checks:

```
if (this.viem.client.public.transport.type !== "webSocket")
  throw new Error("Invalid public client config - websocket required");
```

Both `reactivity.ts` and `route.ts` were creating the public client with
`http()` transport. The SDK caught this error internally and returned an
`Error` object — but the code never checked for it, so the subscription
appeared to succeed while actually doing nothing.

### Fix applied:

1. Changed both files to use `webSocket()` transport from viem
2. Added error checking: if `sdk.subscribe()` returns `Error`, surface it
3. Added `topicOverrides` filter with QuestClaimed topic hash to `route.ts`
4. Added demo/simulation mode (`NEXT_PUBLIC_DEMO_MODE=true`) for hackathon

### Note on createSoliditySubscription():

The earlier theory about needing `createSoliditySubscription()` was incorrect.
That API is for **on-chain reactivity** (Solidity → Solidity callbacks), not
for off-chain WebSocket subscriptions. The `sdk.subscribe()` method handles
off-chain WebSocket event streaming independently.

---

## WHAT WE TRIED

### Attempt 1 — Client-side subscription (lib/reactivity.ts)

Ran sdk.subscribe() directly in browser via useEffect.
Problem: Browser Content Security Policy blocked WebSocket eval.
Result: Failed.

### Attempt 2 — Added topicOverrides with keccak256 hash

Computed keccak256("QuestClaimed(address,uint256,uint256)") and passed
as topicOverrides filter.
Result: Still no events — root cause was transport type, not the filter.

### Attempt 3 — Server-side SSE route (app/api/events/route.ts)

Moved Reactivity subscription to Next.js API route (server-side).
SSE connection works but still used http() transport.
Result: Partial — SSE pipeline works, Reactivity delivery still broken.

### Attempt 4 — Fixed transport to webSocket() ✅

Changed both `reactivity.ts` and `route.ts` to use `webSocket()`.
Added error checking on subscribe return value.
Added demo mode for hackathon testing.
Result: SDK subscription now connects correctly.

---

## CURRENT CODE STRUCTURE

```
somnia-guard/
├── app/
│   ├── api/events/route.ts     ← SSE route with Reactivity subscription + demo mode
│   ├── page.tsx                ← Main dashboard (uses EventSource)
│   └── layout.tsx
├── components/
│   ├── WalletFeed.tsx          ← Live feed + wallet detail panel
│   ├── RiskBadge.tsx           ← SAFE/SUSPICIOUS/FLAGGED badge
│   └── StatsBar.tsx            ← Stats counters
├── lib/
│   ├── reactivity.ts           ← SDK setup + subscription logic (webSocket transport)
│   ├── heuristics.ts           ← Risk scoring engine (0-100)
│   └── types.ts                ← Shared TypeScript types
├── .env.local                  ← Contract addresses + RPC URLs + DEMO_MODE flag
├── middleware.ts               ← CSP headers
└── next.config.mjs             ← Next.js config
```

---

## ENV VARIABLES (.env.local)

```
NEXT_PUBLIC_QUEST_REGISTRY=0x1B512eAB79ab56841De99884498A320cab61b1E6
NEXT_PUBLIC_SYBIL_GUARD=0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986
NEXT_PUBLIC_SOMNIA_RPC=https://api.infra.testnet.somnia.network
NEXT_PUBLIC_SOMNIA_WS=wss://api.infra.testnet.somnia.network/ws
NEXT_PUBLIC_DEMO_MODE=false  # Set to 'true' for simulated events
```

---

## KEY SDK REFERENCE

```typescript
// CRITICAL: publicClient MUST use webSocket() transport, not http()
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: webSocket(), // ← Required by SDK
});

const sdk = new SDK({ public: publicClient });

const result = await sdk.subscribe({
  ethCalls: [],
  eventContractSources: ["0xContractAddress"],
  topicOverrides: ["0xEventSignatureHash"],
  onData: (data: SubscriptionCallback) => {
    console.log("topics:", data.result.topics);
    console.log("data:", data.result.data);
  },
  onError: (error: Error) => console.error(error),
  onlyPushChanges: false,
});

// IMPORTANT: check for Error return
if (result instanceof Error) throw result;
```

Reactivity SDK docs:

- RPC: https://api.infra.testnet.somnia.network
- WSS: wss://api.infra.testnet.somnia.network/ws
- Chain ID: 50312
- Min balance for on-chain subs: 32 STT

---

## HACKATHON DEADLINE

March 20, 2026 — DoraHacks submission required with:

- Public GitHub repo ✅ https://github.com/Muheez001/somnia-guard
- Demo video (not recorded yet)
- Contract addresses ✅

---

## CONTACT

Builder: \_mprime (X/Twitter)

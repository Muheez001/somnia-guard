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

## THE CORE PROBLEM

The Somnia Reactivity WebSocket subscription is not delivering
QuestClaimed events to our app when claimQuest() is called on-chain.

### What we know:
1. Subscription logs show "Subscribed to QuestClaimed events on: 0x1B512..."
2. SSE route connects successfully ("SSE connected" in browser console)
3. claimQuest() transactions confirm on-chain (verified in Remix terminal)
4. No "=== SERVER EVENT ===" log appears in terminal after transactions
5. Dashboard stays at 0 wallets detected

### What this means:
The Reactivity SDK is subscribing but not receiving the push notification
when QuestClaimed fires. Either:
- The subscription filter (eventContractSources / topicOverrides) is wrong
- The Reactivity node is not delivering to our WebSocket
- The QuestClaimed event topic hash we computed is incorrect
- The SDK needs a wallet client (not just public client) to activate delivery

---

## WHAT WE TRIED

### Attempt 1 — Client-side subscription (lib/reactivity.ts)
Ran sdk.subscribe() directly in browser via useEffect.
Problem: Browser Content Security Policy blocked WebSocket eval.
Result: Failed.

### Attempt 2 — Added topicOverrides with keccak256 hash
Computed keccak256("QuestClaimed(address,uint256,uint256)") and passed
as topicOverrides filter.
Result: Still no events delivered.

### Attempt 3 — Server-side SSE route (app/api/events/route.ts)
Moved Reactivity subscription to Next.js API route (server-side).
SSE connection works. "Server subscribed" logs appear in terminal.
But still no events when claimQuest() fires on-chain.
Result: Partial — SSE pipeline works, Reactivity delivery still broken.

---

## CURRENT CODE STRUCTURE

```
somnia-guard/
├── app/
│   ├── api/events/route.ts     ← SSE route with Reactivity subscription
│   ├── page.tsx                ← Main dashboard (uses EventSource)
│   └── layout.tsx
├── components/
│   ├── WalletFeed.tsx          ← Live feed + wallet detail panel
│   ├── RiskBadge.tsx           ← SAFE/SUSPICIOUS/FLAGGED badge
│   └── StatsBar.tsx            ← Stats counters
├── lib/
│   ├── reactivity.ts           ← SDK setup + subscription logic
│   ├── heuristics.ts           ← Risk scoring engine (0-100)
│   └── types.ts                ← Shared TypeScript types
├── .env.local                  ← Contract addresses + RPC URLs
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
```

---

## KEY SDK REFERENCE (from official Somnia docs)

```typescript
// Correct subscription pattern per docs
const subscription = await sdk.subscribe({
  ethCalls: [],
  eventContractSources: ['0xContractAddress'],
  topicOverrides: ['0xEventSignatureHash'],
  onData: (data: SubscriptionCallback) => {
    console.log('topics:', data.result.topics)
    console.log('data:', data.result.data)
  },
  onError: (error: Error) => console.error(error),
  onlyPushChanges: false
})
```

Reactivity SDK docs:
- RPC: https://api.infra.testnet.somnia.network
- WSS: wss://api.infra.testnet.somnia.network/ws
- Chain ID: 50312
- Min balance for on-chain subs: 32 STT

---

## SUSPECTED ROOT CAUSE
The on-chain Solidity subscription has NOT been created via
sdk.createSoliditySubscription(). Per the docs:

> "Deploying the handler alone is not enough — you must also
> create a subscription."

This may also affect off-chain WebSocket delivery. The subscription
needs to be explicitly registered with the Reactivity precompile
at 0x0000000000000000000000000000000000000100.

### Suggested fix to try:
Create a one-time script that calls sdk.createSoliditySubscription()
with the SybilGuard handler address and correct gas params:

```typescript
await sdk.createSoliditySubscription({
  handlerContractAddress: '0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986',
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10'),
  gasLimit: 2_000_000n,
  isGuaranteed: true,
  isCoalesced: false,
});
```

This requires a funded wallet private key to sign the subscription tx.

---

## HACKATHON DEADLINE
March 20, 2026 — DoraHacks submission required with:
- Public GitHub repo ✅ https://github.com/Muheez001/somnia-guard
- Demo video (not recorded yet)
- Contract addresses ✅

---

## CONTACT
Builder: _mprime (X/Twitter)

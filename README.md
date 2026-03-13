# Somnia Guard

**Real-time Bot & Sybil Detection for the Somnia Reactivity Hackathon 2026**

## The Problem
Airdrops, quests, and free mints are plagued by bot nets and Sybil attackers. Traditional bot detection relies on expensive polling or indexing off-chain, meaning malicious actors can extract value before they are even flagged. By the time the indexer catches up, the damage is done.

## The Solution
Somnia Guard uses the **Somnia Reactivity SDK** to intercept and analyze on-chain activity *in real time*. As soon as a user interacts with the `QuestRegistry` smart contract, Somnia Guard's heuristic engine evaluates them based on wallet age, transaction velocity, and cluster behavior. It assigns a risk score (Safe, Suspicious, or Flagged) and updates the dashboard instantaneously via Server-Sent Events (SSE) before the next block even finalizes.

## Technology Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Reactivity**: `@somnia-chain/reactivity`, viem
- **Smart Contracts**: Solidity (deployed via Remix to Somnia testnet)

## How to Run Locally
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_QUEST_REGISTRY=0x1B512eAB79ab56841De99884498A320cab61b1E6
   NEXT_PUBLIC_SYBIL_GUARD=0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986
   NEXT_PUBLIC_SOMNIA_RPC=https://api.infra.testnet.somnia.network
   NEXT_PUBLIC_SOMNIA_WS=wss://api.infra.testnet.somnia.network/ws
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Current Status & Known Issues

**Where we are currently stuck:**
- **Reactivity Event Streaming:** The Next.js backend (`app/api/events/route.ts`) successfully initializes the Reactivity SDK and subscribes to the `QuestClaimed` topics from the `QuestRegistry` contract. However, we are currently experiencing issues where the `onData` callback either does not fire when test transactions are made, or the SSE stream drops/reconnects without delivering the parsed events to the frontend UI.
- **Next Steps:** We need to verify if the RPC node is dropping the WebSocket connection, if the `topicOverrides` keccak hash is malformed, or if the testnet contract requires the `isGuaranteed: true` Solidity-level subscription to successfully push the HTTP events.

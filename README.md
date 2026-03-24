# 🛡️ Somnia Guard

**Real-time Bot & Sybil Detection for the Somnia Reactivity Hackathon 2026**

![Somnia Guard Banner](/public/banner.png)

## 🌐 Overview
Somnia Guard is a real-time on-chain security dashboard designed to protect quests, airdrops, and fair-mints on the **Somnia Network**. Traditional Sybil detection often relies on post-transaction indexing, allowing malicious bots to extract value before they are even flagged. 

By leveraging the **Somnia Reactivity SDK**, Somnia Guard intercepts events *before* the next block even finalizes, providing instantaneous risk assessments via a high-performance heuristic engine.

## ✨ Key Features
- **⚡ Real-time Event Streaming**: Uses Somnia's Reactivity SDK via WebSocket transport to push `QuestRegistry` events to the dashboard as they happen.
- **🧠 Heuristic Risk Engine**: Evaluates wallets using multi-layered analysis including:
    - **Ephemeral Detection**: Flags extremely new wallets.
    - **Behavioral Velocity**: Monitors rapid claim bursts within short time windows.
    - **Block-Level Coordination**: Detects groups of wallets claiming in the exact same block.
    - **Cluster Math**: Identifies sequential address patterns and hex-prefix overlaps.
    - **Funding Analysis**: Detects "Mother Wallet" fan-out patterns and identical small-amount funding across multiple accounts.
- **📊 Interactive Dashboard**: Visualizes risk scores (Safe, Suspicious, Flagged) with live feed updates, cluster graphs, and real-time statistics.
- **📡 Server-Sent Events (SSE)**: Efficient server-to-client event pipeline that minimizes latency and frontend overhead.
- **🏗️ Scalable Architecture**: Built with Next.js 14, viem, and TypeScript for a robust developer experience.

## 🛠️ Technology Stack
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **On-chain Reactivity**: [@somnia-chain/reactivity](https://somnia.network/)
- **Blockchain Interface**: [Viem](https://viem.sh/) & TypeScript
- **Styling**: Vanilla CSS & TailwindCSS
- **Smart Contracts**: Solidity (Deployed to Somnia Shannon Testnet)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- [Somnia Testnet faucet tokens](https://testnet.somnia.network/)
- Environment variables configured in `.env.local`

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Muheez001/somnia-guard.git
   cd somnia-guard
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env.local`:
   ```env
   NEXT_PUBLIC_QUEST_REGISTRY=0x1B512eAB79ab56841De99884498A320cab61b1E6
   NEXT_PUBLIC_SYBIL_GUARD=0x93dFf9576424Cf2F08d4C1Ae22bBc9815b3aB986
   NEXT_PUBLIC_SOMNIA_RPC=https://api.infra.testnet.somnia.network
   NEXT_PUBLIC_SOMNIA_WS=wss://api.infra.testnet.somnia.network/ws
   NEXT_PUBLIC_DEMO_MODE=false # Set to true to simulate events if no live txs are available
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🎮 Demo Mode
To see the dashboard in action without executing live transactions on the testnet, set `NEXT_PUBLIC_DEMO_MODE=true` in your environment variables. This will trigger a simulated stream of events from known test wallets and Sybil clusters.

## 📂 Project Structure
- `/app/api/events/route.ts`: Core SSE route handling the Reactivity SDK subscription.
- `/lib/reactivity.ts`: SDK setup and WebSocket subscription logic.
- `/lib/heuristics.ts`: The risk scoring engine (0-100 score).
- `/lib/onchain.ts`: RPC helpers for fetching wallet metadata (balances, nonces).
- `/components`: Modular UI components for the dashboard, stats, and live feed.
- `middleware.ts`: Security headers and CSP configuration.
- `next.config.mjs`: Next.js configuration.

## 🏆 Hackathon Status
Created for the **Somnia Reactivity Hackathon 2026** (DoraHacks).
- **Network**: Somnia Shannon Testnet
- **Chain ID**: 50312
- **Developer**: [_mprime](https://x.com/_mprime)
- **Developer**: [banny](https://x.com/oboh_banny18)

---
*Built with ❤️ on Somnia*

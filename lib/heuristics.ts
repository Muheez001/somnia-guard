import { WalletProfile, RiskLevel, WalletEvent } from './types';

const WEIGHTS = {
  NEW_WALLET: 20,       // App-age < 1 hour
  LOW_TX_COUNT: 15,     // Single claim
  RAPID_CLAIMS: 40,     // 3+ claims within 120 seconds
  SEQUENTIAL_ADDR: 40,  // Address cluster pattern
  BLOCK_RUSH: 50,       // Part of a high-speed claim burst in a single block
  VANITY_PREFIX: 35,    // Shared address prefix with other suspicious wallets
  COMMON_FUNDING: 60,   // Funded by the same address (Fan-out pattern)
  EXACT_AMOUNT: 25,     // Multiple wallets funded with identical small amounts
};

export function calculateRiskScore(
  profile: WalletProfile,
  allProfiles: Map<string, WalletProfile>
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Check 1 — Ephemeral wallet (first seen very recently)
  const ageInMinutes = (Date.now() / 1000 - profile.firstSeen) / 60;
  if (ageInMinutes < 60) {
    score += WEIGHTS.NEW_WALLET;
    reasons.push(`Ephemeral wallet (first seen ${ageInMinutes.toFixed(0)}m ago)`);
  }

  // Check 2 — single claim activity
  if (profile.claims.length === 1) {
    score += WEIGHTS.LOW_TX_COUNT;
    reasons.push('Limited activity');
  }

  // Check 3 — individual rapid claims within 120s
  if (profile.claims.length >= 3) {
    const sorted = [...profile.claims].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i <= sorted.length - 3; i++) {
        const window = sorted[i + 2].timestamp - sorted[i].timestamp;
        if (window <= 120) {
          score += WEIGHTS.RAPID_CLAIMS;
          reasons.push('Bot-like individual claim speed');
          break;
        }
    }
  }

  // Create array from allProfiles for cluster analysis
  const profileList = Array.from(allProfiles.values());
  const addr = profile.address.toLowerCase();
  const addrPrefix = addr.slice(0, 6);
  const addrSuffix = parseInt(addr.slice(-4), 16);
  
  let clusterCount = 0;
  let prefixMatchCount = 0;
  let blockRushCount = 0;
  let commonFundingCount = 0;
  let identicalAmountCount = 0;

  // Extract this wallet's funding info
  const thisFundingSource = profile.claims[0]?.fromAddress;
  const thisFundingAmount = profile.claims[0]?.amount;

  profileList.forEach((p) => {
    if (p.address === profile.address) return;
    
    const otherAddr = p.address.toLowerCase();

    // 4 — Sequential address math
    const otherSuffix = parseInt(otherAddr.slice(-4), 16);
    if (Math.abs(addrSuffix - otherSuffix) <= 8) {
      clusterCount++;
    }

    // 5 — Vanity prefix matching
    if (otherAddr.startsWith(addrPrefix)) {
        prefixMatchCount++;
    }

    // 6 — Block Rush
    const thisBlocks = new Set(profile.claims.map(c => c.blockNumber));
    const thatBlocks = new Set(p.claims.map(c => c.blockNumber));
    const sharedBlocks = Array.from(thisBlocks).filter(b => thatBlocks.has(b));
    if (sharedBlocks.length > 0) {
        blockRushCount++;
    }

    // 7 — Common Funding Source (The "Mother" Wallet)
    const otherFundingSource = p.claims[0]?.fromAddress;
    if (thisFundingSource && otherFundingSource && thisFundingSource === otherFundingSource) {
        commonFundingCount++;
    }

    // 8 — Identical Small Amount Detection
    const otherFundingAmount = p.claims[0]?.amount;
    if (thisFundingAmount && otherFundingAmount && thisFundingAmount === otherFundingAmount && Number(thisFundingAmount) < 5) {
        identicalAmountCount++;
    }
  });

  if (clusterCount >= 2) {
    score += WEIGHTS.SEQUENTIAL_ADDR;
    reasons.push(`Address cluster detected (${clusterCount} similar wallets)`);
  }

  if (prefixMatchCount >= 2) {
    score += WEIGHTS.VANITY_PREFIX;
    reasons.push(`Hex-prefix overlap (${prefixMatchCount} wallets)`);
  }

  if (blockRushCount >= 3) {
    score += WEIGHTS.BLOCK_RUSH;
    reasons.push(`Block-level coordination (${blockRushCount} wallets in sync)`);
  }

  if (commonFundingCount >= 2) {
      score += WEIGHTS.COMMON_FUNDING;
      reasons.push(`Common funding source (${commonFundingCount} wallets from same parent)`);
  }

  if (identicalAmountCount >= 3) {
      score += WEIGHTS.EXACT_AMOUNT;
      reasons.push(`Identical tiny funding amounts (${identicalAmountCount} wallets)`);
  }

  return { score: Math.min(score, 100), reasons };
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 70) return 'FLAGGED';
  if (score >= 40) return 'SUSPICIOUS';
  return 'SAFE';
}

export function buildInitialProfile(address: string, event: WalletEvent): WalletProfile {
  return {
    address,
    claims: [event],
    firstSeen: event.timestamp,
    riskScore: 0,
    riskLevel: 'SAFE',
    riskReasons: [],
    isFlagged: false,
  };
}

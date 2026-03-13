import { WalletProfile, RiskLevel, WalletEvent } from './types';

const WEIGHTS = {
  NEW_WALLET: 30,       // wallet age < 7 days
  LOW_TX_COUNT: 25,     // fewer than 5 total claims
  RAPID_CLAIMS: 40,     // 3+ claims within 60 seconds
  SEQUENTIAL_ADDR: 50,  // address cluster pattern
};

export function calculateRiskScore(
  profile: WalletProfile,
  allProfiles: Map<string, WalletProfile>
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Check 1 — wallet is brand new
  const ageInDays = (Date.now() / 1000 - profile.firstSeen) / 86400;
  if (ageInDays < 7) {
    score += WEIGHTS.NEW_WALLET;
    reasons.push(`New wallet (${ageInDays.toFixed(1)} days old)`);
  }

  // Check 2 — very few claims overall
  if (profile.claims.length < 2) {
    score += WEIGHTS.LOW_TX_COUNT;
    reasons.push('Low activity wallet');
  }

  // Check 3 — rapid claims within 60 second window
  if (profile.claims.length >= 3) {
    const sorted = [...profile.claims].sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i <= sorted.length - 3; i++) {
      const window = sorted[i + 2].timestamp - sorted[i].timestamp;
      if (window <= 60) {
        score += WEIGHTS.RAPID_CLAIMS;
        reasons.push('3+ claims within 60 seconds');
        break;
      }
    }
  }

  // Check 4 — sequential address pattern (Sybil cluster)
  const addr = profile.address.toLowerCase();
  const addrSuffix = parseInt(addr.slice(-4), 16);
  let clusterCount = 0;
  allProfiles.forEach((p) => {
    const otherSuffix = parseInt(p.address.toLowerCase().slice(-4), 16);
    if (Math.abs(addrSuffix - otherSuffix) <= 5 && p.address !== profile.address) {
      clusterCount++;
    }
  });
  if (clusterCount >= 2) {
    score += WEIGHTS.SEQUENTIAL_ADDR;
    reasons.push(`Address cluster detected (${clusterCount} similar wallets)`);
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

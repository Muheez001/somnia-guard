export type RiskLevel = 'SAFE' | 'SUSPICIOUS' | 'FLAGGED';

export interface WalletEvent {
  id: string;
  address: string;
  questId: number;
  timestamp: number;
  blockNumber: number;
}

export interface WalletProfile {
  address: string;
  claims: WalletEvent[];
  firstSeen: number;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  isFlagged: boolean;
}

export interface Stats {
  total: number;
  safe: number;
  suspicious: number;
  flagged: number;
}

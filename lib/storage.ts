import { WalletProfile, WalletEvent } from './types';

const STORAGE_KEY = 'somnia-guard-profiles';
const MAX_ENTRIES = 500;

interface StoredProfile {
  address: string;
  claims: WalletEvent[];
  firstSeen: number;
  riskScore: number;
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'FLAGGED';
  riskReasons: string[];
  isFlagged: boolean;
}

export function saveProfiles(profiles: Map<string, WalletProfile>): void {
  try {
    const entries = Array.from(profiles.values()).slice(0, MAX_ENTRIES);
    const serialized = JSON.stringify(entries);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // localStorage might be full or unavailable
    console.warn('Failed to save profiles to localStorage');
  }
}

export function loadProfiles(): Map<string, WalletProfile> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return new Map();

    const entries: StoredProfile[] = JSON.parse(stored);
    const map = new Map<string, WalletProfile>();

    for (const entry of entries) {
      map.set(entry.address, {
        address: entry.address,
        claims: entry.claims,
        firstSeen: entry.firstSeen,
        riskScore: entry.riskScore,
        riskLevel: entry.riskLevel,
        riskReasons: entry.riskReasons,
        isFlagged: entry.isFlagged,
      });
    }

    return map;
  } catch {
    console.warn('Failed to load profiles from localStorage');
    return new Map();
  }
}

export function clearProfiles(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

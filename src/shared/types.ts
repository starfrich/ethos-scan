export type Explorer = "etherscan" | "blockscan" | "debank";

export interface EthosProfile {
  score: number;
  level: string;
  isActive: boolean;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  reviewStats?: {
    negative: number;
    neutral: number;
    positive: number;
  };
}

export interface EthosScoreBreakdown {
  range: string;
  label: string;
  color: string;
}

export interface AddressParseResult {
  address: string | null;
  explorer: Explorer | null;
  isValid: boolean;
}

export interface EthosApiUserStats {
  review: {
    received: {
      negative: number;
      neutral: number;
      positive: number;
    };
  };
  vouch: {
    given: { amountWeiTotal: number; count: number };
    received: { amountWeiTotal: number; count: number };
  };
}

export interface EthosApiUserResponse {
  id: number;
  profileId: number;
  displayName: string;
  username: string;
  avatarUrl: string;
  description: string;
  score: number;
  status: string;
  userkeys: string[];
  xpTotal: number;
  xpStreakDays: number;
  xpRemovedDueToAbuse: boolean;
  influenceFactor: number;
  influenceFactorPercentile: number;
  links: {
    profile: string;
    scoreBreakdown: string;
  };
  stats: EthosApiUserStats;
}

export interface EthosApiError {
  message: string;
  statusCode: number;
}

export type EthosApiResult =
  | { success: true; data: EthosApiUserResponse }
  | { success: false; error: EthosApiError };

export type Explorer = "etherscan" | "blockscout" | "debank";

export interface EthosProfile {
  score: number;
  level: string;
  color: string;
  isActive: boolean;
  displayName?: string;
  username?: string;
  avatarUrl?: string;
  reviewStats: {
    negative: number;
    neutral: number;
    positive: number;
  };
  links: {
    profile: string;
    scoreBreakdown: string;
  };
  lastReview?: {
    text: string;
    timestamp: string;
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

export interface AnchorPoint {
  element: HTMLElement;
  insertionStrategy: "after" | "before" | "prepend" | "append";
  confidence: "high" | "medium" | "low";
}

export interface AnchorSelector {
  query: string;
  strategy: "after" | "before" | "prepend" | "append";
  validator?: (element: HTMLElement) => boolean;
}

export interface AnchorConfig {
  explorer: Explorer;
  selectors: AnchorSelector[];
  fallbackSelector?: string;
  waitForDynamicContent?: boolean;
  maxRetries?: number;
}

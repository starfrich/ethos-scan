export type Explorer = "etherscan" | "blockscan" | "debank";

export interface EthosProfile {
  score: number;
  level: string;
  isActive: boolean;
}

export interface EthosScoreBreakdown {
  range: string;
  label: string;
  color: string;
}

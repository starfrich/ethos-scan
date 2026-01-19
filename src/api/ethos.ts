import type { EthosApiResult, EthosApiUserResponse } from "../shared/types";

const ETHOS_API_BASE = "https://api.ethos.network/api/v2";
const CLIENT_HEADER = "ethoscan@1.0.0";

export async function fetchEthosProfile(address: string): Promise<EthosApiResult> {
  try {
    const response = await fetch(`${ETHOS_API_BASE}/users/by/address`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "X-Ethos-Client": CLIENT_HEADER,
      },
      body: JSON.stringify({
        addresses: [address],
      }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          error: {
            message: "Address not found in Ethos network",
            statusCode: 404,
          },
        };
      }

      if (response.status === 400) {
        return {
          success: false,
          error: {
            message: "Invalid Ethereum address format",
            statusCode: 400,
          },
        };
      }

      return {
        success: false,
        error: {
          message: `API request failed with status ${response.status}`,
          statusCode: response.status,
        },
      };
    }

    const data: EthosApiUserResponse[] = await response.json();

    if (!data || data.length === 0) {
      return {
        success: false,
        error: {
          message: "No profile data returned from API",
          statusCode: 404,
        },
      };
    }

    return {
      success: true,
      data: data[0],
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : "Network request failed",
        statusCode: 0,
      },
    };
  }
}

export function getScoreLevelInfo(score: number): { level: string; color: string } {
  if (score < 800) {
    return { level: "untrusted", color: "#b72b38" };
  }
  if (score < 1200) {
    return { level: "questionable", color: "#C29010" };
  }
  if (score < 1400) {
    return { level: "neutral", color: "#C1C0B6" };
  }
  if (score < 1600) {
    return { level: "known", color: "#7C8DA8" };
  }
  if (score < 1800) {
    return { level: "established", color: "#4E86B9" };
  }
  if (score < 2000) {
    return { level: "reputable", color: "#2E7BC3" };
  }
  if (score < 2200) {
    return { level: "exemplary", color: "#427B56" };
  }
  if (score < 2400) {
    return { level: "distinguished", color: "#127f31" };
  }
  if (score < 2600) {
    return { level: "revered", color: "#836DA6" };
  }
  return { level: "renowned", color: "#7A5EAF" };
}

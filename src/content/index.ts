import "../styles/content.css";
import type { Explorer, AddressParseResult } from "../shared/types";
import { fetchEthosProfile, normalizeEthosData } from "../api/ethos";
import { findAnchorPoint } from "./dom-anchor.js";
import { renderWidget, removeExistingWidgets } from "./ui-renderer.js";

function validateEthereumAddress(address: string): boolean {
  if (!address || typeof address !== "string") {
    return false;
  }

  if (!address.startsWith("0x")) {
    return false;
  }

  if (address.length !== 42) {
    return false;
  }

  const hexPattern = /^0x[0-9a-fA-F]{40}$/;
  return hexPattern.test(address);
}

function detectExplorer(url: string): Explorer | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname === "etherscan.io" || hostname.endsWith(".etherscan.io")) {
      return "etherscan";
    }

    if (hostname === "blockscout.com" || hostname.endsWith(".blockscout.com")) {
      return "blockscout";
    }

    if (hostname === "debank.com") {
      return "debank";
    }

    return null;
  } catch {
    return null;
  }
}

function parseAddressFromURL(url: string): AddressParseResult {
  const explorer = detectExplorer(url);

  if (!explorer) {
    return {
      address: null,
      explorer: null,
      isValid: false,
    };
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    let address: string | null = null;

    if (explorer === "etherscan" || explorer === "blockscout") {
      const addressMatch = pathname.match(/\/address\/([^\/\?#]+)/);
      if (addressMatch && addressMatch[1]) {
        address = addressMatch[1];
      }
    } else if (explorer === "debank") {
      const profileMatch = pathname.match(/\/profile\/([^\/\?#]+)/);
      if (profileMatch && profileMatch[1]) {
        address = profileMatch[1];
      }
    }

    if (!address) {
      return {
        address: null,
        explorer,
        isValid: false,
      };
    }

    const isValid = validateEthereumAddress(address);

    return {
      address: isValid ? address : null,
      explorer,
      isValid,
    };
  } catch {
    return {
      address: null,
      explorer,
      isValid: false,
    };
  }
}

let lastProcessedAddress: string | null = null;
let urlCheckInterval: number | null = null;
let popstateHandler: (() => void) | null = null;

async function detectAndProcessAddress(): Promise<void> {
  const result = parseAddressFromURL(window.location.href);

  if (result.isValid && result.address && result.explorer) {
    if (result.address === lastProcessedAddress) {
      return;
    }

    lastProcessedAddress = result.address;
    console.log(`[Ethoscan] Address detected: ${result.address} on ${result.explorer}`);

    const anchor = await findAnchorPoint(result.explorer);

    if (!anchor) {
      console.error(`[Ethoscan] Failed to find DOM anchor point for ${result.explorer}`);
      return;
    }

    console.log(`[Ethoscan] Found anchor point with ${anchor.confidence} confidence`);

    const apiResult = await fetchEthosProfile(result.address);

    if (apiResult.success) {
      const profile = normalizeEthosData(apiResult.data);
      console.log("[Ethoscan] Rendering widget for:", result.address);
      renderWidget(profile, anchor, result.address, result.explorer);
    } else {
      console.error("[Ethoscan] API Error:", apiResult.error);
      renderWidget(null, anchor, result.address, result.explorer);
    }
  } else {
    if (lastProcessedAddress !== null) {
      lastProcessedAddress = null;
      removeExistingWidgets();
      console.log("[Ethoscan] Cleaned up widgets - no valid address");
    }
  }
}

function startNavigationMonitoring(): void {
  popstateHandler = () => {
    void detectAndProcessAddress();
  };
  window.addEventListener("popstate", popstateHandler);

  urlCheckInterval = window.setInterval(() => {
    void detectAndProcessAddress();
  }, 500);
}

function stopNavigationMonitoring(): void {
  if (popstateHandler !== null) {
    window.removeEventListener("popstate", popstateHandler);
    popstateHandler = null;
  }
  if (urlCheckInterval !== null) {
    clearInterval(urlCheckInterval);
    urlCheckInterval = null;
  }
}

function init(): void {
  void detectAndProcessAddress();
  startNavigationMonitoring();
}

window.addEventListener("beforeunload", stopNavigationMonitoring);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

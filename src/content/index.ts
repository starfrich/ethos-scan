import "../styles/content.css";
import type { Explorer, AddressParseResult } from "../shared/types";

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

    if (hostname === "blockscan.com" || hostname.endsWith(".blockscan.com")) {
      return "blockscan";
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

    if (explorer === "etherscan" || explorer === "blockscan") {
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

function detectAndProcessAddress(): void {
  const result = parseAddressFromURL(window.location.href);

  if (result.isValid && result.address) {
    if (result.address === lastProcessedAddress) {
      return;
    }

    lastProcessedAddress = result.address;
    console.log(`Address detected: ${result.address} on ${result.explorer}`);
  } else {
    if (lastProcessedAddress !== null) {
      lastProcessedAddress = null;
      console.log("No valid Ethereum address found in URL");
    }
  }
}

function startNavigationMonitoring(): void {
  window.addEventListener("popstate", detectAndProcessAddress);

  urlCheckInterval = window.setInterval(() => {
    detectAndProcessAddress();
  }, 500);
}

function stopNavigationMonitoring(): void {
  window.removeEventListener("popstate", detectAndProcessAddress);
  if (urlCheckInterval !== null) {
    clearInterval(urlCheckInterval);
    urlCheckInterval = null;
  }
}

function init(): void {
  detectAndProcessAddress();
  startNavigationMonitoring();
}

window.addEventListener("beforeunload", stopNavigationMonitoring);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

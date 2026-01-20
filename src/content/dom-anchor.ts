import type {
  Explorer,
  AnchorPoint,
  AnchorConfig,
} from "../shared/types.js";

export function validateAnchorPoint(element: HTMLElement): boolean {
  if (!document.contains(element)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display === "none" || style.visibility === "hidden") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  let parent = element.parentElement;
  while (parent) {
    const parentStyle = window.getComputedStyle(parent);
    if (parentStyle.display === "none" || parentStyle.visibility === "hidden") {
      return false;
    }
    parent = parent.parentElement;
  }

  return true;
}

export function waitForElement(
  selector: string,
  timeout: number = 3000
): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element && validateAnchorPoint(element)) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector<HTMLElement>(selector);
      if (element && validateAnchorPoint(element)) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

export function getAnchorConfig(explorer: Explorer): AnchorConfig {
  switch (explorer) {
    case "etherscan":
      return {
        explorer,
        selectors: [
          {
            query: ".container.py-3",
            strategy: "after",
          },
          {
            query: "section.container-xxl",
            strategy: "after",
          },
          {
            query: "#ContentPlaceHolder1_divSummary",
            strategy: "prepend",
          },
        ],
        fallbackSelector: "main#content",
        maxRetries: 3,
      };

    case "blockscout":
      return {
        explorer,
        selectors: [
          {
            query: ".address-entity",
            strategy: "after",
          },
          {
            query: 'a[href*="/name-services/domains/"]',
            strategy: "after",
          },
        ],
        fallbackSelector: "main",
        waitForDynamicContent: true,
        maxRetries: 5,
      };

    case "debank":
      return {
        explorer,
        selectors: [
          {
            query: '[class*="ProfileHeader"]',
            strategy: "append",
          },
          {
            query: '[class*="UserInfo"]',
            strategy: "after",
          },
          {
            query: "main > div:first-child",
            strategy: "prepend",
          },
        ],
        fallbackSelector: "main",
        waitForDynamicContent: true,
        maxRetries: 5,
      };

    default:
      return {
        explorer,
        selectors: [],
        maxRetries: 3,
      };
  }
}

export async function findAnchorPoint(
  explorer: Explorer
): Promise<AnchorPoint | null> {
  const config = getAnchorConfig(explorer);

  console.group(`[Ethoscan] Finding anchor for ${explorer}`);

  for (const selector of config.selectors) {
    console.log("Trying selector:", selector.query);

    let element: HTMLElement | null = null;

    if (config.waitForDynamicContent) {
      element = await waitForElement(selector.query, 3000);
    } else {
      element = document.querySelector<HTMLElement>(selector.query);
    }

    if (element) {
      const isValid = validateAnchorPoint(element);
      console.log("Element found:", true);
      console.log("Validation passed:", isValid);

      if (isValid) {
        if (selector.validator && !selector.validator(element)) {
          console.log("Custom validator failed");
          continue;
        }

        console.log("✓ Primary selector matched (high confidence)");
        console.groupEnd();

        return {
          element,
          insertionStrategy: selector.strategy,
          confidence: "high",
        };
      }
    } else {
      console.log("Element found:", false);
    }
  }

  if (config.fallbackSelector) {
    console.log("Trying fallback selector:", config.fallbackSelector);

    let fallbackElement: HTMLElement | null = null;

    if (config.waitForDynamicContent) {
      fallbackElement = await waitForElement(config.fallbackSelector, 3000);
    } else {
      fallbackElement = document.querySelector<HTMLElement>(
        config.fallbackSelector
      );
    }

    if (fallbackElement && validateAnchorPoint(fallbackElement)) {
      console.log("✓ Fallback selector matched (medium confidence)");
      console.groupEnd();

      return {
        element: fallbackElement,
        insertionStrategy: "prepend",
        confidence: "medium",
      };
    }
  }

  const genericSelectors = ["main", "body"];
  for (const genericSelector of genericSelectors) {
    console.log("Trying generic selector:", genericSelector);

    const genericElement = document.querySelector<HTMLElement>(genericSelector);

    if (genericElement && validateAnchorPoint(genericElement)) {
      console.warn("⚠ Using generic selector (low confidence)");
      console.groupEnd();

      return {
        element: genericElement,
        insertionStrategy: "prepend",
        confidence: "low",
      };
    }
  }

  console.error("✗ No anchor point found");
  console.groupEnd();

  return null;
}

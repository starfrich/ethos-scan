import type { EthosProfile, AnchorPoint, Explorer } from "../shared/types.js";
import { getContrastTextColor } from "../shared/color-utils.js";

const WIDGET_CLASS = "ethoscan-widget";
const WIDGET_ID_ATTR = "data-ethoscan-id";

export function renderWidget(
  profile: EthosProfile | null,
  anchorPoint: AnchorPoint,
  address: string,
  explorer: Explorer,
  errorMessage?: string
): void {
  requestAnimationFrame(() => {
    removeExistingWidgets();

    const widget = profile
      ? createEthosWidget(profile, explorer)
      : createErrorWidget(errorMessage || "Unable to load Ethos profile");

    widget.setAttribute(WIDGET_ID_ATTR, address.toLowerCase());
    widget.setAttribute("data-ethoscan-explorer", explorer);

    injectWidget(widget, anchorPoint);
  });
}

function createEthosWidget(
  profile: EthosProfile,
  explorer: Explorer
): HTMLElement {
  if (explorer === "etherscan") {
    const widget = createElement("div", `${WIDGET_CLASS} ${WIDGET_CLASS}--etherscan`);
    const content = createEtherscanContent(profile);
    widget.appendChild(content);
    return widget;
  } else if (explorer === "debank") {
    const widget = createElement("div", `${WIDGET_CLASS} ${WIDGET_CLASS}--debank`);
    const content = createDebankContent(profile);
    widget.appendChild(content);
    return widget;
  } else if (explorer === "blockscout") {
    const widget = createElement("div", `${WIDGET_CLASS} ${WIDGET_CLASS}--blockscout`);
    const content = createBlockscoutContent(profile);
    widget.appendChild(content);
    return widget;
  } else if (explorer === "routescan") {
    const widget = createElement("div", `${WIDGET_CLASS} ${WIDGET_CLASS}--routescan`);
    const content = createRoutescanContent(profile);
    widget.appendChild(content);
    return widget;
  } else {
    const widget = createElement("div", WIDGET_CLASS);
    const header = createHeader(profile);
    const content = createContent(profile);
    widget.appendChild(header);
    widget.appendChild(content);
    return widget;
  }
}

function createHeader(profile: EthosProfile): HTMLElement {
  const header = createElement("div", "ethoscan-widget__header");

  const title = createElement(
    "span",
    "ethoscan-widget__title",
    "Ethos Reputation"
  );

  const link = document.createElement("a");
  link.className = "ethoscan-widget__link";
  link.href = profile.links.profile;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Profile";

  header.appendChild(title);
  header.appendChild(link);

  return header;
}

function createContent(profile: EthosProfile): HTMLElement {
  const content = createElement("div", "ethoscan-widget__content");

  const scoreSection = createScoreSection(profile);
  const stats = createStats(profile);

  content.appendChild(scoreSection);
  content.appendChild(stats);

  return content;
}

function createScoreSection(profile: EthosProfile): HTMLElement {
  const section = createElement("div", "ethoscan-widget__score-section");

  const score = createElement("div", "ethoscan-widget__score");
  score.style.color = profile.color;
  score.style.textShadow = '0 0 8px rgba(255, 255, 255, 0.9), 0 0 2px rgba(0, 0, 0, 0.3)';
  score.textContent = profile.score.toString();

  const level = createElement("div", "ethoscan-widget__level");
  level.style.backgroundColor = profile.color;
  level.style.color = getContrastTextColor(profile.color);
  level.textContent = profile.level;

  section.appendChild(score);
  section.appendChild(level);

  return section;
}

function createStats(profile: EthosProfile): HTMLElement {
  const stats = createElement("div", "ethoscan-widget__stats");

  const positiveCount = profile.reviewStats.positive;
  const neutralCount = profile.reviewStats.neutral;
  const negativeCount = profile.reviewStats.negative;

  const positiveStat = createStat(positiveCount.toString(), "Positive");
  const neutralStat = createStat(neutralCount.toString(), "Neutral");
  const negativeStat = createStat(negativeCount.toString(), "Negative");

  stats.appendChild(positiveStat);
  stats.appendChild(neutralStat);
  stats.appendChild(negativeStat);

  return stats;
}

function createStat(value: string, label: string): HTMLElement {
  const stat = createElement("div", "ethoscan-widget__stat");

  const statValue = createElement("span", "ethoscan-widget__stat-value", value);
  const statLabel = createElement("span", "ethoscan-widget__stat-label", label);

  stat.appendChild(statValue);
  stat.appendChild(statLabel);

  return stat;
}

function createEtherscanContent(profile: EthosProfile): HTMLElement {
  const container = createElement("div", "ethoscan-widget__etherscan-container");

  const label = createElement("span", "ethoscan-widget__etherscan-label", "Ethos:");

  const score = createElement("span", "ethoscan-widget__etherscan-score");
  score.style.color = profile.color;
  score.textContent = profile.score.toString();

  const level = createElement("span", "ethoscan-widget__etherscan-level");
  level.style.backgroundColor = profile.color;
  level.style.color = getContrastTextColor(profile.color);
  level.textContent = profile.level;

  const stats = createElement("span", "ethoscan-widget__etherscan-stats");

  const positiveSpan = document.createElement("span");
  positiveSpan.className = "ethoscan-widget__etherscan-stats-positive";
  positiveSpan.textContent = `${profile.reviewStats.positive} Positive`;

  const neutralSpan = document.createElement("span");
  neutralSpan.className = "ethoscan-widget__etherscan-stats-neutral";
  neutralSpan.textContent = `${profile.reviewStats.neutral} Neutral`;

  const negativeSpan = document.createElement("span");
  negativeSpan.className = "ethoscan-widget__etherscan-stats-negative";
  negativeSpan.textContent = `${profile.reviewStats.negative} Negative`;

  stats.appendChild(positiveSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(neutralSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(negativeSpan);

  const link = document.createElement("a");
  link.className = "ethoscan-widget__etherscan-link";
  link.href = profile.links.profile;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Profile";


  container.appendChild(label);
  container.appendChild(score);
  container.appendChild(level);
  container.appendChild(stats);
  container.appendChild(link);

  return container;
}

function createDebankContent(profile: EthosProfile): HTMLElement {
  const container = createElement("div", "ethoscan-widget__debank-container");

  const divider = createElement("div", "ethoscan-widget__debank-divider");

  const scoreItem = createElement("div", "ethoscan-widget__debank-item");
  const scoreTitle = createElement("div", "ethoscan-widget__debank-title", "Ethos Score");
  const scoreValue = createElement("div", "ethoscan-widget__debank-value");
  scoreValue.style.color = profile.color;
  scoreValue.textContent = profile.score.toString();
  scoreItem.appendChild(scoreTitle);
  scoreItem.appendChild(scoreValue);

  const levelItem = createElement("div", "ethoscan-widget__debank-item");
  const levelTitle = createElement("div", "ethoscan-widget__debank-title", "Level");
  const levelValue = createElement("div", "ethoscan-widget__debank-value");
  levelValue.style.color = profile.color;
  levelValue.textContent = profile.level;
  levelItem.appendChild(levelTitle);
  levelItem.appendChild(levelValue);

  const reviewsItem = createElement("div", "ethoscan-widget__debank-item");
  const reviewsTitle = createElement("div", "ethoscan-widget__debank-title", "Reviews");
  const reviewsValue = createElement("div", "ethoscan-widget__debank-value");
  reviewsValue.style.fontSize = "12px";
  reviewsValue.style.fontWeight = "400";

  const positiveSpan = document.createElement("span");
  positiveSpan.className = "ethoscan-widget__debank-stats-positive";
  positiveSpan.textContent = `${profile.reviewStats.positive} Positive`;

  const neutralSpan = document.createElement("span");
  neutralSpan.className = "ethoscan-widget__debank-stats-neutral";
  neutralSpan.textContent = `${profile.reviewStats.neutral} Neutral`;

  const negativeSpan = document.createElement("span");
  negativeSpan.className = "ethoscan-widget__debank-stats-negative";
  negativeSpan.textContent = `${profile.reviewStats.negative} Negative`;

  reviewsValue.appendChild(positiveSpan);
  reviewsValue.appendChild(document.createTextNode(" · "));
  reviewsValue.appendChild(neutralSpan);
  reviewsValue.appendChild(document.createTextNode(" · "));
  reviewsValue.appendChild(negativeSpan);

  reviewsItem.appendChild(reviewsTitle);
  reviewsItem.appendChild(reviewsValue);

  const link = document.createElement("a");
  link.className = "ethoscan-widget__debank-link";
  link.href = profile.links.profile;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Profile →";
  link.style.fontSize = "12px";
  link.style.color = "rgb(139, 147, 167)";
  link.style.textDecoration = "none";
  link.style.alignSelf = "center";

  container.appendChild(divider);
  container.appendChild(scoreItem);
  container.appendChild(levelItem);
  container.appendChild(reviewsItem);
  container.appendChild(link);

  return container;
}

function createBlockscoutContent(profile: EthosProfile): HTMLElement {
  const container = createElement("div", "ethoscan-widget__blockscout-container");

  const divider = createElement("div", "ethoscan-widget__blockscout-divider");

  const label = createElement("span", "ethoscan-widget__blockscout-label", "Ethos:");

  const score = createElement("span", "ethoscan-widget__blockscout-score");
  score.style.color = profile.color;
  score.textContent = profile.score.toString();

  const level = createElement("span", "ethoscan-widget__blockscout-level");
  level.style.backgroundColor = profile.color;
  level.style.color = getContrastTextColor(profile.color);
  level.textContent = profile.level;

  const stats = createElement("span", "ethoscan-widget__blockscout-stats");

  const positiveSpan = document.createElement("span");
  positiveSpan.className = "ethoscan-widget__blockscout-stats-positive";
  positiveSpan.textContent = `${profile.reviewStats.positive} Positive`;

  const neutralSpan = document.createElement("span");
  neutralSpan.className = "ethoscan-widget__blockscout-stats-neutral";
  neutralSpan.textContent = `${profile.reviewStats.neutral} Neutral`;

  const negativeSpan = document.createElement("span");
  negativeSpan.className = "ethoscan-widget__blockscout-stats-negative";
  negativeSpan.textContent = `${profile.reviewStats.negative} Negative`;

  stats.appendChild(positiveSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(neutralSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(negativeSpan);

  const link = document.createElement("a");
  link.className = "ethoscan-widget__blockscout-link";
  link.href = profile.links.profile;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Profile";

  container.appendChild(divider);
  container.appendChild(label);
  container.appendChild(score);
  container.appendChild(level);
  container.appendChild(stats);
  container.appendChild(link);

  return container;
}

function createRoutescanContent(profile: EthosProfile): HTMLElement {
  const container = createElement("div", "ethoscan-widget__routescan-container");

  const label = createElement("span", "ethoscan-widget__routescan-label", "Ethos:");

  const score = createElement("span", "ethoscan-widget__routescan-score");
  score.style.color = profile.color;
  score.textContent = profile.score.toString();

  const level = createElement("span", "ethoscan-widget__routescan-level");
  level.style.backgroundColor = profile.color;
  level.style.color = getContrastTextColor(profile.color);
  level.textContent = profile.level;

  const stats = createElement("span", "ethoscan-widget__routescan-stats");

  const positiveSpan = document.createElement("span");
  positiveSpan.className = "ethoscan-widget__routescan-stats-positive";
  positiveSpan.textContent = `${profile.reviewStats.positive} Positive`;

  const neutralSpan = document.createElement("span");
  neutralSpan.className = "ethoscan-widget__routescan-stats-neutral";
  neutralSpan.textContent = `${profile.reviewStats.neutral} Neutral`;

  const negativeSpan = document.createElement("span");
  negativeSpan.className = "ethoscan-widget__routescan-stats-negative";
  negativeSpan.textContent = `${profile.reviewStats.negative} Negative`;

  stats.appendChild(positiveSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(neutralSpan);
  stats.appendChild(document.createTextNode(" · "));
  stats.appendChild(negativeSpan);

  const link = document.createElement("a");
  link.className = "ethoscan-widget__routescan-link";
  link.href = profile.links.profile;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "View Profile";


  container.appendChild(label);
  container.appendChild(score);
  container.appendChild(level);
  container.appendChild(stats);
  container.appendChild(link);

  return container;
}

function createErrorWidget(errorMessage: string): HTMLElement {
  const widget = createElement("div", `${WIDGET_CLASS} ${WIDGET_CLASS}--error`);

  const icon = createElement("span", "ethoscan-widget__error-icon", "⚠");
  const message = createElement(
    "span",
    "ethoscan-widget__error-message",
    errorMessage
  );

  widget.appendChild(icon);
  widget.appendChild(message);

  return widget;
}

function createElement(
  tag: string,
  className: string,
  textContent?: string
): HTMLElement {
  const element = document.createElement(tag);
  element.className = className;

  if (textContent) {
    element.textContent = textContent;
  }

  return element;
}

function injectWidget(widget: HTMLElement, anchorPoint: AnchorPoint): void {
  const { element, insertionStrategy } = anchorPoint;

  switch (insertionStrategy) {
    case "after":
      element.insertAdjacentElement("afterend", widget);
      break;

    case "before":
      element.insertAdjacentElement("beforebegin", widget);
      break;

    case "prepend":
      element.insertAdjacentElement("afterbegin", widget);
      break;

    case "append":
      element.insertAdjacentElement("beforeend", widget);
      break;

    default:
      console.error("[Ethoscan] Unknown insertion strategy:", insertionStrategy);
  }
}

export function removeExistingWidgets(): void {
  const existingWidgets = document.querySelectorAll(`.${WIDGET_CLASS}`);
  const existingSections = document.querySelectorAll(`section[${WIDGET_ID_ATTR}]`);

  existingWidgets.forEach((widget) => {
    widget.remove();
  });

  existingSections.forEach((section) => {
    section.remove();
  });

  const totalRemoved = existingWidgets.length + existingSections.length;
  if (totalRemoved > 0) {
    console.log(`[Ethoscan] Removed ${totalRemoved} existing widget(s)`);
  }
}

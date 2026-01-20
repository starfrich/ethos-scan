import type { EthosProfile, AnchorPoint } from "../shared/types.js";
import { getContrastTextColor } from "../shared/color-utils.js";

const WIDGET_CLASS = "ethoscan-widget";
const WIDGET_ID_ATTR = "data-ethoscan-id";

export function renderWidget(
  profile: EthosProfile | null,
  anchorPoint: AnchorPoint,
  address: string
): void {
  requestAnimationFrame(() => {
    removeExistingWidgets();

    const widget = profile
      ? createEthosWidget(profile)
      : createErrorWidget("Unable to load Ethos profile");

    widget.setAttribute(WIDGET_ID_ATTR, address.toLowerCase());

    injectWidget(widget, anchorPoint);
  });
}

function createEthosWidget(profile: EthosProfile): HTMLElement {
  const widget = createElement("div", WIDGET_CLASS);

  const header = createHeader(profile);
  const content = createContent(profile);

  widget.appendChild(header);
  widget.appendChild(content);

  return widget;
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

  existingWidgets.forEach((widget) => {
    widget.remove();
  });

  if (existingWidgets.length > 0) {
    console.log(`[Ethoscan] Removed ${existingWidgets.length} existing widget(s)`);
  }
}

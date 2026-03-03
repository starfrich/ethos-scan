import './popup.css';
import { getSettings, saveSettings, type ExplorerSettings } from '../shared/storage';

async function initializePopup(): Promise<void> {
  await loadSettings();
  setupEventListeners();
  displayVersion();
}

async function loadSettings(): Promise<void> {
  const settings = await getSettings();

  const etherscanToggle = document.getElementById('toggle-etherscan') as HTMLInputElement;
  const blockscoutToggle = document.getElementById('toggle-blockscout') as HTMLInputElement;
  const debankToggle = document.getElementById('toggle-debank') as HTMLInputElement;
  const routescanToggle = document.getElementById('toggle-routescan') as HTMLInputElement;
  const themeToggle = document.getElementById('toggle-theme') as HTMLInputElement;

  if (etherscanToggle) etherscanToggle.checked = settings.etherscan;
  if (blockscoutToggle) blockscoutToggle.checked = settings.blockscout;
  if (debankToggle) debankToggle.checked = settings.debank;
  if (routescanToggle) routescanToggle.checked = settings.routescan;

  if (themeToggle) {
    themeToggle.checked = settings.theme === 'dark';
    applyTheme(settings.theme);
  }
}

function setupEventListeners(): void {
  const toggles = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-explorer]');
  const themeToggle = document.getElementById('toggle-theme') as HTMLInputElement;

  // Explorer toggles
  toggles.forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const explorer = target.dataset.explorer as Extract<
        keyof ExplorerSettings,
        'etherscan' | 'blockscout' | 'debank' | 'routescan'
      >;

      if (!explorer) return;

      const settings = await getSettings();
      settings[explorer] = target.checked;
      await saveSettings(settings);

      await notifyContentScripts();
    });
  });

  // Theme toggle (light <-> dark)
  if (themeToggle) {
    themeToggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const settings = await getSettings();

      settings.theme = target.checked ? 'dark' : 'light';
      await saveSettings(settings);

      applyTheme(settings.theme);
    });
  }
}

function applyTheme(theme: 'light' | 'dark'): void {
  const htmlElement = document.documentElement;

  if (theme === 'dark') {
    htmlElement.setAttribute('data-theme', 'dark');
  } else {
    htmlElement.setAttribute('data-theme', 'light');
  }
}

async function notifyContentScripts(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, { type: 'SETTINGS_UPDATED' })
      .catch(() => {
        // Content script might not be loaded
      });
  }
}

function displayVersion(): void {
  const versionElement = document.getElementById('version');
  const manifestVersion = chrome.runtime.getManifest().version;

  if (versionElement) {
    versionElement.textContent = `v${manifestVersion}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  void initializePopup();
});

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

  if (etherscanToggle) etherscanToggle.checked = settings.etherscan;
  if (blockscoutToggle) blockscoutToggle.checked = settings.blockscout;
  if (debankToggle) debankToggle.checked = settings.debank;
  if (routescanToggle) routescanToggle.checked = settings.routescan;
}

function setupEventListeners(): void {
  const toggles = document.querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-explorer]');

  toggles.forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const target = e.target as HTMLInputElement;
      const explorer = target.dataset.explorer as keyof ExplorerSettings;

      if (!explorer) return;

      const settings = await getSettings();
      settings[explorer] = target.checked;
      await saveSettings(settings);

      await notifyContentScripts();
    });
  });
}

async function notifyContentScripts(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'SETTINGS_UPDATED' }).catch(() => {
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

export interface ExplorerSettings {
  etherscan: boolean;
  blockscout: boolean;
  debank: boolean;
}

export const DEFAULT_SETTINGS: ExplorerSettings = {
  etherscan: true,
  blockscout: true,
  debank: true,
};

const STORAGE_KEY = 'settings:explorers';

export async function getSettings(): Promise<ExplorerSettings> {
  const result = await chrome.storage.sync.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as ExplorerSettings) || DEFAULT_SETTINGS;
}

export async function saveSettings(settings: ExplorerSettings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
}

import type { StorageSchema, AnalysisResult, ProcessedEmployee } from '@/types';

export class StorageManager {
  private static readonly DEFAULT_SETTINGS: StorageSchema['settings'] = {
    maxEmployees: 50,
    enablePastEmployees: true,
    theme: 'auto',
  };

  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000;
  private static readonly MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000;

  static async getSettings(): Promise<StorageSchema['settings']> {
    const result = await chrome.storage.local.get('settings');
    return result.settings || this.DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: Partial<StorageSchema['settings']>): Promise<void> {
    const current = await this.getSettings();
    await chrome.storage.local.set({
      settings: { ...current, ...settings },
    });
  }

  static async saveAnalysis(analysis: AnalysisResult): Promise<void> {
    await chrome.storage.local.set({ lastAnalysis: analysis });

    await this.saveToCache(analysis.companyId, analysis.processed);
  }

  static async getLastAnalysis(): Promise<AnalysisResult | null> {
    const result = await chrome.storage.local.get('lastAnalysis');
    return result.lastAnalysis || null;
  }

  static async saveToCache(companyId: string, data: ProcessedEmployee[]): Promise<void> {
    const result = await chrome.storage.local.get('cache');
    const cache = result.cache || {};

    cache[companyId] = {
      timestamp: Date.now(),
      data,
      expiresAt: Date.now() + this.CACHE_DURATION,
    };

    await chrome.storage.local.set({ cache });
  }

  static async getFromCache(companyId: string): Promise<ProcessedEmployee[] | null> {
    const result = await chrome.storage.local.get('cache');
    const cache = result.cache || {};

    const cached = cache[companyId];
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      delete cache[companyId];
      await chrome.storage.local.set({ cache });
      return null;
    }

    return cached.data;
  }

  static async clearCache(): Promise<void> {
    await chrome.storage.local.set({ cache: {} });
  }

  static async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
    await this.saveSettings(this.DEFAULT_SETTINGS);
  }

  static async cleanupOldData(): Promise<void> {
    const result = await chrome.storage.local.get(['cache', 'lastAnalysis']);
    const cache = result.cache || {};

    for (const [companyId, entry] of Object.entries(cache)) {
      if (Date.now() - (entry as any).timestamp > this.MAX_CACHE_AGE) {
        delete cache[companyId];
      }
    }

    await chrome.storage.local.set({ cache });
  }
}


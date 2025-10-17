export class StorageManager {
    static async getSettings() {
        const result = await chrome.storage.local.get('settings');
        return result.settings || this.DEFAULT_SETTINGS;
    }
    static async saveSettings(settings) {
        const current = await this.getSettings();
        await chrome.storage.local.set({
            settings: { ...current, ...settings },
        });
    }
    static async saveAnalysis(analysis) {
        await chrome.storage.local.set({ lastAnalysis: analysis });
        await this.saveToCache(analysis.companyId, analysis.processed);
    }
    static async getLastAnalysis() {
        const result = await chrome.storage.local.get('lastAnalysis');
        return result.lastAnalysis || null;
    }
    static async saveToCache(companyId, data) {
        const result = await chrome.storage.local.get('cache');
        const cache = result.cache || {};
        cache[companyId] = {
            timestamp: Date.now(),
            data,
            expiresAt: Date.now() + this.CACHE_DURATION,
        };
        await chrome.storage.local.set({ cache });
    }
    static async getFromCache(companyId) {
        const result = await chrome.storage.local.get('cache');
        const cache = result.cache || {};
        const cached = cache[companyId];
        if (!cached)
            return null;
        if (Date.now() > cached.expiresAt) {
            delete cache[companyId];
            await chrome.storage.local.set({ cache });
            return null;
        }
        return cached.data;
    }
    static async clearCache() {
        await chrome.storage.local.set({ cache: {} });
    }
    static async clearAllData() {
        await chrome.storage.local.clear();
        await this.saveSettings(this.DEFAULT_SETTINGS);
    }
    static async cleanupOldData() {
        const result = await chrome.storage.local.get(['cache', 'lastAnalysis']);
        const cache = result.cache || {};
        for (const [companyId, entry] of Object.entries(cache)) {
            if (Date.now() - entry.timestamp > this.MAX_CACHE_AGE) {
                delete cache[companyId];
            }
        }
        await chrome.storage.local.set({ cache });
    }
}
StorageManager.DEFAULT_SETTINGS = {
    maxEmployees: 50,
    enablePastEmployees: true,
    theme: 'auto',
};
StorageManager.CACHE_DURATION = 24 * 60 * 60 * 1000;
StorageManager.MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000;

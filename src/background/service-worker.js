import { TenureCalculator } from '@/analytics/tenure-calculator';
import { StatisticsEngine } from '@/analytics/statistics-engine';
import { StorageManager } from '@/utils/storage-manager';
const tenureCalculator = new TenureCalculator();
const statisticsEngine = new StatisticsEngine();
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'ANALYZE_COMPANY') {
        handleAnalysis(message)
            .then(sendResponse)
            .catch((error) => {
            console.error('[ServiceWorker] Analysis error:', error);
            sendResponse({
                success: false,
                error: error.message || 'Analysis failed',
            });
        });
        return true;
    }
});
async function handleAnalysis(request) {
    try {
        if (!request.data || request.data.length === 0) {
            return {
                success: false,
                error: 'No employee data provided',
            };
        }
        const processed = tenureCalculator.processEmployees(request.data);
        if (processed.length === 0) {
            return {
                success: false,
                error: 'No valid employee data could be processed',
            };
        }
        const stats = statisticsEngine.calculate(processed);
        const analysis = {
            companyId: request.companyId,
            companyName: request.companyName,
            timestamp: Date.now(),
            processed,
            stats,
        };
        await StorageManager.saveAnalysis(analysis);
        return {
            success: true,
            stats,
        };
    }
    catch (error) {
        console.error('[ServiceWorker] Error in handleAnalysis:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        console.log('[ServiceWorker] Extension installed');
        await StorageManager.saveSettings({
            maxEmployees: 50,
            enablePastEmployees: true,
            theme: 'auto',
        });
    }
    else if (details.reason === 'update') {
        console.log('[ServiceWorker] Extension updated');
        await StorageManager.cleanupOldData();
    }
});
chrome.alarms.create('cleanup', { periodInMinutes: 60 * 24 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'cleanup') {
        console.log('[ServiceWorker] Running cleanup');
        await StorageManager.cleanupOldData();
    }
});

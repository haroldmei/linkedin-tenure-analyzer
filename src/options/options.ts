import { StorageManager } from '@/utils/storage-manager';
import type { Theme } from '@/types';

class OptionsController {
  private maxEmployeesSlider: HTMLInputElement | null = null;
  private maxEmployeesValue: HTMLElement | null = null;
  private enablePastCheckbox: HTMLInputElement | null = null;
  private themeSelect: HTMLSelectElement | null = null;
  private saveButton: HTMLButtonElement | null = null;
  private saveStatus: HTMLElement | null = null;

  async init(): Promise<void> {
    this.initializeElements();
    await this.loadSettings();
    this.setupEventListeners();
  }

  private initializeElements(): void {
    this.maxEmployeesSlider = document.getElementById('max-employees') as HTMLInputElement;
    this.maxEmployeesValue = document.getElementById('max-employees-value');
    this.enablePastCheckbox = document.getElementById('enable-past-employees') as HTMLInputElement;
    this.themeSelect = document.getElementById('theme') as HTMLSelectElement;
    this.saveButton = document.getElementById('save-settings') as HTMLButtonElement;
    this.saveStatus = document.getElementById('save-status');
  }

  private async loadSettings(): Promise<void> {
    const settings = await StorageManager.getSettings();

    if (this.maxEmployeesSlider) {
      this.maxEmployeesSlider.value = settings.maxEmployees.toString();
    }

    if (this.maxEmployeesValue) {
      this.maxEmployeesValue.textContent = settings.maxEmployees.toString();
    }

    if (this.enablePastCheckbox) {
      this.enablePastCheckbox.checked = settings.enablePastEmployees;
    }

    if (this.themeSelect) {
      this.themeSelect.value = settings.theme;
    }
  }

  private setupEventListeners(): void {
    this.maxEmployeesSlider?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      if (this.maxEmployeesValue) {
        this.maxEmployeesValue.textContent = value;
      }
    });

    this.saveButton?.addEventListener('click', () => this.saveSettings());

    const clearCacheBtn = document.getElementById('clear-cache');
    clearCacheBtn?.addEventListener('click', () => this.clearCache());

    const clearAllDataBtn = document.getElementById('clear-all-data');
    clearAllDataBtn?.addEventListener('click', () => this.clearAllData());

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveSettings();
      }
    });
  }

  private async saveSettings(): Promise<void> {
    try {
      if (!this.maxEmployeesSlider || !this.enablePastCheckbox || !this.themeSelect) {
        throw new Error('Form elements not initialized');
      }

      const settings = {
        maxEmployees: parseInt(this.maxEmployeesSlider.value, 10),
        enablePastEmployees: this.enablePastCheckbox.checked,
        theme: this.themeSelect.value as Theme,
      };

      await StorageManager.saveSettings(settings);

      this.showSaveStatus('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('[Options] Error saving settings:', error);
      this.showSaveStatus('Failed to save settings', 'error');
    }
  }

  private showSaveStatus(message: string, type: 'success' | 'error'): void {
    if (!this.saveStatus) return;

    this.saveStatus.textContent = message;
    this.saveStatus.className = `save-status save-status-${type}`;
    this.saveStatus.style.display = 'inline';

    setTimeout(() => {
      if (this.saveStatus) {
        this.saveStatus.style.display = 'none';
      }
    }, 3000);
  }

  private async clearCache(): Promise<void> {
    if (!confirm('Clear cached analysis data? Your settings will be preserved.')) {
      return;
    }

    try {
      await StorageManager.clearCache();
      this.showSaveStatus('Cache cleared successfully', 'success');
    } catch (error) {
      console.error('[Options] Error clearing cache:', error);
      this.showSaveStatus('Failed to clear cache', 'error');
    }
  }

  private async clearAllData(): Promise<void> {
    if (!confirm('Clear ALL data including settings? This action cannot be undone.')) {
      return;
    }

    const confirmAgain = confirm('Are you absolutely sure? This will reset everything.');
    if (!confirmAgain) {
      return;
    }

    try {
      await StorageManager.clearAllData();
      this.showSaveStatus('All data cleared. Reloading...', 'success');
      
      setTimeout(() => {
        location.reload();
      }, 1500);
    } catch (error) {
      console.error('[Options] Error clearing data:', error);
      this.showSaveStatus('Failed to clear data', 'error');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const controller = new OptionsController();
  controller.init();
});


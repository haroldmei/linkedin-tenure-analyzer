import { SELECTORS } from './selectors';

export class PaginationHandler {
  private readonly MAX_PAGES = 10;
  private readonly BASE_DELAY = 1000;
  private readonly MAX_DELAY = 5000;

  async loadAllEmployees(maxCount: number): Promise<Element[]> {
    const employees: Element[] = [];
    let page = 1;

    while (employees.length < maxCount && page <= this.MAX_PAGES) {
      const newEmployees = this.getVisibleEmployees();

      for (const emp of newEmployees) {
        if (!this.isDuplicate(employees, emp)) {
          employees.push(emp);
        }
      }

      if (employees.length >= maxCount) break;

      const hasMore = await this.loadNextPage(page);
      if (!hasMore) break;

      page++;
    }

    return employees.slice(0, maxCount);
  }

  private getVisibleEmployees(): Element[] {
    const selectors = [SELECTORS.employeeCard.primary, ...SELECTORS.employeeCard.fallback];

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      if (elements.length > 0) {
        return elements;
      }
    }

    return [];
  }

  private async loadNextPage(currentPage: number): Promise<boolean> {
    const nextButton = this.findNextButton();
    if (!nextButton || !this.isButtonEnabled(nextButton)) {
      return false;
    }

    nextButton.click();
    await this.waitForNewContent(currentPage);

    return true;
  }

  private findNextButton(): HTMLElement | null {
    const selectors = [
      'button[aria-label*="Next"]',
      'button[aria-label*="next"]',
      '.artdeco-pagination__button--next',
      'button.pagination__next',
    ];

    for (const selector of selectors) {
      const button = document.querySelector(selector) as HTMLElement;
      if (button) return button;
    }

    return null;
  }

  private isButtonEnabled(button: HTMLElement): boolean {
    return !button.hasAttribute('disabled') && !button.classList.contains('disabled');
  }

  private async waitForNewContent(page: number): Promise<void> {
    const delay = Math.min(this.BASE_DELAY * Math.pow(1.5, page - 1), this.MAX_DELAY);
    await new Promise((resolve) => setTimeout(resolve, delay));

    await this.waitForCondition(() => !document.querySelector('.artdeco-spinner'), 3000);
  }

  private async waitForCondition(
    condition: () => boolean,
    timeout: number
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (condition()) return true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return false;
  }

  private isDuplicate(existing: Element[], newElement: Element): boolean {
    const newUrl = newElement.querySelector('a[href*="/in/"]')?.getAttribute('href');
    if (!newUrl) return false;

    return existing.some((el) => {
      const existingUrl = el.querySelector('a[href*="/in/"]')?.getAttribute('href');
      return existingUrl === newUrl;
    });
  }

  async waitForLoad(): Promise<void> {
    await this.waitForCondition(() => !document.querySelector('.artdeco-spinner'), 5000);
  }
}


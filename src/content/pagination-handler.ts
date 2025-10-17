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

  async expandPeopleSectionToMinimum(minCards: number): Promise<number> {
    console.log(`[PaginationHandler] Expanding People section to load at least ${minCards} cards...`);
    
    let cardCount = 0;
    let attempts = 0;
    const maxAttempts = 20;
    const seenCards = new Set<string>();

    while (cardCount < minCards && attempts < maxAttempts) {
      const visibleCards = this.getVisibleEmployees();
      
      // Count unique cards
      for (const card of visibleCards) {
        const url = card.querySelector('a[href*="/in/"]')?.getAttribute('href');
        if (url && !seenCards.has(url)) {
          seenCards.add(url);
          cardCount++;
        }
      }

      console.log(`[PaginationHandler] Expansion progress: ${cardCount}/${minCards} cards loaded`);

      if (cardCount >= minCards) {
        console.log(`[PaginationHandler] ✓ Reached minimum card count: ${cardCount}`);
        break;
      }

      // Try to find and click the "Show more results" button
      const showMoreButton = this.findShowMoreButton();
      if (!showMoreButton) {
        console.log(`[PaginationHandler] ⚠️ No "Show more results" button found. Final count: ${cardCount}/${minCards}`);
        break;
      }

      console.log(`[PaginationHandler] Clicking "Show more results" button...`);
      showMoreButton.click();
      
      // Wait for new content to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.waitForCondition(() => !document.querySelector('.artdeco-spinner'), 3000);

      attempts++;
    }

    if (cardCount < minCards) {
      console.log(`[PaginationHandler] ⚠️ Could only load ${cardCount}/${minCards} cards after ${attempts} attempts`);
    }

    return cardCount;
  }

  private getVisibleEmployees(): Element[] {
    const selectors = [SELECTORS.employeeCard.primary, ...SELECTORS.employeeCard.fallback];

    for (const selector of selectors) {
      const elements = Array.from(document.querySelectorAll(selector));
      console.log('[PaginationHandler] Trying selector:', selector, '→ Found:', elements.length, 'elements');
      if (elements.length > 0) {
        console.log('[PaginationHandler] ✓ Successfully found employee cards with selector:', selector);
        return elements;
      }
    }

    console.warn('[PaginationHandler] ⚠️ No employee cards found with any selector');
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

  private findShowMoreButton(): HTMLElement | null {
    // Look for "Show more results" button in the People section
    const selectors = [
      'button:contains("Show more results")',
      'button[aria-label*="Show more"]',
      'button[aria-label*="show more"]',
      'button:contains("See more")',
      'button:contains("Load more")',
      'button:contains("More")',
    ];

    // First try specific text matching
    for (const button of document.querySelectorAll('button')) {
      const buttonText = button.textContent?.trim() || '';
      if (buttonText.toLowerCase().includes('show more') || 
          buttonText.toLowerCase().includes('see more') ||
          buttonText.toLowerCase().includes('load more')) {
        console.log(`[PaginationHandler] Found button: "${buttonText}"`);
        return button;
      }
    }

    // Try aria-label matching
    for (const selector of selectors) {
      if (!selector.includes(':contains')) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          console.log(`[PaginationHandler] Found button with selector: ${selector}`);
          return element;
        }
      }
    }

    return null;
  }
}


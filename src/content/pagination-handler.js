import { SELECTORS } from './selectors';
export class PaginationHandler {
    constructor() {
        this.MAX_PAGES = 10;
        this.BASE_DELAY = 1000;
        this.MAX_DELAY = 5000;
    }
    async loadAllEmployees(maxCount) {
        const employees = [];
        let page = 1;
        while (employees.length < maxCount && page <= this.MAX_PAGES) {
            const newEmployees = this.getVisibleEmployees();
            for (const emp of newEmployees) {
                if (!this.isDuplicate(employees, emp)) {
                    employees.push(emp);
                }
            }
            if (employees.length >= maxCount)
                break;
            const hasMore = await this.loadNextPage(page);
            if (!hasMore)
                break;
            page++;
        }
        return employees.slice(0, maxCount);
    }
    getVisibleEmployees() {
        const selectors = [SELECTORS.employeeCard.primary, ...SELECTORS.employeeCard.fallback];
        for (const selector of selectors) {
            const elements = Array.from(document.querySelectorAll(selector));
            if (elements.length > 0) {
                return elements;
            }
        }
        return [];
    }
    async loadNextPage(currentPage) {
        const nextButton = this.findNextButton();
        if (!nextButton || !this.isButtonEnabled(nextButton)) {
            return false;
        }
        nextButton.click();
        await this.waitForNewContent(currentPage);
        return true;
    }
    findNextButton() {
        const selectors = [
            'button[aria-label*="Next"]',
            'button[aria-label*="next"]',
            '.artdeco-pagination__button--next',
            'button.pagination__next',
        ];
        for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button)
                return button;
        }
        return null;
    }
    isButtonEnabled(button) {
        return !button.hasAttribute('disabled') && !button.classList.contains('disabled');
    }
    async waitForNewContent(page) {
        const delay = Math.min(this.BASE_DELAY * Math.pow(1.5, page - 1), this.MAX_DELAY);
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.waitForCondition(() => !document.querySelector('.artdeco-spinner'), 3000);
    }
    async waitForCondition(condition, timeout) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (condition())
                return true;
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return false;
    }
    isDuplicate(existing, newElement) {
        const newUrl = newElement.querySelector('a[href*="/in/"]')?.getAttribute('href');
        if (!newUrl)
            return false;
        return existing.some((el) => {
            const existingUrl = el.querySelector('a[href*="/in/"]')?.getAttribute('href');
            return existingUrl === newUrl;
        });
    }
    async waitForLoad() {
        await this.waitForCondition(() => !document.querySelector('.artdeco-spinner'), 5000);
    }
}

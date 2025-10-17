import type { RawEmployee, SelectorSet } from '@/types';
import { SELECTORS } from './selectors';

export class EmployeeExtractor {
  extract(card: Element): RawEmployee | null {
    try {
      const profileUrl = this.extractProfileUrl(card);
      if (!profileUrl) return null;

      const title = this.extractWithFallback(card, SELECTORS.title);
      if (!title) return null;

      const startDate = this.extractStartDate(card);
      if (!startDate) return null;

      const name = this.extractWithFallback(card, SELECTORS.name);
      const location = this.extractLocation(card);

      return {
        name,
        title,
        startDate,
        profileUrl,
        location,
        isPast: false,
      };
    } catch (error) {
      console.error('[EmployeeExtractor] Error extracting employee:', error);
      return null;
    }
  }

  private extractWithFallback(element: Element, selectorSet: SelectorSet): string | null {
    const selectors = [selectorSet.primary, ...selectorSet.fallback];

    for (const selector of selectors) {
      const found = element.querySelector(selector);
      if (found) {
        const text = found.textContent?.trim();
        if (text) return text;
      }
    }

    return null;
  }

  private extractProfileUrl(card: Element): string | null {
    const linkElement = card.querySelector('a[href*="/in/"]');
    if (!linkElement) return null;

    const href = linkElement.getAttribute('href');
    if (!href) return null;

    try {
      const url = new URL(href, 'https://www.linkedin.com');
      return url.href;
    } catch {
      return href.startsWith('http') ? href : `https://www.linkedin.com${href}`;
    }
  }

  private extractStartDate(card: Element): string | null {
    const tenureText = this.extractWithFallback(card, SELECTORS.tenure);
    if (!tenureText) return null;

    const datePattern = /(\w+\s+\d{4}|\d{4})/;
    const match = tenureText.match(datePattern);

    return match ? match[1] : null;
  }

  private extractLocation(card: Element): string | null {
    const locationElement = card.querySelector('[class*="location"]');
    return locationElement?.textContent?.trim() || null;
  }
}


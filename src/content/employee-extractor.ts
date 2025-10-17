import type { RawEmployee, SelectorSet } from '@/types';
import { SELECTORS } from './selectors';

export class EmployeeExtractor {
  private companyName: string = '';
  private lastProfileFetchTime: number = 0;
  private readonly PROFILE_FETCH_DELAY_MS = 15000; // 15 seconds

  setCompanyName(name: string): void {
    this.companyName = name;
  }

  async extract(card: Element): Promise<RawEmployee | null> {
    try {
      const profileUrl = this.extractProfileUrl(card);
      if (!profileUrl) {
        console.debug('[EmployeeExtractor] ⚠️ Could not extract profile URL');
        return null;
      }

      const title = this.extractWithFallback(card, SELECTORS.title);
      if (!title) {
        console.debug('[EmployeeExtractor] ⚠️ Could not extract title from card');
        return null;
      }

      const name = this.extractWithFallback(card, SELECTORS.name);

      // Fetch and extract start date from employee's profile page
      console.debug('[EmployeeExtractor] Fetching profile page for tenure extraction:', profileUrl);
      const startDate = await this.extractStartDateFromProfile(profileUrl);
      
      if (!startDate) {
        console.debug('[EmployeeExtractor] ⚠️ Could not extract start date from profile');
        return null;
      }

      const location = this.extractLocation(card);

      console.debug('[EmployeeExtractor] ✓ Successfully extracted employee:', name || 'Unknown', '-', title);

      return {
        name: name ?? undefined,
        title,
        startDate,
        profileUrl,
        location: location ?? undefined,
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
        if (text) {
          console.debug('[EmployeeExtractor] Found text with selector:', selector);
          return text;
        }
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

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastFetch = now - this.lastProfileFetchTime;
    
    if (timeSinceLastFetch < this.PROFILE_FETCH_DELAY_MS) {
      const waitTime = this.PROFILE_FETCH_DELAY_MS - timeSinceLastFetch;
      console.debug(`[EmployeeExtractor] Rate limiting: waiting ${Math.ceil(waitTime / 1000)}s before next profile fetch`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  private async extractStartDateFromProfile(profileUrl: string): Promise<string | null> {
    try {
      // Apply rate limiting before fetching profile
      await this.waitForRateLimit();
      this.lastProfileFetchTime = Date.now();
      
      console.debug('[EmployeeExtractor] Extracting tenure from profile:', profileUrl);
      
      // Create hidden iframe to load profile
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = profileUrl;
      document.body.appendChild(iframe);
      
      // Wait for iframe to load
      await new Promise(resolve => {
        const onLoad = () => {
          iframe.removeEventListener('load', onLoad);
          resolve(null);
        };
        iframe.addEventListener('load', onLoad);
        // Timeout after 5 seconds
        setTimeout(() => {
          iframe.removeEventListener('load', onLoad);
          resolve(null);
        }, 5000);
      });
      
      // Give page time to render content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Extract start date from iframe DOM
      let startDate: string | null = null;
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          startDate = this.extractStartDateFromIframeDOM(iframeDoc);
        }
      } catch (error) {
        console.debug('[EmployeeExtractor] Could not access iframe content (CORS):', error);
        // Fall back to extracting from main page if we just loaded it
        startDate = this.extractStartDateFromIframeDOM(document);
      }
      
      // Clean up iframe
      document.body.removeChild(iframe);
      
      return startDate;
    } catch (error) {
      console.debug('[EmployeeExtractor] Error during profile extraction:', error);
      return null;
    }
  }

  private extractStartDateFromIframeDOM(doc: Document): string | null {
    console.debug('[EmployeeExtractor] Extracting dates from iframe DOM...');
    
    const allText = doc.body.textContent || '';
    
    // Pattern: "Jan 2020 – Present" or "Jan 2020 – Dec 2022"
    const dateRangePattern = /([A-Z][a-z]{2}\s+\d{4})\s*(?:–|–|-)\s*(?:Present|[A-Z][a-z]{2}\s+\d{4})/g;
    const dateMatches = allText.match(dateRangePattern);
    
    if (dateMatches && dateMatches.length > 0) {
      console.debug('[EmployeeExtractor] Found date ranges:', dateMatches.length);
      const firstMatch = dateMatches[0];
      const datePattern = /([A-Z][a-z]{2}\s+\d{4})/;
      const result = firstMatch.match(datePattern);
      if (result) {
        console.debug('[EmployeeExtractor] ✓ Extracted start date:', result[1]);
        return result[1];
      }
    }
    
    // Fallback: look for simple date patterns
    const simpleDatePattern = /\b([A-Z][a-z]{2}\s+\d{4})\b/g;
    const simpleDates = allText.match(simpleDatePattern);
    
    if (simpleDates && simpleDates.length > 0) {
      console.debug('[EmployeeExtractor] Found dates:', simpleDates.slice(0, 3));
      const now = new Date();
      const currentYear = now.getFullYear();
      
      for (const dateStr of simpleDates) {
        const year = parseInt(dateStr.split(' ')[1]);
        if (year >= 2000 && year <= currentYear) {
          console.debug('[EmployeeExtractor] ✓ Extracted start date:', dateStr);
          return dateStr;
        }
      }
    }
    
    console.debug('[EmployeeExtractor] No dates found in iframe');
    return null;
  }

  private parseStartDateFromProfileHTML(_html: string): string | null {
    // Deprecated - keeping for reference but not used
    console.debug('[EmployeeExtractor] HTML parsing no longer used (using DOM extraction instead)');
    return null;
  }

  private extractLocation(card: Element): string | null {
    const locationElement = card.querySelector('[class*="location"]');
    return locationElement?.textContent?.trim() || null;
  }
}


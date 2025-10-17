import type { RawEmployee, ProcessedEmployee, Confidence } from '@/types';

export class Validators {
  static isValidEmployee(employee: Partial<RawEmployee>): employee is RawEmployee {
    return !!(
      employee.title &&
      typeof employee.title === 'string' &&
      employee.startDate &&
      typeof employee.startDate === 'string' &&
      employee.profileUrl &&
      typeof employee.profileUrl === 'string' &&
      typeof employee.isPast === 'boolean'
    );
  }

  static calculateConfidence(employee: RawEmployee): Confidence {
    let score = 100;

    if (!employee.startDate) return 'low';

    if (employee.startDate.match(/^\d{4}$/)) score -= 20;
    if (employee.isPast && !employee.endDate) score -= 30;
    if (!employee.title) score -= 10;

    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  static sanitizeString(input: string | undefined): string {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
  }

  static isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'www.linkedin.com' || parsed.hostname === 'linkedin.com';
    } catch {
      return false;
    }
  }
}


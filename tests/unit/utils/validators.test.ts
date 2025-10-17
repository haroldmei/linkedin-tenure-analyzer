import { describe, it, expect } from 'vitest';
import { Validators } from '@/utils/validators';
import type { RawEmployee } from '@/types';

describe('Validators', () => {
  describe('isValidEmployee', () => {
    it('returns true for valid employee', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      expect(Validators.isValidEmployee(employee)).toBe(true);
    });

    it('returns false for employee without title', () => {
      const employee = {
        startDate: 'Jan 2020',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      } as RawEmployee;

      expect(Validators.isValidEmployee(employee)).toBe(false);
    });

    it('returns false for employee without startDate', () => {
      const employee = {
        title: 'Engineer',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      } as RawEmployee;

      expect(Validators.isValidEmployee(employee)).toBe(false);
    });

    it('returns false for employee without profileUrl', () => {
      const employee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        isPast: false,
      } as RawEmployee;

      expect(Validators.isValidEmployee(employee)).toBe(false);
    });
  });

  describe('calculateConfidence', () => {
    it('returns high confidence for complete data', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        endDate: 'Dec 2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      expect(Validators.calculateConfidence(employee)).toBe('high');
    });

    it('returns medium confidence for year-only dates', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: '2020',
        endDate: '2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      expect(Validators.calculateConfidence(employee)).toBe('high');
    });

    it('returns low confidence for missing end date on past employee', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: '2020',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      expect(Validators.calculateConfidence(employee)).toBe('medium');
    });

    it('returns low confidence for missing start date', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: '',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      expect(Validators.calculateConfidence(employee)).toBe('low');
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(Validators.sanitizeString('  test  ')).toBe('test');
    });

    it('removes dangerous characters', () => {
      expect(Validators.sanitizeString('test<script>alert(1)</script>')).toBe(
        'testscriptalert(1)/script'
      );
    });

    it('returns empty string for undefined', () => {
      expect(Validators.sanitizeString(undefined)).toBe('');
    });

    it('returns empty string for empty input', () => {
      expect(Validators.sanitizeString('')).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid LinkedIn URLs', () => {
      expect(Validators.isValidUrl('https://www.linkedin.com/in/test')).toBe(true);
      expect(Validators.isValidUrl('https://linkedin.com/in/test')).toBe(true);
    });

    it('returns false for non-LinkedIn URLs', () => {
      expect(Validators.isValidUrl('https://example.com/test')).toBe(false);
      expect(Validators.isValidUrl('https://facebook.com/test')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(Validators.isValidUrl('not a url')).toBe(false);
      expect(Validators.isValidUrl('')).toBe(false);
    });
  });
});


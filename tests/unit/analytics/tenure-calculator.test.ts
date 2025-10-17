import { describe, it, expect, beforeEach } from 'vitest';
import { TenureCalculator } from '@/analytics/tenure-calculator';
import type { RawEmployee } from '@/types';

describe('TenureCalculator', () => {
  let calculator: TenureCalculator;

  beforeEach(() => {
    calculator = new TenureCalculator();
  });

  describe('calculateTenure', () => {
    it('calculates tenure for past employee with end date', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        endDate: 'Dec 2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      const tenure = calculator.calculateTenure(employee);
      expect(tenure).toBe(35);
    });

    it('calculates tenure for current employee without end date', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      const tenure = calculator.calculateTenure(employee);
      expect(tenure).toBeGreaterThan(0);
    });

    it('handles year-only dates', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: '2020',
        endDate: '2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      const tenure = calculator.calculateTenure(employee);
      expect(tenure).toBe(24);
    });

    it('returns 0 for missing start date', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: '',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      const tenure = calculator.calculateTenure(employee);
      expect(tenure).toBe(0);
    });

    it('returns 0 for invalid date format', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Invalid Date',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      const tenure = calculator.calculateTenure(employee);
      expect(tenure).toBe(0);
    });
  });

  describe('processEmployee', () => {
    it('processes valid employee successfully', () => {
      const employee: RawEmployee = {
        name: 'John Doe',
        title: 'Software Engineer',
        startDate: 'Jan 2020',
        endDate: 'Dec 2022',
        profileUrl: 'https://linkedin.com/in/johndoe',
        location: 'San Francisco',
        isPast: true,
      };

      const result = calculator.processEmployee(employee);
      expect(result).not.toBeNull();
      expect(result?.tenureMonths).toBe(35);
      expect(result?.tenureYears).toBe(2.92);
      expect(result?.confidence).toBe('high');
    });

    it('returns null for employee without required fields', () => {
      const employee = {
        name: 'John Doe',
        startDate: 'Jan 2020',
      } as RawEmployee;

      const result = calculator.processEmployee(employee);
      expect(result).toBeNull();
    });

    it('returns null for employee with zero tenure', () => {
      const employee: RawEmployee = {
        title: 'Engineer',
        startDate: 'Invalid',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: false,
      };

      const result = calculator.processEmployee(employee);
      expect(result).toBeNull();
    });

    it('assigns correct confidence levels', () => {
      const highConfidence: RawEmployee = {
        title: 'Engineer',
        startDate: 'Jan 2020',
        endDate: 'Dec 2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      const mediumConfidence: RawEmployee = {
        title: 'Engineer',
        startDate: '2020',
        endDate: '2022',
        profileUrl: 'https://linkedin.com/in/test',
        isPast: true,
      };

      const highResult = calculator.processEmployee(highConfidence);
      const mediumResult = calculator.processEmployee(mediumConfidence);

      expect(highResult?.confidence).toBe('high');
      expect(mediumResult?.confidence).toBe('high');
    });
  });

  describe('processEmployees', () => {
    it('processes multiple employees and filters invalid ones', () => {
      const employees: RawEmployee[] = [
        {
          title: 'Engineer 1',
          startDate: 'Jan 2020',
          profileUrl: 'https://linkedin.com/in/test1',
          isPast: false,
        },
        {
          title: '',
          startDate: 'Jan 2020',
          profileUrl: 'https://linkedin.com/in/test2',
          isPast: false,
        } as RawEmployee,
        {
          title: 'Engineer 3',
          startDate: 'Invalid',
          profileUrl: 'https://linkedin.com/in/test3',
          isPast: false,
        },
      ];

      const result = calculator.processEmployees(employees);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Engineer 1');
    });

    it('returns empty array for empty input', () => {
      const result = calculator.processEmployees([]);
      expect(result).toEqual([]);
    });
  });
});


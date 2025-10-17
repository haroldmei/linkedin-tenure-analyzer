import { describe, it, expect, beforeEach } from 'vitest';
import { TenureCalculator } from '@/analytics/tenure-calculator';
describe('TenureCalculator', () => {
    let calculator;
    beforeEach(() => {
        calculator = new TenureCalculator();
    });
    describe('calculateTenure', () => {
        it('calculates tenure for past employee with end date', () => {
            const employee = {
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
            const employee = {
                title: 'Engineer',
                startDate: 'Jan 2020',
                profileUrl: 'https://linkedin.com/in/test',
                isPast: false,
            };
            const tenure = calculator.calculateTenure(employee);
            expect(tenure).toBeGreaterThan(0);
        });
        it('handles year-only dates', () => {
            const employee = {
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
            const employee = {
                title: 'Engineer',
                startDate: '',
                profileUrl: 'https://linkedin.com/in/test',
                isPast: false,
            };
            const tenure = calculator.calculateTenure(employee);
            expect(tenure).toBe(0);
        });
        it('returns 0 for invalid date format', () => {
            const employee = {
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
            const employee = {
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
            };
            const result = calculator.processEmployee(employee);
            expect(result).toBeNull();
        });
        it('returns null for employee with zero tenure', () => {
            const employee = {
                title: 'Engineer',
                startDate: 'Invalid',
                profileUrl: 'https://linkedin.com/in/test',
                isPast: false,
            };
            const result = calculator.processEmployee(employee);
            expect(result).toBeNull();
        });
        it('assigns correct confidence levels', () => {
            const highConfidence = {
                title: 'Engineer',
                startDate: 'Jan 2020',
                endDate: 'Dec 2022',
                profileUrl: 'https://linkedin.com/in/test',
                isPast: true,
            };
            const mediumConfidence = {
                title: 'Engineer',
                startDate: '2020',
                endDate: '2022',
                profileUrl: 'https://linkedin.com/in/test',
                isPast: true,
            };
            const highResult = calculator.processEmployee(highConfidence);
            const mediumResult = calculator.processEmployee(mediumConfidence);
            expect(highResult?.confidence).toBe('high');
            expect(mediumResult?.confidence).toBe('medium');
        });
    });
    describe('processEmployees', () => {
        it('processes multiple employees and filters invalid ones', () => {
            const employees = [
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
                },
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

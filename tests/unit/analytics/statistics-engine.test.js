import { describe, it, expect, beforeEach } from 'vitest';
import { StatisticsEngine } from '@/analytics/statistics-engine';
describe('StatisticsEngine', () => {
    let engine;
    beforeEach(() => {
        engine = new StatisticsEngine();
    });
    const createEmployee = (tenureMonths, isPast = false, confidence = 'high') => ({
        title: 'Engineer',
        startDate: 'Jan 2020',
        profileUrl: 'https://linkedin.com/in/test',
        isPast,
        tenureMonths,
        tenureYears: tenureMonths / 12,
        confidence,
    });
    describe('calculate', () => {
        it('calculates correct statistics for sample data', () => {
            const employees = [
                createEmployee(12),
                createEmployee(24),
                createEmployee(36),
                createEmployee(48),
                createEmployee(60),
            ];
            const stats = engine.calculate(employees);
            expect(stats.count).toBe(5);
            expect(stats.mean).toBe(36);
            expect(stats.median).toBe(36);
            expect(stats.min).toBe(12);
            expect(stats.max).toBe(60);
        });
        it('separates current and past employees', () => {
            const employees = [
                createEmployee(12, false),
                createEmployee(24, false),
                createEmployee(36, true),
                createEmployee(48, true),
            ];
            const stats = engine.calculate(employees);
            expect(stats.currentCount).toBe(2);
            expect(stats.pastCount).toBe(2);
            expect(stats.count).toBe(4);
        });
        it('calculates percentiles correctly', () => {
            const employees = Array.from({ length: 100 }, (_, i) => createEmployee(i + 1));
            const stats = engine.calculate(employees);
            expect(stats.p25).toBe(25);
            expect(stats.p75).toBe(75);
            expect(stats.p90).toBe(90);
        });
        it('generates histogram with correct bins', () => {
            const employees = [
                createEmployee(3),
                createEmployee(8),
                createEmployee(18),
                createEmployee(30),
                createEmployee(48),
                createEmployee(84),
                createEmployee(150),
            ];
            const stats = engine.calculate(employees);
            expect(stats.histogram['0-6m']).toBe(1);
            expect(stats.histogram['6-12m']).toBe(1);
            expect(stats.histogram['1-2y']).toBe(1);
            expect(stats.histogram['2-3y']).toBe(1);
            expect(stats.histogram['3-5y']).toBe(1);
            expect(stats.histogram['5-10y']).toBe(1);
            expect(stats.histogram['10y+']).toBe(1);
        });
        it('assesses data quality correctly', () => {
            const employees = [
                createEmployee(12, false, 'high'),
                createEmployee(24, false, 'medium'),
                createEmployee(36, true, 'low'),
                { ...createEmployee(48), startDate: '' },
                { ...createEmployee(60, true), endDate: undefined },
            ];
            const stats = engine.calculate(employees);
            expect(stats.dataQuality.missingStartDate).toBe(1);
            expect(stats.dataQuality.missingEndDate).toBe(1);
            expect(stats.dataQuality.ambiguousDates).toBe(1);
        });
        it('handles empty employee array', () => {
            const stats = engine.calculate([]);
            expect(stats.count).toBe(0);
            expect(stats.mean).toBe(0);
            expect(stats.median).toBe(0);
            expect(stats.min).toBe(0);
            expect(stats.max).toBe(0);
        });
        it('handles single employee', () => {
            const employees = [createEmployee(24)];
            const stats = engine.calculate(employees);
            expect(stats.count).toBe(1);
            expect(stats.mean).toBe(24);
            expect(stats.median).toBe(24);
            expect(stats.min).toBe(24);
            expect(stats.max).toBe(24);
        });
    });
});

import { describe, it, expect } from 'vitest';
import { DateParser } from '@/utils/date-parser';
describe('DateParser', () => {
    const parser = new DateParser();
    describe('parse', () => {
        it('parses month and year format (Jan 2020)', () => {
            const result = parser.parse('Jan 2020');
            expect(result).toBeInstanceOf(Date);
            expect(result?.getFullYear()).toBe(2020);
            expect(result?.getMonth()).toBe(0);
        });
        it('parses full month name (January 2020)', () => {
            const result = parser.parse('January 2020');
            expect(result).toBeInstanceOf(Date);
            expect(result?.getFullYear()).toBe(2020);
            expect(result?.getMonth()).toBe(0);
        });
        it('parses year only format (2020)', () => {
            const result = parser.parse('2020');
            expect(result).toBeInstanceOf(Date);
            expect(result?.getFullYear()).toBe(2020);
            expect(result?.getMonth()).toBe(6);
        });
        it('parses various month abbreviations', () => {
            const months = [
                ['Feb 2020', 1],
                ['Mar 2020', 2],
                ['Apr 2020', 3],
                ['May 2020', 4],
                ['Jun 2020', 5],
                ['Jul 2020', 6],
                ['Aug 2020', 7],
                ['Sep 2020', 8],
                ['Oct 2020', 9],
                ['Nov 2020', 10],
                ['Dec 2020', 11],
            ];
            months.forEach(([dateStr, expectedMonth]) => {
                const result = parser.parse(dateStr);
                expect(result?.getMonth()).toBe(expectedMonth);
            });
        });
        it('returns null for invalid date strings', () => {
            expect(parser.parse('Invalid')).toBeNull();
            expect(parser.parse('')).toBeNull();
            expect(parser.parse('Not a date')).toBeNull();
        });
        it('returns null for null or undefined input', () => {
            expect(parser.parse(null)).toBeNull();
            expect(parser.parse(undefined)).toBeNull();
        });
        it('handles extra whitespace', () => {
            const result = parser.parse('  Jan 2020  ');
            expect(result).toBeInstanceOf(Date);
            expect(result?.getFullYear()).toBe(2020);
            expect(result?.getMonth()).toBe(0);
        });
    });
});

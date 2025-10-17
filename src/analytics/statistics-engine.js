export class StatisticsEngine {
    calculate(employees) {
        if (employees.length === 0) {
            return this.getEmptyStats();
        }
        const tenures = employees.map((e) => e.tenureMonths).sort((a, b) => a - b);
        const current = employees.filter((e) => !e.isPast);
        const past = employees.filter((e) => e.isPast);
        return {
            count: employees.length,
            currentCount: current.length,
            pastCount: past.length,
            mean: this.calculateMean(tenures),
            median: this.calculatePercentile(tenures, 50),
            p25: this.calculatePercentile(tenures, 25),
            p75: this.calculatePercentile(tenures, 75),
            p90: this.calculatePercentile(tenures, 90),
            min: tenures[0] || 0,
            max: tenures[tenures.length - 1] || 0,
            histogram: this.generateHistogram(tenures),
            dataQuality: this.assessQuality(employees),
        };
    }
    calculateMean(values) {
        if (values.length === 0)
            return 0;
        const sum = values.reduce((a, b) => a + b, 0);
        return parseFloat((sum / values.length).toFixed(1));
    }
    calculatePercentile(sorted, percentile) {
        if (sorted.length === 0)
            return 0;
        const index = Math.ceil((percentile / 100) * sorted.length) - 1;
        return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
    }
    generateHistogram(tenures) {
        const bins = {
            '0-6m': 0,
            '6-12m': 0,
            '1-2y': 0,
            '2-3y': 0,
            '3-5y': 0,
            '5-10y': 0,
            '10y+': 0,
        };
        for (const months of tenures) {
            if (months < 6)
                bins['0-6m']++;
            else if (months < 12)
                bins['6-12m']++;
            else if (months < 24)
                bins['1-2y']++;
            else if (months < 36)
                bins['2-3y']++;
            else if (months < 60)
                bins['3-5y']++;
            else if (months < 120)
                bins['5-10y']++;
            else
                bins['10y+']++;
        }
        return bins;
    }
    assessQuality(employees) {
        return {
            missingStartDate: employees.filter((e) => !e.startDate).length,
            missingEndDate: employees.filter((e) => e.isPast && !e.endDate).length,
            ambiguousDates: employees.filter((e) => e.confidence === 'low').length,
        };
    }
    getEmptyStats() {
        return {
            count: 0,
            currentCount: 0,
            pastCount: 0,
            mean: 0,
            median: 0,
            p25: 0,
            p75: 0,
            p90: 0,
            min: 0,
            max: 0,
            histogram: {
                '0-6m': 0,
                '6-12m': 0,
                '1-2y': 0,
                '2-3y': 0,
                '3-5y': 0,
                '5-10y': 0,
                '10y+': 0,
            },
            dataQuality: {
                missingStartDate: 0,
                missingEndDate: 0,
                ambiguousDates: 0,
            },
        };
    }
}

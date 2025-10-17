import { DateParser } from '@/utils/date-parser';
import { Validators } from '@/utils/validators';
export class TenureCalculator {
    constructor() {
        this.dateParser = new DateParser();
    }
    calculateTenure(employee) {
        const start = this.dateParser.parse(employee.startDate);
        if (!start)
            return 0;
        const end = employee.endDate
            ? this.dateParser.parse(employee.endDate)
            : new Date();
        if (!end)
            return 0;
        const months = (end.getFullYear() - start.getFullYear()) * 12 +
            (end.getMonth() - start.getMonth());
        return Math.max(0, months);
    }
    processEmployee(employee) {
        if (!Validators.isValidEmployee(employee)) {
            return null;
        }
        const tenureMonths = this.calculateTenure(employee);
        if (tenureMonths === 0) {
            return null;
        }
        const tenureYears = parseFloat((tenureMonths / 12).toFixed(2));
        const confidence = Validators.calculateConfidence(employee);
        return {
            ...employee,
            name: Validators.sanitizeString(employee.name),
            title: Validators.sanitizeString(employee.title),
            location: Validators.sanitizeString(employee.location),
            tenureMonths,
            tenureYears,
            confidence,
        };
    }
    processEmployees(employees) {
        const processed = [];
        for (const employee of employees) {
            const result = this.processEmployee(employee);
            if (result) {
                processed.push(result);
            }
        }
        return processed;
    }
}

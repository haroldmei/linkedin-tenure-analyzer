export class Validators {
    static isValidEmployee(employee) {
        return !!(employee.title &&
            typeof employee.title === 'string' &&
            employee.startDate &&
            typeof employee.startDate === 'string' &&
            employee.profileUrl &&
            typeof employee.profileUrl === 'string' &&
            typeof employee.isPast === 'boolean');
    }
    static calculateConfidence(employee) {
        let score = 100;
        if (!employee.startDate)
            return 'low';
        if (employee.startDate.match(/^\d{4}$/))
            score -= 20;
        if (employee.isPast && !employee.endDate)
            score -= 30;
        if (!employee.title)
            score -= 10;
        if (score >= 80)
            return 'high';
        if (score >= 50)
            return 'medium';
        return 'low';
    }
    static sanitizeString(input) {
        if (!input)
            return '';
        return input.trim().replace(/[<>]/g, '');
    }
    static isValidUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.hostname === 'www.linkedin.com' || parsed.hostname === 'linkedin.com';
        }
        catch {
            return false;
        }
    }
}

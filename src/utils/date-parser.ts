export class DateParser {
  private readonly monthMap: Record<string, number> = {
    jan: 0, january: 0,
    feb: 1, february: 1,
    mar: 2, march: 2,
    apr: 3, april: 3,
    may: 4,
    jun: 5, june: 5,
    jul: 6, july: 6,
    aug: 7, august: 7,
    sep: 8, september: 8,
    oct: 9, october: 9,
    nov: 10, november: 10,
    dec: 11, december: 11,
  };

  parse(dateString: string): Date | null {
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }

    const trimmed = dateString.trim();
    
    const monthYearPattern = /(\w+)\s+(\d{4})/;
    const monthYearMatch = trimmed.match(monthYearPattern);
    
    if (monthYearMatch) {
      const month = this.parseMonth(monthYearMatch[1]);
      const year = parseInt(monthYearMatch[2], 10);
      
      if (month !== null && !isNaN(year)) {
        return new Date(year, month, 1);
      }
    }

    const yearOnlyPattern = /^(\d{4})$/;
    const yearOnlyMatch = trimmed.match(yearOnlyPattern);
    
    if (yearOnlyMatch) {
      const year = parseInt(yearOnlyMatch[1], 10);
      if (!isNaN(year)) {
        return new Date(year, 6, 1);
      }
    }

    return null;
  }

  private parseMonth(monthStr: string): number | null {
    const normalized = monthStr.toLowerCase().trim();
    
    if (normalized in this.monthMap) {
      return this.monthMap[normalized];
    }

    for (const key in this.monthMap) {
      if (key.startsWith(normalized.substring(0, 3))) {
        return this.monthMap[key];
      }
    }

    return null;
  }
}


export default function getLastMonthString(format: string = 'YYYY-MM'): string {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);

    const year = lastMonth.getFullYear();
    const month = String(lastMonth.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed

    if (format === 'YYYY-MM') {
        return `${year}-${month}`;
    } else if (format === 'MM-YYYY') {
        return `${month}-${year}`;
    } else if (format === 'YYYYMM') {
        return `${year}${month}`;
    } else if (format === 'MMYYYY') {
        return `${month}${year}`;
    } else if (format === 'YYYY/MM') {
        return `${year}/${month}`;
    } else if (format === 'MM/YYYY') {
        return `${month}/${year}`;
    } else if (format === 'MMMM YYYY') {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
        return `${monthNames[lastMonth.getMonth()]} ${year}`;
    } else {
        // Default format if an invalid format is provided
        return `${year}-${month}`;
    }
}

// Example usage:
console.log(getLastMonthString()); // Output: YYYY-MM (e.g., "2023-10")
console.log(getLastMonthString('MM-YYYY')); // Output: MM-YYYY (e.g., "10-2023")
console.log(getLastMonthString('YYYYMM')); // Output: YYYYMM (e.g., "202310")
console.log(getLastMonthString('MMYYYY')); // Output: MMYYYY (e.g., "102023")
console.log(getLastMonthString('YYYY/MM')); // Output: YYYY/MM (e.g., "2023/10")
console.log(getLastMonthString('MM/YYYY')); // Output: MM/YYYY (e.g., "10/2023")
console.log(getLastMonthString('MMMM YYYY')); // Output: MMMM YYYY (e.g., "October 2023")
console.log(getLastMonthString("invalid")); // Output: YYYY-MM (e.g., "2023-10")
export default function convertDateString(dateString: string) {
    try {
        const [year, month] = dateString.split('-').map(Number);

        if (isNaN(year) || isNaN(month) || year < 1900 || year > 2100 || month < 1 || month > 12) {
            return "Invalid date format";
        }

        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return `${months[month - 1]} ${year}`;

    } catch (error) {
        return "Invalid date format";
    }
}

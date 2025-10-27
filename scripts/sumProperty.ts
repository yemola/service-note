import { Report } from '../config/db';

export default function sumProperty(array: Report[], property: keyof Report): number {
    if (!Array.isArray(array)) {
        return 0;
    }

    return array.reduce((sum, obj) => {
        if (typeof obj[property] === 'number') {
            return sum + obj[property];
        }
        return sum;
    }, 0);
}
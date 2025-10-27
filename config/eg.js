[{ "id": 1, "month": "2025-03", "name": "Richard", "student_id": 3 },
{ "id": 2, "month": "2025-04", "name": "Erico", "student_id": 3 },
{ "id": 3, "month": "2025-04", "name": "Kofi Adams", "student_id": 6 },
{ "id": 4, "month": "2025-04", "name": "Kofi Adams", "student_id": 6 },
{ "id": 5, "month": "2025-04", "name": "Tom Jerry", "student_id": 6 },
{ "id": 6, "month": "2025-04", "name": "Richard", "student_id": 9 },
{ "id": 7, "month": "2025-04", "name": "Michael Mishun", "student_id": 8 },
{ "id": 8, "month": "2025-03", "name": "Erico", "student_id": 3 },
{ "id": 9, "month": "2025-03", "name": "Richard", "student_id": 9 },
{ "id": 10, "month": "2025-03", "name": "Michael Mishun", "student_id": 8 },
{ "id": 11, "month": "2025-03", "name": "Richard", "student_id": 9 },
{ "id": 12, "month": "2025-03", "name": "Michael Mishun", "student_id": 8 },
{ "id": 13, "month": "2025-03", "name": "Richard", "student_id": 9 },
{ "id": 14, "month": "2025-04", "name": "Erico", "student_id": 3 },
{ "id": 15, "month": "2025-04", "name": "Michael Mishun", "student_id": 8 },
{ "id": 16, "month": "2025-03", "name": "Erico", "student_id": 3 },
{ "id": 17, "month": "2025-03", "name": "Michael Mishun", "student_id": 8 }]



const fetchAllStudents = async () => {
    try {
        const db = await openDatabase();
        const result = await getAllStudents();
        return result;
    } catch (error) {
        console.log('Error fething all students: ', error);
    }
}

const { data: allStudents } = useQuery({
    queryKey: ['all-students'],
    queryFn: fetchAllStudents
});
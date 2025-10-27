import { MonthlyReport } from '@/app/(tabs)/report';
import { StudentsAndIntListProps } from '@/components/form/AppInterestPicker';
import * as SQLite from 'expo-sqlite';

interface Auth {
    id: number;
    name: string;
    secretary?: string;
    groupOverseer?: string;
    email?: string;
    password?: string;
    isCloudEnabled: boolean;
}

export interface InterestedPerson {
    id: number;
    userId: number;
    name: string;
    address?: string;
    appointment: string;
    latitude: number;
    longitude: number;
    phone?: string;
    placement?: string;
    topic?: string;
    note?: string;
    last_visit?: string;
}

export interface BibleStudy {
    id: number;
    userId: number;
    student_name: string;
    phone?: string;
    address?: string;
    study_day: string;
    latitude: number;
    longitude: number;
    study_material: string;
    note?: string;
}

export interface Note {
    id: number;
    userId: number;
    title: string;
    content: string;
    date_created: string;
}

export interface Report {
    id: number;
    date: string;
    placements: number;
    hours: number;
    return_visits: number;
    studies: number;
    comments: string;
}

export interface RecentReportProp {
    id: number;
    month: string;
    hours: number;
    placements: number;
    return_visits: number;
    studies: number;
}

interface SQLiteResult {
    rowsAffected: number;
    insertId?: number;
    rows: {
        length: number;
        item: (index: number) => any;
        _array: any[];
    };
}

// export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
//     return await SQLite.openDatabaseAsync('servicenotedb');
// };

let databaseInstance: SQLite.SQLiteDatabase | null = null;

export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (databaseInstance) {
        return databaseInstance;
    }
    databaseInstance = await SQLite.openDatabaseAsync('servicenotedb');
    return databaseInstance;
};

export const initializeDatabase = async () => {
    try {
        const db = await openDatabase();
        await db.execAsync(`PRAGMA journal_mode = WAL;`);

        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS auth (id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    name TEXT NOT NULL, 
                    email TEXT UNIQUE,
                    secretary TEXT,
                    groupOverseer TEXT,
                    password TEXT,
                    isCouldEnabled INTEGER DEFAULT 0,
                    synced INTEGER DEFAULT 0);
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS interested_person (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            name TEXT NOT NULL, 
                            address TEXT, 
                            phone TEXT, 
                            placement TEXT,
                            topic TEXT,
                            appointment TEXT,
                            latitude REAL,
                            longitude REAL,
                            note TEXT, 
                            last_visit TEXT,
                            synced INTEGER DEFAULT 0,
                            user_id INTEGER DEFAULT 1
                        );
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS bible_studies (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            student_name TEXT NOT NULL,
                            phone TEXT,
                            address TEXT, 
                            study_material TEXT,
                            note TEXT, 
                            study_day TEXT,
                            latitude REAL,
                            longitude REAL,
                            synced INTEGER DEFAULT 0,
                            user_id INTEGER DEFAULT 1
                        );
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS students_per_month (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_id INTEGER NOT NULL,
                        name TEXT,
                        month TEXT
                        );
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS notes (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            title TEXT NOT NULL, 
                            content TEXT NOT NULL, 
                            date_created TEXT,
                            synced INTEGER DEFAULT 0,
                            user_id INTEGER DEFAULT 1
                        );
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS report (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            date TEXT NOT NULL, 
                            hours REAL NOT NULL,
                            placements INTEGER, 
                            return_visits INTEGER, 
                            studies INTEGER, 
                            comments TEXT,
                            synced INTEGER DEFAULT 0,
                            user_id INTEGER DEFAULT 1
                        );
                    `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS monthly_report (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        month TEXT NOT NULL,
                        hours REAL,
                        placements INTEGER,
                        return_visits INTEGER,
                        studies INTEGER,
                        comments TEXT
                        );
                        `);

        await db.execAsync(`
                        CREATE TABLE IF NOT EXISTS fs_report (
                            id INTEGER PRIMARY KEY AUTOINCREMENT, 
                            date TEXT NOT NULL, 
                            hours REAL NOT NULL,
                            placements INTEGER, 
                            return_visits INTEGER, 
                            studies INTEGER, 
                            comments TEXT,
                            synced INTEGER DEFAULT 0,
                            user_id INTEGER DEFAULT 1
                        );
                    `);

        console.log('All tables initialized');
    } catch (error) {
        console.error('Error initializing database', error);
    }
}

export const addNote = async (
    title: string,
    content: string,
    date_created: string,
) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(`
            INSERT OR IGNORE INTO notes 
                (title, content, date_created) 
                VALUES (?, ?, ?);`, [title, content, date_created])

        console.log('AddNote Result: ', result);
    } catch (error) {
        console.log('Error adding note to table');
    }
}

// For Insertion of new record or an update of existing record
export const addMonthlyReportTotal = async (
    month: string,
    hours: number,
    placements: number,
    return_visits: number,
    studies: number
): Promise<{ success: boolean; message?: string }> => {
    try {
        const db = await openDatabase();

        const reportExistRes = await db.getAllAsync(`
            SELECT * FROM monthly_report WHERE month = ?;`, [month]);

        const reportExist = reportExistRes.length > 0;

        if (!reportExist) {
            await db.runAsync(`
                INSERT INTO monthly_report
                (month, hours, placements, return_visits, studies)
                VALUES (?, ?, ?, ?, ?);`, [month, hours, placements, return_visits, studies]);

            console.log('Monthly report saved successfully: ', month);
            return { success: true, message: 'Monthly report saved successfully.' };
        } else {
            await db.runAsync(`
                UPDATE monthly_report
                SET hours = ?, placements = ?, return_visits = ?, studies = ?
                WHERE month = ?;`, [hours, placements, return_visits, studies, month]);

            console.log('Monthly report updated successfully: ', month);
            return { success: true, message: 'Monthly report updated successfully.' };
        }
    } catch (error) {
        console.error('Error saving/updating monthly report: ', error);
        return { success: false, message: `Error: ${error}` };
    }
};

export const addReport = async (
    date: string,
    hours: number,
    placements: number,
    return_visits: number,
    studies: number,
    comments: string,
) => {
    try {
        const db = await openDatabase();

        await db.runAsync(`
            INSERT OR IGNORE INTO fs_report 
                (date, hours, placements, return_visits, studies, comments) 
                VALUES (?, ?, ?, ?, ?, ?);`, [date, hours, placements, return_visits, studies, comments]
        );
        console.log('Report added successfully');

    } catch (error) {
        console.log('Error adding report to table', error);
    }
}

export const addUser = async () => {
    try {
        const db = await openDatabase();

        await db.runAsync(`
            INSERT OR IGNORE INTO auth 
                (name, isCouldEnabled, synced) 
                VALUES (?, ?, ?);`, ["User", 0, 0]
        );

        console.log("User successfully added.");
    } catch (error) {
        console.error("Error adding user", error);
    }
}

export const addInterestedPerson = async (
    name: string,
    last_visit: string,
    address: string,
    phone: string,
    topic: string,
    placement: string,
    appointment: string,
    note: string,
    latitude: number,
    longitude: number,
    // callback?: (result: SQLiteResult) => void
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `INSERT INTO interested_person (name, address, phone, placement, appointment, topic, note, last_visit, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [name, address, phone, placement, appointment, topic, note, last_visit, latitude, longitude]
        );

        console.log("Result: ", result);
    } catch (error) {
        console.error('❌ Error adding return visit', error);
    }
}

export const addStudentsByName = async (
    student_id: number,
    name: string,
    month: string
) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(`
            INSERT INTO students_per_month (student_id, name, month) VALUES (?, ?, ?)
            ;`, [student_id, name, month]);

        console.log('StudentsByName: ', result);
    } catch (error) {

    }
}

export const addBibleStudent = async (
    student_name: string,
    address: string,
    phone: string,
    study_material: string,
    study_day: string,
    note: string,
    latitude: number,
    longitude: number,
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `INSERT INTO bible_studies (student_name, address, phone, study_material, study_day, note, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [student_name, address, phone, study_material, study_day, note, latitude, longitude]
        );

        console.log("Result: ", result);
    } catch (error) {
        console.log('Error adding students: ', error);
    }
}

export const deleteNote = async (id: number) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(
            `DELETE FROM notes WHERE id = ?;`,
            [id]
        )
        console.log('Deleted successfully: ', result);
    } catch (error) {
        console.log('Error deleting note: ', error);
    }
}

export const deleteSingleReport = async (id: number) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(
            `DELETE FROM fs_report WHERE id = ?;`,
            [id]
        );

        console.log("Delete record with id: ", id);
    } catch (error) {
        console.error('Error deleting report: ', error);
    }
}

export const deleteInterestedPerson = async (
    id: number
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `DELETE FROM interested_person WHERE id = ?;`,
            [id]
        );

        console.log("Deleted record with id:", id);

    } catch (error) {
        console.error('❌ Error deleting return visit', error);
    }
};

export const deleteBibleStudent = async (id: number) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `DELETE FROM bible_studies WHERE id = ?;`,
            [id]
        );

        const resp = await db.runAsync(
            `DELETE FROM students_per_month WHERE student_id = ?;`,
            [id]
        );
        console.log("Deleted student with id:", id);

    } catch (error) {
        console.error('❌ Error deleting student', error);
    }
}

export const getLastMonthReport = async (month: string): Promise<MonthlyReport[]> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<MonthlyReport>(`SELECT * FROM monthly_report WHERE month = ?;`, [month]);

        if (result.length > 0) {
            console.log('test: ', result);
            return result;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching last month report: ', error);
        return [];
    }
};

export const getMostRecentMonthsReport = async (numOfMonths: number = 3): Promise<RecentReportProp[]> => {
    try {
        const db = await openDatabase();

        const result = await db.getAllAsync<RecentReportProp>(`
            SELECT * FROM monthly_report
            ORDER BY month DESC
            LIMIT ${numOfMonths};
        `);

        if (result.length > 0) {
            return result;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error fetching latest months reports: ', error);
        throw error; // Or return null or any error object, not just an empty array.
    }
};

export const deleteAllStudentsPerMonth = async () => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `DELETE FROM students_per_month`
        )
    } catch (error) {
        console.log('Error deleting record: ', error);
    }
}

// This is for test only
export const getAllStudents = async () => {
    try {
        const db = await openDatabase();

        const result = await db.getAllAsync(
            `SELECT * FROM students_per_month;`
        )
        return result;
    } catch (error) {
        console.log('Error getting all students: ', error);
    }
}

export const getDiffStudents = async (month: string): Promise<number> => {
    try {
        const db = await openDatabase();

        const result: { 'COUNT(DISTINCT student_id)': number }[] = await db.getAllAsync(
            `SELECT COUNT(DISTINCT student_id) FROM students_per_month WHERE month = ?;`,
            [month]
        );

        if (result.length > 0) {
            return result[0]['COUNT(DISTINCT student_id)'];
        } else {
            return 1; // Or return null, depending on your needs.
        }
    } catch (error) {
        console.error('Error fetching number of diff students: ', error);
        throw error; // Re-throw the error for the caller to handle
        return 1; // Add a return null to satisfy typescript.
    }
};

export const getNotes = async (): Promise<Note[]> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<Note>(`SELECT * FROM notes ORDER BY date_created DESC;`);

        if (result.length > 0) {
            return result;
        } else {
            return []
        }
    } catch (error) {
        console.log('Error fetching notes: ', error);
        return [];
    }
}

export const getFSReports = async (): Promise<Report[]> => {
    try {
        const db = await openDatabase();

        const result = await db.getAllAsync<Report>('SELECT * FROM fs_report;');

        console.log('GetReports: ', result);

        return result;
    } catch (error) {
        console.log('Error fetching fsReport: ', error);
        return [];
    }
}

export const getCurrentMonthReport = async (currentMonth: string): Promise<Report[]> => {
    try {
        const db = await openDatabase();

        const result = await db.getAllAsync<Report>(`SELECT * FROM fs_report WHERE date LIKE '${currentMonth}%';`);

        console.log('GetCurrentMonthReports: ', result);

        return result;
    } catch (error) {
        console.log('Error fetching current month fsReport: ', error);
        return [];
    }
}

export const getRecentInterests = async (): Promise<InterestedPerson[] | null> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<InterestedPerson>('SELECT * FROM interested_person ORDER BY last_visit DESC LIMIT 2;');

        console.log("GetInterestResult: ", result);

        return result; // ✅ Return the fetched data
    } catch (error) {
        console.error('Error fetching return visits', error);
        return []; // ✅ Return an empty array in case of error
    }
}

export const getInterestedPersons = async (): Promise<InterestedPerson[]> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<InterestedPerson>('SELECT * FROM interested_person ORDER BY last_visit DESC;');

        console.log("GetInterestResult: ", result);

        return result; // ✅ Return the fetched data
    } catch (error) {
        console.error('Error fetching return visits', error);
        return []; // ✅ Return an empty array in case of error
    }
};

export const getBibleStudies = async (): Promise<BibleStudy[]> => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<BibleStudy>('SELECT * FROM bible_studies;');

        console.log("GetBibleStudyResult: ", result);

        return result; // ✅ Return the fetched data
    } catch (error) {
        console.error('Error fetching bible studies', error);
        return []; // ✅ Return an empty array in case of error
    }
};

export const getStudentsList = async () => {
    try {
        const db = await openDatabase();
        const result = await db.getAllAsync<StudentsAndIntListProps>('SELECT id, student_name AS name FROM bible_studies;');
        if (result.length > 0) {
            return result;
        } else {
            return [];
        }

    } catch (error) {
        console.log('Error fetching rv and bs: ', error);
    }
}

export const getUser = async () => {
    try {
        const db = await openDatabase();

        const result = await db.getAllAsync('SELECT * FROM auth;');

        console.log("Users: ", result);
        return result;
    } catch (error) {
        console.log('Error feting users: ', error);
        return [];
    }
}

export const getSingleReport = async (id: number) => {
    try {
        const db = await openDatabase();

        const result = db.getAllSync<Report>(`SELECT * FROM fs_report WHERE id = ?;`, [id]);

        console.log('Result: ', result);
        return result[0];
    } catch (error) {
        console.log('Error fetching single report: ', error);
    }
}

export const updateSingleReport = async (
    id: number,
    date: string,
    hours: number,
    placements: number,
    return_visits: number,
    studies: number,
    comments: string,
) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(`
            UPDATE fs_report
            SET date = ?, hours = ?, placements = ?, return_visits = ?, studies = ?, comments = ?
            WHERE id = ?;
            `, [date, hours, placements, return_visits, studies, comments, id])

        console.log('Successfully update fs_report: ', result);

    } catch (error) {
        console.error('Error updating single fs_report:', error);
    }
}

export const updateNote = async (
    id: number,
    title: string,
    content: string,
) => {
    try {
        const db = await openDatabase();

        const result = await db.runAsync(`
            UPDATE notes
            SET title = ?, content = ?
            WHERE id = ?;
            `, [title, content, id])

        console.log('Successfully updated note: ', result);
    } catch (error) {
        console.log('Error updating note: ', error);
    }
}

export const updateInterestedPerson = async (
    id: number,
    name: string,
    last_visit: string,
    address: string,
    phone: string,
    topic: string,
    placement: string,
    appointment: string,
    note: string,
    latitude: number,
    longitude: number
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `UPDATE interested_person 
             SET name = ?, address = ?, phone = ?, placement = ?, 
                 appointment = ?, topic = ?, note = ?, last_visit = ?, 
                 latitude = ?, longitude = ? 
             WHERE id = ?;`,
            [name, address, phone, placement, appointment, topic, note, last_visit, latitude, longitude, id]
        );

        console.log("✅ Update successful: ", result);
    } catch (error) {
        console.error('❌ Error updating interested person:', error);
    }
};

export const updateBibleStudent = async (
    id: number,
    student_name: string,
    study_day: string,
    phone: string,
    address: string,
    study_material: string,
    note: string,
    latitude: number,
    longitude: number
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `UPDATE bible_studies 
             SET student_name = ?, address = ?, phone = ?, study_material = ?, 
                 study_day = ?, note = ?, 
                 latitude = ?, longitude = ? 
             WHERE id = ?;`,
            [student_name, address, phone, study_material, study_day, note, latitude, longitude, id]
        );

        console.log("✅ Update successful: ", result);
    } catch (error) {
        console.log('Error editing student: ', error);
    }
}

export const convertToBibleStudy = async (
    id: number,
    name: string,
    address: string,
    phone: string,
    study_pub: string,
    appointment: string,
    note: string,
    latitude: number,
    longitude: number
) => {
    try {
        const db = await openDatabase();
        const result = await db.runAsync(
            `INSERT INTO bible_studies 
             (student_name, address, phone, study_material, 
                 study_day, note, 
                 latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
             ;`,
            [name, address, phone, study_pub, appointment, note, latitude, longitude]
        );

        console.log('Converted Interest: ', result);
        if (result.changes > 0) {
            await deleteInterestedPerson(id);

            return { success: true, message: 'Interest successfully converted to a bible study' };
        }

    } catch (error) {
        console.log('Error converting interest: ', error);
        return { success: false, message: "Error converting interest to a Bible study." };
    }
}

export const fetchAnInterest = async (id: number): Promise<InterestedPerson | null> => {
    try {
        const db = await openDatabase();
        const result = await db.getFirstAsync<InterestedPerson>(
            'SELECT * FROM interested_person WHERE id = ?;',
            [id]
        );
        return result ?? null;
    } catch (error) {
        console.error('❌ Error fetching interest:', error);
        return null;
    }
};

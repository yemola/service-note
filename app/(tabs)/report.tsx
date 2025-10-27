import { Share, StyleSheet, Image, Platform, View, Pressable, ImageBackground, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FontAwesome5 } from '@expo/vector-icons';
import { AddButton } from '@/components/AddButton';
import { addMonthlyReportTotal, deleteSingleReport, getAllStudents, getCurrentMonthReport, getDiffStudents, getFSReports, getLastMonthReport, getMostRecentMonthsReport, openDatabase, Report, updateSingleReport } from '@/config/db';
import { ButtonIcon } from '@/components/ButtonIcon';
import { useRef, useState } from 'react';
import ReportForm from '@/components/ReportForm';
import getCurrentDate from '@/scripts/getCurrentDate';
import sumProperty from '@/scripts/sumProperty';
import DelConfirmModal from '@/components/DelConfirmModal';
import ReportEditForm, { ReportEditProp } from '@/components/ReportEditForm';
import MonthlyReportEdit, { MonthlyReportProp } from '@/components/MonthlyReportEdit';
import getLastMonthString from '@/scripts/getLastMonth';
import ReportSubmForm from '@/components/ReportSubmForm';
import MapAlertModal from '@/components/MapAlertModal';
import LateReportEditForm from '@/components/LateReportEditForm';
import ConfirmModal from '@/components/ConfirmModal';
import ImageEdit from '@/components/ImageEdit';

export interface MonthlyReport {
    id: number;
    date: string;
    hours: number;
    placements: number;
    return_visits: number;
    studies: number;
    comments: string;
}

interface MonthlyInitialReport {
    id: number;
    month: string;
    hours: string;
    placements: string;
    return_visits: string;
    studies: string;
}

function isFirstWeekOfMonth(date: Date): boolean {
    return date.getDate() < 8;
}

export default function ReportScreen() {
    const [showForm, setShowForm] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [showMonthlyReportForm, setShowMonthlyReportForm] = useState<boolean>(false);
    const [currentReport, setCurrentReport] = useState<ReportEditProp>({
        id: 0,
        date: '',
        placements: 0,
        hours: 0,
        studies: 0,
        comments: '',
        return_visits: 0
    });
    const [monthReport, setMonthReport] = useState<MonthlyInitialReport>({
        id: 0,
        month: '',
        hours: '',
        placements: '',
        return_visits: '',
        studies: '',
    });
    const [showSubmForm, setShowSubmForm] = useState<boolean>(false);
    const [reportDetails, setReportDetails] = useState<Report>({
        id: 0,
        date: '',
        hours: 0,
        return_visits: 0,
        studies: 0,
        placements: 0,
        comments: ''
    });
    const [showBsInfo, setShowBsInfo] = useState<boolean>(false);
    const [alertMsg, setAlertMsg] = useState({
        title: '',
        message: ''
    });
    const [showLateMonthReport, setShowLateMonthReport] = useState<boolean>(false);
    const [showCurrentMonthReport, setShowCurrentMonthReport] = useState<boolean>(false);
    const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
    const [showConfirmSave, setShowConfirmSave] = useState<boolean>(false);
    const [topImg, setTopImg] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number>(0);
    const numOfMonthsRef = useRef(3);

    const pickAndResizeImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true, // This is important for iOS to allow some basic adjustments
            aspect: [16, 9], // Example: Requesting a 16:9 aspect ratio
            quality: 0.8, // Adjust as needed
        });

        if (!result.canceled) {
            setTopImg(result.assets[0].uri);
        }
    };

    const today = new Date();

    const isFirstWeek = isFirstWeekOfMonth(today);
    const lastMonth = getLastMonthString();
    console.log('lastMonth: ', lastMonth)

    const fetchLastMonthReportFrMonthlyDB = async () => {
        try {
            const response = await getLastMonthReport(lastMonth);
            return response;

        } catch (error) {
            return [];
        }
    }

    const { data: lastMonthRep = [], refetch: refetchFromMonthlyTable } = useQuery({
        queryKey: ['last-month-report'],
        queryFn: fetchLastMonthReportFrMonthlyDB
    });

    const getCurrentMonth = (): string => {
        const date = new Date();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[date.getMonth()];
    };

    const getPreviousMonthName = (): string => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1); // Go to the previous month

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        return monthNames[date.getMonth()];
    };

    function formatMonth(ym: string) {
        // ym: "2025-04"
        const [year, month] = ym.split('-');
        return {
            mm_yy: `${month}/${year.slice(2)}`,   // "04/25"
            mm_dash_yy: `${month}-${year.slice(2)}`, // "04-25"
            yy_dash_mm: `${year.slice(2)}-${month}`, // "25-04"
            full: `${getMonthName(month)} ${year}`   // "April 2025"
        };
    }

    function getMonthName(month: string) {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[parseInt(month, 10) - 1];
    }

    const month = getCurrentMonth();

    const prevMonthName = getPreviousMonthName();

    const fetchReports = async () => {
        try {
            const db = await openDatabase();
            const today = getCurrentDate();
            if (!today) {
                console.log("Error: today is null");
                return [];
            }
            const currentMonth = today.slice(0, 7);
            console.log("currentMonth is: ", currentMonth);
            const reportList = await getCurrentMonthReport(currentMonth);
            return reportList;
        } catch (error) {
            console.log('Error fetching reportlist: ', error);
        }
    }

    const fetchDiffStudents = async () => {
        try {
            const db = await openDatabase();
            const today = getCurrentDate();
            if (!today) {
                console.log("Error: today is null");
                return 0;
            }
            const currentMonth = today.slice(0, 7);
            const numOfStudents = await getDiffStudents(currentMonth);
            console.log('diffStudentCount: ', numOfStudents);
            return numOfStudents;
        } catch (error) {
            console.log('Error fetch diffStudentsCount: ', error);
            return 0;
        }
    }

    const { data: diffStudents = 1, refetch: refetchDiffStudents } = useQuery({
        queryKey: ['diff-students'],
        queryFn: fetchDiffStudents
    });

    const fetchDiffStudentForLastMonth = async () => {
        try {
            const db = await openDatabase();
            const numOfStudents = await getDiffStudents(lastMonth);
            console.log('diffStudentCount: ', numOfStudents);
            return numOfStudents;
        } catch (error) {
            console.log('Error fetch diffStudentsCount for last month: ', error);
            return 0;
        }
    }

    const { data: diffStudentsForLastMonth = 1, refetch: refetchDiffStudentsForLastMonth } = useQuery({
        queryKey: ['diff-students-last-month'],
        queryFn: fetchDiffStudentForLastMonth
    })

    const { data = [], refetch } = useQuery({
        queryKey: ['fs-reports'],
        queryFn: fetchReports,
        initialData: []
    });

    const fetchLateReport = async () => {
        try {
            const db = await openDatabase();

            const response = await getCurrentMonthReport(lastMonth);
            console.log('Last Month Report: ', response);
            return response;
        } catch (error) {
            console.log('Error fetching late report: ', error);
        }
    }

    const { data: lateReport = [], refetch: refetchLateReport } = useQuery({
        queryKey: ['late-report'],
        queryFn: fetchLateReport,
        initialData: []
    })

    const fetchMostRecentMonthsReport = async ({ queryKey }: any) => {
        // queryKey: ['previous-months-report', numOfMonths]
        const [, numOfMonths = 3] = queryKey;
        const response = await getMostRecentMonthsReport(numOfMonths);
        return response;
    };

    let numOfMonths = 3

    const { data: previousMonths = [] } = useQuery({
        queryKey: ['previous-months-report', numOfMonths],
        queryFn: fetchMostRecentMonthsReport,
        initialData: []
    })

    const promptDeletion = async (id: number) => {
        setDeleteId(id);
        setVisibility(true);
    }

    const handleEditing = (rep: ReportEditProp) => {
        setCurrentReport(rep);
        setShowEditForm(true);
    }

    const handleEditLateMonthlyReport = async () => {

        setShowLateMonthReport(true);
        let month = lateReport[0]?.date?.slice(0, 7);
        let hours = sumProperty(lateReport, 'hours').toString();
        let placements = sumProperty(lateReport, 'placements').toString();
        let return_visits = sumProperty(lateReport, 'return_visits').toString();
        let studies = diffStudentsForLastMonth.toString();

        setMonthReport({
            id: lateReport[0].id,
            month,
            hours,
            placements,
            return_visits,
            studies
        })

    }

    const handleEditCurrentMonthlyReport = async () => {
        setShowCurrentMonthReport(true);
        let month = data[0]?.date?.slice(0, 7);
        let hours = sumProperty(data, 'hours').toString();
        let placements = sumProperty(data, 'placements').toString();
        let return_visits = sumProperty(data, 'return_visits').toString();
        let studies = diffStudents.toString();

        setMonthReport({
            id: data[0].id,
            month,
            hours,
            placements,
            return_visits,
            studies
        })
    }

    const handleEditMonthlyReport = async () => {
        setShowMonthlyReportForm(true);
        let month = lastMonth;
        let hours = lastMonthRep[0].hours.toString();
        let placements = lastMonthRep[0].placements.toString();
        let return_visits = lastMonthRep[0].return_visits.toString();
        let studies = lastMonthRep[0].studies.toString();

        setMonthReport({
            id: data[0].id,
            month,
            hours,
            placements,
            return_visits,
            studies
        })

    }

    const handleSaveLateMonthlyReport = async () => {
        try {
            let month = lateReport[0]?.date?.slice(0, 7);
            let hours = sumProperty(lateReport, 'hours');
            let placements = sumProperty(lateReport, 'placements');
            let return_visits = sumProperty(lateReport, 'return_visits');
            let studies = sumProperty(lateReport, 'studies');

            const response = await addMonthlyReportTotal(month, hours, placements, return_visits, studies);

            console.log('Saving Late Report: ', response)
        } catch (error) {
            console.log('Error saving late report: ', error);
        }
    }

    const handleSaveCurrentReport = async () => {
        try {
            let month = data[0]?.date?.slice(0, 7);
            let hours = sumProperty(data, 'hours');
            let placements = sumProperty(data, 'placements');
            let return_visits = sumProperty(data, 'return_visits');
            let studies = diffStudents;

            const response = await addMonthlyReportTotal(month, hours, placements, return_visits, studies);

            console.log('Saving Current Report: ', response);
        } catch (error) {
            console.log('Error saving current report: ', error);
        }
    }

    const onRefresh = async () => {
        try {
            await refetch();
            await refetchDiffStudents();
            await refetchLateReport();
            await refetchDiffStudentsForLastMonth();
            // await refetchFromMonthlyTable();
        } catch (error) {
            console.log('Error refreshing page: ', error);
        }
    }

    const handleRefreshLastMonthReport = async () => {
        await refetchLateReport();
        await refetchDiffStudentsForLastMonth();
        // await refetchFromMonthlyTable();
    }

    const handleDeletion = async () => {
        await deleteSingleReport(deleteId);
        setVisibility(false);
        refetch();
    }

    // const handleShareReport = async (report: MonthlyReport) => {
    //     setShowSubmForm(true);
    //     setReportDetails(lastMonthRep[0])
    // }

    const handleShareLateReport = async () => {
        setShowSubmForm(true);
        let date = lateReport[0]?.date;
        let hours = sumProperty(lateReport, 'hours');
        let placements = sumProperty(lateReport, 'placements');
        let return_visits = sumProperty(lateReport, 'return_visits');
        let studies = diffStudentsForLastMonth;
        let comments = lateReport[0]?.comments;

        setReportDetails({ id: lateReport[0]?.id, date, hours, placements, return_visits, studies, comments });
    }

    const handleShareCurrentReport = async () => {
        setShowSubmForm(true);
        let date = data[0]?.date;
        let hours = sumProperty(data, 'hours');
        let placements = sumProperty(data, 'placements');
        let return_visits = sumProperty(data, 'return_visits');
        let studies = diffStudents;
        let comments = data[0]?.comments;

        setReportDetails({ id: data[0]?.id, date, hours, placements, return_visits, studies, comments });
    }

    const handleShowInfo = () => {
        setShowBsInfo(true);
        setAlertMsg({ title: 'Bible Study Count', message: `The Bible study figure is the number of different bible students recorded for the month.\nYou can edit it if necessary.` })
    }

    const onSaveCurrentReport = async () => {
        setShowConfirmSave(true);
    }


    return (
        <View style={styles.container}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
                headerImage={
                    <View style={styles.headerContainer}>
                        <ImageBackground
                            source={topImg ? { uri: topImg } : require('@/assets/images/record1.jpg')}
                            style={styles.topImage}
                            resizeMode='cover'
                        >
                            <ImageEdit onChange={pickAndResizeImage} onRestore={() => setTopImg(null)} />

                            <ThemedView lightColor='rgba(0, 0, 0, 0.5)' darkColor='rgba(0, 0, 0, 0.5)' style={styles.pgTheme}>
                                <ThemedText style={{ textAlign: 'center', fontSize: 14 }} >"March around Zion...Count its towers." - Ps 48:12</ThemedText>
                            </ThemedView>

                        </ImageBackground>
                    </View>
                }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Field Service Report</ThemedText>
                </ThemedView>
                {isFirstWeek && lastMonthRep?.length === 0 && <ThemedText style={{ fontSize: 13 }}>Have you submitted last month's report?</ThemedText>}
                {lateReport?.length > 0 && (
                    <ThemedView>
                        <Collapsible title={prevMonthName}>
                            <View style={styles.detailsContainer}>
                                <View style={styles.th}>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">Hrs</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Plm</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">RV</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>BSt</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Info</ThemedText>
                                </View>
                                <View style={styles.totalsRow}>
                                    <ThemedText style={styles.value}>{sumProperty(lateReport, 'hours')}</ThemedText>
                                    <ThemedText style={styles.value}>{sumProperty(lateReport, 'placements')}</ThemedText>
                                    <ThemedText style={styles.value}>{sumProperty(lateReport, 'return_visits')}</ThemedText>
                                    <ThemedText style={styles.value}>{diffStudentsForLastMonth}</ThemedText>
                                    <Pressable style={{ marginTop: 2 }} onPress={handleShowInfo}>
                                        <IconSymbol name='info.circle' size={15} color='#baa' />
                                    </Pressable>
                                </View>
                                <View style={{ marginTop: 10 }}>
                                    <View style={styles.actionContainer}>
                                        <Pressable style={styles.actionBtn} onPress={handleEditLateMonthlyReport}>
                                            <IconSymbol name='pencil' size={15} color='#baa' />
                                            <ThemedText style={{ fontSize: 13 }}>Edit</ThemedText>
                                        </Pressable>
                                        <Pressable style={styles.actionBtn} onPress={handleSaveLateMonthlyReport}>
                                            <IconSymbol name='tray.and.arrow.down' size={15} color='#baa' />
                                            <ThemedText lightColor='white' style={{ fontSize: 13 }}>Save</ThemedText>
                                        </Pressable>
                                        <Pressable style={styles.actionBtn} onPress={handleShareLateReport}>
                                            <IconSymbol name='arrow.up' size={15} color='#baa' />
                                            <ThemedText lightColor='white' style={{ fontSize: 13 }}>Share</ThemedText>
                                        </Pressable>

                                    </View>
                                </View>
                            </View>
                        </Collapsible>
                    </ThemedView>
                )}

                {/* {lateReport && } */}
                {data?.length < 1 && !lateReport &&
                    <View style={styles.empty}>
                        <View style={{ marginBottom: 20 }}>
                            <FontAwesome5 name="person-booth" size={24} color="white" />
                        </View>
                        <ThemedText>Your field service report will appear here.</ThemedText>
                    </View>}
                {data?.length > 0 && (
                    <ThemedView>
                        <Collapsible title={month} >
                            <View style={styles.detailsContainer}>
                                <ThemedText style={{ fontSize: 12 }}>{data[0]?.date?.slice(0, 7)}</ThemedText>
                                <View style={styles.th}>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Day</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">Hrs</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Plm</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">RV</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>BSt</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Del</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Edit</ThemedText>
                                </View>

                                {data?.map((rep, index) => (
                                    <View style={styles.th} key={rep.id}>
                                        <ThemedText style={styles.value}>{rep.date?.slice(8, 10)}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.hours}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.placements}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.return_visits}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.studies}</ThemedText>
                                        <Pressable style={{ marginTop: 2 }} onPress={() => promptDeletion(rep.id)}>
                                            <IconSymbol name='trash' size={15} color='#baa' />
                                        </Pressable>
                                        <Pressable style={{ marginTop: 2 }} onPress={() => handleEditing(rep)}>
                                            <IconSymbol name='pencil' size={15} color='#baa' />
                                        </Pressable>
                                    </View>
                                ))}
                                <View style={styles.totalsRow}>
                                    <ThemedText lightColor='white' style={{ fontSize: 10 }}>Tot</ThemedText>
                                    <ThemedText style={styles.value}>{sumProperty(data, 'hours')}</ThemedText>
                                    <ThemedText style={styles.value}>{sumProperty(data, 'placements')}</ThemedText>
                                    <ThemedText style={styles.value}>{sumProperty(data, 'return_visits')}</ThemedText>
                                    <ThemedText style={styles.value}>{diffStudents}</ThemedText>
                                    <ThemedText style={styles.value}>{`-->`}</ThemedText>
                                    <Pressable style={{ marginTop: 2 }} onPress={handleShowInfo}>
                                        <IconSymbol name='info.circle' size={15} color='#baa' />
                                    </Pressable>
                                </View>

                                <View style={{ marginVertical: 8 }}>
                                    <ThemedText style={styles.note}>Edit Bible studies total, if necessary, before submission.</ThemedText>
                                </View>

                                <View style={styles.actionContainer}>
                                    <Pressable style={styles.actionBtn} onPress={onSaveCurrentReport}>
                                        <IconSymbol name='tray.and.arrow.down' size={15} color='#baa' />
                                        <ThemedText lightColor='white' style={{ fontSize: 13 }}>Save</ThemedText>
                                    </Pressable>
                                    <Pressable style={styles.actionBtn} onPress={handleShareCurrentReport}>
                                        <IconSymbol name='arrow.up' size={15} color='#baa' />
                                        <ThemedText lightColor='white' style={{ fontSize: 13 }}>Share</ThemedText>
                                    </Pressable>

                                </View>
                            </View>
                        </Collapsible>
                    </ThemedView>
                )}
                <ThemedView>
                    <Collapsible title='Previous Months'>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ThemedText>Number of Months: </ThemedText>
                            <TextInput
                                keyboardType='numeric'
                                style={styles.inputBox}
                                defaultValue='3'
                                placeholder='Number of Months'
                                placeholderTextColor="#888"
                            />
                        </View>
                        {previousMonths?.length > 0 ? (
                            <View style={styles.detailsContainer}>
                                <View style={styles.th}>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Month</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">Hrs</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>Plm</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }} type="defaultSemiBold">RV</ThemedText>
                                    <ThemedText lightColor='white' style={{ fontSize: 14 }}>BSt</ThemedText>
                                </View>

                                {previousMonths?.map((rep, index) => (
                                    <View style={styles.th} key={rep.id}>
                                        <ThemedText style={styles.value}>{formatMonth(rep?.month).mm_yy}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.hours}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.placements}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.return_visits}</ThemedText>
                                        <ThemedText style={styles.value}>{rep.studies}</ThemedText>
                                    </View>
                                ))}
                            </View>
                        ) : <ThemedText>Your previous months reports will appear here.</ThemedText>}

                    </Collapsible>
                </ThemedView>

                {showForm && <ReportForm
                    visible={showForm}
                    onCancel={() => setShowForm(false)}
                    onAdd={onRefresh}
                />}


                {showEditForm && <ReportEditForm
                    currentReport={currentReport}
                    visible={showEditForm}
                    onCancel={() => setShowEditForm(false)}
                    onEdit={onRefresh}
                />}
                {showMonthlyReportForm && <MonthlyReportEdit
                    monthReport={monthReport}
                    visible={showMonthlyReportForm}
                    onCancel={() => setShowMonthlyReportForm(false)}
                    onEdit={refetchFromMonthlyTable}
                />}

                {showLateMonthReport && <LateReportEditForm
                    monthReport={monthReport}
                    visible={showLateMonthReport}
                    onCancel={() => setShowLateMonthReport(false)}
                    onEdit={refetchFromMonthlyTable}
                />}

                <DelConfirmModal
                    visible={visibility}
                    onCancel={() => setVisibility(false)}
                    onDelete={handleDeletion}
                />

                <ReportSubmForm
                    visible={showSubmForm}
                    title='Report Submission'
                    message={reportDetails}
                    actionBtnTitle='Share'
                    onCancel={() => setShowSubmForm(false)}
                    onShare={handleShareLateReport}
                />

                <MapAlertModal
                    visible={showBsInfo}
                    title={alertMsg.title}
                    message={alertMsg.message}
                    onCancel={() => setShowBsInfo(false)}
                />

                <ConfirmModal
                    visible={showConfirmModal}
                    alertHeading='Confirm Edit'
                    btnTitle='Edit'
                    message='Edit only if you will no longer go out in service until next month. Do you want to proceed?'
                    onCancel={() => setShowConfirmModal(false)}
                    onConfirm={handleEditCurrentMonthlyReport}
                />

                <ConfirmModal
                    visible={showConfirmSave}
                    alertHeading='Confirm Save'
                    btnTitle='Save'
                    message='Save only after your last day in the ministry for the month'
                    onCancel={() => setShowConfirmSave(false)}
                    onConfirm={handleSaveCurrentReport}
                />

            </ParallaxScrollView>
            <AddButton onPress={() => setShowForm(true)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    empty: {
        flex: 1,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    detailsContainer: {
        borderRadius: 16,
        backgroundColor: "#333",
        paddingHorizontal: 12,
        paddingBottom: 12,
        paddingTop: 8
    },
    value: {
        color: '#baa',
        fontSize: 15
    },
    th: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: 8
    },
    totalsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '97%',
        paddingBottom: 2,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#aaa'
    },
    note: {
        color: '#baa',
        fontSize: 11,
        paddingVertical: 1,
        lineHeight: 18
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
        backgroundColor: '#152640',
        borderRadius: 10,
        columnGap: 6,
        width: '25%'
    },
    headerContainer: {
        marginTop: 42,
        alignItems: 'center',
        justifyContent: 'center'
    },
    topImage: {
        justifyContent: 'center',
        height: 178,
        width: "100%",
    },
    pgTheme: {
        paddingVertical: 3,
        width: '100%',
        bottom: 4
    },
    inputBox: {
        backgroundColor: '#ccc',
        color: 'black',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        lineHeight: 28,
        paddingVertical: 2, // Reduced from 6 to 2
        height: 32,        // Added fixed height
        width: 80,
        marginLeft: 8,
        paddingBottom: 2
    }
});

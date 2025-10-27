import { useState } from 'react';
import { Linking, StyleSheet, Image, Platform, View, Pressable, ImageBackground } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from "expo-clipboard";

import { Collapsible } from '@/components/Collapsible';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { AddButton } from '@/components/AddButton';
import { getBibleStudies, openDatabase, BibleStudy, deleteBibleStudent } from '@/config/db';
import { useQuery } from '@tanstack/react-query';
import { ButtonIcon } from '@/components/ButtonIcon';
import BibleStudyForm from '@/components/BibleStudyForm';
import BibleStudentEditForm, { StudentProps } from '@/components/BibleStudentEditForm';
import DelConfirmModal from '@/components/DelConfirmModal';
import MapAlertModal from '@/components/MapAlertModal';
import MapAlertTwoBtnModal from '@/components/MapAlertTwoBtnModal';
import ImageEdit from '@/components/ImageEdit';
import * as ImagePicker from 'expo-image-picker';

export default function BibleStudyScreen() {
    const [showForm, setShowForm] = useState<boolean>(false);
    const [showEditForm, setShowEditForm] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<boolean>(false);
    const [deleteId, setDeleteId] = useState<number>(0)
    const [currentStudent, setCurrentStudent] = useState<StudentProps>({
        id: 0,
        student_name: '',
        address: '',
        study_material: '',
        study_day: '',
        phone: '',
        note: '',
        latitude: 0,
        longitude: 0
    });
    const [showMapAlert, setShowMapAlert] = useState<boolean>(false);
    const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
    const [alertMsg, setAlertMsg] = useState({
        title: '',
        message: ''
    });
    const [showMapAlertTwoBtn, setShowMapAlertTwoBtn] = useState<boolean>(false);
    const [topImg, setTopImg] = useState<string | null>(null); // Initial image

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

    const fetchBibleStudies = async () => {
        try {
            const db = await openDatabase();
            const studiesList = await getBibleStudies();
            return studiesList || [];
        } catch (error) {
            console.error('❌ Error fetching return visits', error);
            return [];
        }
    }

    const { data = [], refetch } = useQuery<BibleStudy[], Error>({
        queryKey: ['bible-students'],
        queryFn: fetchBibleStudies,
        initialData: []
    })

    const onRefresh = () => refetch();

    const handleDeletion = async () => {
        setDeleteId(deleteId)
        await deleteBibleStudent(deleteId);
        setVisibility(false);
        refetch();
    }

    const handleEditing = async (per: BibleStudy) => {
        setCurrentStudent(per);
        setShowEditForm(true);
    }

    const promptDeletion = async (id: number) => {
        setDeleteId(id);
        setVisibility(true);
    }

    const handleGetDirection = async (per: StudentProps) => {
        try {
            if (!per.latitude && !per.longitude) {
                setAlertMsg({ title: 'Oops!', message: `Student's location not saved. \nSave the location on your next visit.` });
                setShowMapAlert(true)
                return;
            }

            await checkAndOpenGoogleMaps(per.latitude, per.longitude);
        } catch (error) {
            console.log('Get Direction Error: ', error);
        }
    }

    const handleDialNumber = async (number: string) => {
        console.log('Dialing number: ', number);
        if (number) {
            callStudent(number);
        }
    }

    const callStudent = (phoneNumber: string) => {
        const formattedPhoneNumber = `tel:${phoneNumber}`;

        Linking.canOpenURL(formattedPhoneNumber)
            .then((supported) => {
                if (!supported) {
                    setShowMapAlert(true);
                    setAlertMsg({ title: 'Error!', message: `The URL: ${formattedPhoneNumber} cannot be opened. Make sure you are on a device capable of making calls.` })
                } else {
                    return Linking.openURL(formattedPhoneNumber);
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const checkAndOpenGoogleMaps = async (destinationLatitude: number, destinationLongitude: number) => {
        const { status } = await Location.requestForegroundPermissionsAsync(); // Request permission

        if (status !== 'granted') {
            setShowMapAlertTwoBtn(true);
            return;
        }

        // If permission is granted, proceed to open Google Maps
        openGoogleMapsDirections(destinationLatitude, destinationLongitude);
    };


    const openGoogleMapsDirections = (destinationLatitude: number, destinationLongitude: number) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'google.navigation:q=' });
        const latLng = `${destinationLatitude},${destinationLongitude}`;
        const label = 'Interested Person\'s Location';

        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}&saddr=Current+Location`,
            android: `${scheme}${latLng}`,
        });

        Linking.openURL(url!)
            .catch(err => {
                console.error('Error opening Google Maps:', err);
                setShowMapAlert(true);
                setAlertMsg({ title: 'Google Maps Not Found', message: 'It seems Google Maps is not installed on your device. Please install it from your app store to use this feature.' });
            });
    };

    const handleCopyNumber = async (number: string) => {
        if (number) {
            await Clipboard.setStringAsync(number);
        }
    }

    const handleAdjustLocationSetting = async () => {
        Linking.openSettings();
    }

    return (
        <View style={styles.container}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
                headerImage={
                    <View style={styles.headerContainer}>
                        <ImageBackground
                            source={topImg ? { uri: topImg } : require('@/assets/images/study1.jpg')}
                            style={styles.topImage}
                            resizeMode='cover'
                        >
                            <ImageEdit onChange={pickAndResizeImage} onRestore={() => setTopImg(null)} />

                            <ThemedView lightColor='rgba(0, 0, 0, 0.5)' darkColor='rgba(0, 0, 0, 0.5)' style={styles.pgTheme}>
                                <ThemedText style={{ textAlign: 'center', fontSize: 14 }} >"Continue applying yourself to...teaching" - 1Tim 4:13</ThemedText>
                            </ThemedView>

                        </ImageBackground>
                    </View>
                }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Bible Studies <ThemedText style={{ fontSize: 12 }}> - {data.length}</ThemedText> </ThemedText>
                </ThemedView>
                {data.length < 1 &&
                    <View style={styles.empty}>
                        <View style={{ marginBottom: 20 }}>
                            <FontAwesome5 name="book-reader" size={24} color="white" />
                        </View>
                        <ThemedText>Your bible students will appear here.</ThemedText>
                    </View>}
                {data.length > 0 && (data.map((per, index) => <ThemedView key={per.id}>
                    <Collapsible title={per.student_name} >
                        <View style={styles.detailsContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <ThemedText lightColor="white" type="defaultSemiBold">Phone:</ThemedText>
                                <Pressable onLongPress={() => handleCopyNumber(per.phone!)}
                                    onPressIn={() => setIsLongPressed(true)}
                                    onPressOut={() => setIsLongPressed(false)}
                                    style={[styles.phoneNumberContainer,
                                    isLongPressed && styles.phoneNumberLongPressed]}>
                                    <ThemedText type='link' style={{ fontSize: 15 }}>{per.phone || 'No number'}</ThemedText>
                                </Pressable>

                                {per.phone && <Pressable onPress={() => handleDialNumber(per.phone!)}>
                                    <IconSymbol name='phone.fill' size={16} color='white' />
                                </Pressable>}
                            </View>
                            <ThemedText lightColor="white" type="defaultSemiBold">Appointment: <ThemedText style={styles.value}>{per.study_day}</ThemedText></ThemedText>
                            <ThemedText lightColor="white">Study Pub: <ThemedText style={styles.value}>{per.study_material}</ThemedText></ThemedText>
                            <ThemedText lightColor="white">Address: <ThemedText style={styles.value}>{per.address}</ThemedText></ThemedText>

                            <View style={{ marginTop: 8 }}>
                                <Pressable onPress={() => handleGetDirection(per)}>
                                    <ThemedText type="link" style={{ fontSize: 14 }}>Get Direction</ThemedText>
                                </Pressable>
                            </View>
                            <View style={styles.actionContainer}>
                                <ButtonIcon title='Delete' name='trash' color='white' onPress={() => promptDeletion(per.id)} />
                                <ButtonIcon title='Edit' name='pencil' color='white' onPress={() => handleEditing(per)} />
                            </View>
                        </View>
                    </Collapsible>
                </ThemedView>))
                }

                {showForm && (
                    <BibleStudyForm
                        visible={showForm}
                        onCancel={() => setShowForm(false)}
                        onAdd={onRefresh}
                    />
                )}

                {showEditForm && (
                    <BibleStudentEditForm
                        currentStudent={currentStudent}
                        visible={showEditForm}
                        onCancel={() => setShowEditForm(false)}
                        onEdit={onRefresh}
                    />
                )}

                <DelConfirmModal
                    visible={visibility}
                    onCancel={() => setVisibility(false)}
                    onDelete={handleDeletion}
                />

                <MapAlertModal
                    title={alertMsg.title}
                    message={alertMsg.message}
                    visible={showMapAlert}
                    onCancel={() => setShowMapAlert(false)}
                />

                <MapAlertTwoBtnModal
                    actionBtnTitle='Open Settings'
                    title='Location Permission Required'
                    message='To get directions, please enable location permissions for this app in your device settings.'
                    visible={showMapAlertTwoBtn}
                    onCancel={() => setShowMapAlertTwoBtn(false)}
                    onDecide={handleAdjustLocationSetting} />
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
        justifyContent: 'space-between',
    },
    empty: {
        flex: 1,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
    actionContainer: {
        flexDirection: 'row',
        gap: 25,
        marginVertical: 12
    },
    detailsContainer: {
        borderRadius: 16,
        backgroundColor: "#333",
        paddingHorizontal: 12,
        paddingBottom: 0,
        paddingTop: 8
    },
    value: {
        color: '#baa',
        fontSize: 15
    },
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8
    },
    phoneNumberContainer: {
        borderRadius: 12,
        paddingHorizontal: 8,
        marginRight: 12
    },
    phoneNumberLongPressed: {
        backgroundColor: '#ADD8E6'
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
    }
});

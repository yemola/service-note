import React, { useState } from "react";
import { Modal, View, ScrollView, TextInput, Platform, StyleSheet } from "react-native";
import * as Location from 'expo-location';

import { ThemedText } from "./ThemedText";
import Button from "./Button";
import AppForm from "./form/AppForm";
import AppFormField from "./form/FormField";
import SubmitButton from "./form/SubmitButton";
import AppFormPicker from "./form/AppFormPicker";
import TimeInputField from "./form/TimeInputField";
import { addBibleStudent } from "@/config/db";
import { FormikHelpers } from "formik";

export interface StudentDetails {
    student_name: string;
    study_day: string;
    phone?: string;
    address?: string;
    study_material?: string;
    note?: string;
    geolocation?: { latitude: number; longitude: number };
}


export default function BibleStudyForm({ visible, onCancel, onAdd }: { visible: boolean; onCancel: () => void; onAdd: () => void }) {

    const [geolocation, setGeolocation] = useState<StudentDetails['geolocation']>(undefined);

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const handleLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            setGeolocation({
                latitude: Number(location.coords.latitude),
                longitude: Number(location.coords.longitude),
            });
            console.log(geolocation);
        } catch (error) {
            console.error("Error getting location:", error);
        }
    };

    const initialValues: StudentDetails = {
        student_name: '',
        address: '',
        study_material: '',
        study_day: '',
        phone: '',
        note: '',

    };

    const handleSubmit = async (values: StudentDetails, helpers: FormikHelpers<StudentDetails>) => {
        try {
            console.log('Submited: ', { ...values, ...geolocation });
            const { student_name, address, study_material, phone, study_day, note } = values;
            let latitude = geolocation?.latitude ?? 0;
            let longitude = geolocation?.longitude ?? 0;

            // let today = new Date();
            // let last_visit = today.toString();

            const result = addBibleStudent(
                student_name!,
                address!,
                phone!,
                study_material!,
                study_day,
                note!,
                latitude,
                longitude,
            );

            // Reset the form
            helpers.resetForm();

            // Reset geolocation
            setGeolocation(undefined);
            onAdd();
            onCancel();
        } catch (error) {
            console.log('ERROR: ', error);
        }
    }

    const locationTitle = geolocation ? "Location Saved" : "Get Location";

    return (
        <Modal visible={visible} animationType="slide" transparent={true} style={styles.modal}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <ThemedText style={styles.heading} darkColor="grey" lightColor="grey" type="title">New Student</ThemedText>
                    <AppForm<StudentDetails>
                        initialValues={initialValues}
                        onSubmit={handleSubmit}>
                        <AppFormField label="Name" name="student_name" maxLength={40} />
                        <AppFormField label="Phone" name="phone" maxLength={14} />
                        <AppFormField label="Address" name="address" multiline maxLength={100} />
                        <AppFormField label="Study Pub" name="study_material" maxLength={100} />
                        <View style={styles.appointmentContainer}>
                            <ThemedText darkColor="black" lightColor="black">Study Day</ThemedText>
                            <View style={styles.dayAndTimeContainer}>
                                <AppFormPicker name="study_day" label="Day" items={daysOfWeek} />
                                {/* <TimeInputField label="Time" name="time" /> */}
                            </View>
                        </View>

                        <AppFormField label="Note" name="note" maxLength={120} multiline />
                        <Button title={locationTitle} onPress={handleLocation} />

                        <View style={styles.buttonContainer}>
                            <View style={{ flex: 1 }}>
                                <Button title="Cancel" onPress={onCancel} />
                            </View>
                            <View style={{ flex: 1 }} >
                                <SubmitButton title="Add" />
                            </View>
                        </View>
                    </AppForm>
                </ScrollView>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modal: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    modalContent: {
        backgroundColor: 'white',
        marginTop: 25,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 8,
        width: 300,
        maxWidth: 400, // Limit width for larger screens
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
        gap: 10
    },
    appointmentContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
    },
    dayAndTimeContainer: {  // Style for the container
        columnGap: 10,
        marginTop: 15,
        position: 'relative',
    },
    dayDropdown: {
        flex: 1,  // Allow the dropdown to take up available space
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,  // Add some spacing between dropdown and time
        backgroundColor: '#152640',
        color: 'white',
        position: 'absolute',
        top: 40,
        left: 10,
        width: 120,
        zIndex: 20
    },
    locationButton: {
        marginBottom: 10,
    },
    cancelButton: {
        marginRight: 10,
        backgroundColor: '#FF3B30',  // Example: Red for cancel
        borderColor: '#FF3B30',
        borderRadius: 12
    },
    addButton: {
        backgroundColor: '#007AFF', // Example: Blue for add
        borderColor: '#007AFF',
        borderRadius: 12
    },
    heading: {
        marginBottom: 15
    },
});



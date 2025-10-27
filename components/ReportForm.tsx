import React, { useState } from "react";
import { Modal, View, ScrollView, TextInput, Platform, StyleSheet } from "react-native";
import * as Location from 'expo-location';

import { ThemedText } from "./ThemedText";
import Button from "./Button";
import AppForm from "./form/AppForm";
import AppFormField from "./form/FormField";
import SubmitButton from "./form/SubmitButton";
import AppFormPicker, { StudentsAndIntListProps } from "./form/AppFormPicker";
import TimeInputField from "./form/TimeInputField";
import { addInterestedPerson, addReport, addStudentsByName, getStudentsList, Report } from "@/config/db";
import { FormikHelpers } from "formik";
import getCurrentDate from "@/scripts/getCurrentDate";
import { useQuery } from "@tanstack/react-query";
import AppInterestPicker from "./form/AppInterestPicker";

interface ReportDetails {
    date: string;
    placements: number;
    hours: number;
    return_visits: number;
    studies: number;
    comments?: string;
    students?: StudentsAndIntListProps[]
}

export default function ReportForm({ visible, onCancel, onAdd }: { visible: boolean; onCancel: () => void; onAdd: () => void }) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = getCurrentDate();

    const fetchStudents = async () => {
        try {
            const res = await getStudentsList();
            console.log('All Persons: ', res);
            return res;
        } catch (error) {
            console.log('Error fetching rv + bs: ', error);
            return [];
        }
    }

    const { data: allInterestsAndBs = [] } = useQuery({
        queryKey: ['allInterests-bs'],
        queryFn: fetchStudents,
        initialData: []
    })

    const initialValues: ReportDetails = {
        date: today,
        placements: 0,
        hours: 0,
        studies: 0,
        comments: '',
        return_visits: 0,
    };

    const handleSubmit = async (values: ReportDetails, helpers: FormikHelpers<ReportDetails>) => {
        try {
            console.log('VALUES: ', values);
            const { date, hours, placements, return_visits, studies, comments } = values;
            const { students } = values;
            const month = date.slice(0, 7);

            let today = new Date();
            let last_visit = today.toString();
            comments ? comments : 'None';

            const result = await addReport(
                date,
                hours,
                placements,
                return_visits,
                studies,
                comments!
            );
            console.log('Saved report: ', result);

            if (students && students?.length > 0) {
                for (const st of students!) {
                    const saveStudents = await addStudentsByName(st.id, st.name, month);
                    console.log('SaveStudentRes: ', saveStudents);
                }
            }
            // Reset the form
            helpers.resetForm();
            onAdd();
            onCancel();

        } catch (error) {
            console.log('ERROR: ', error);
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <ThemedText style={styles.heading} darkColor="grey" lightColor="grey" type="title">New Report</ThemedText>
                    <AppForm<ReportDetails>
                        initialValues={initialValues}
                        onSubmit={handleSubmit}>
                        <AppFormField label="Date" name="date" maxLength={40} />
                        <AppFormField label="Hours" keyboardType='numeric' name="hours" multiline maxLength={10} />
                        <AppFormField label="Placements" keyboardType='numeric' name="placements" maxLength={3} />
                        <AppFormField label="Return Visits" keyboardType='numeric' name="return_visits" maxLength={3} />
                        <AppFormField label="Number of Bible Studies" keyboardType='numeric' name="studies" maxLength={100} />
                        <View style={styles.dayAndTimeContainer}>
                            <AppInterestPicker name='students' label='Bible Students' list={allInterestsAndBs} />
                        </View>
                        <AppFormField label="Remark" name="comments" maxLength={120} multiline />

                        <View style={styles.buttonContainer}>
                            <View style={{ flex: 1 }}>
                                <Button title="Cancel" onPress={onCancel} />
                            </View>
                            <View style={{ flex: 1 }} >
                                <SubmitButton title="Save" />
                            </View>
                        </View>
                    </AppForm>
                </ScrollView>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 8,
        width: 300,
        maxWidth: 400,
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
    dayDropdown: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,
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
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
        borderRadius: 12
    },
    addButton: {
        backgroundColor: '#007AFF',
        borderColor: '#007AFF',
        borderRadius: 12
    },
    heading: {
        marginBottom: 5
    },
    dayAndTimeContainer: {
        columnGap: 10,
        marginTop: 15,
        position: 'relative',
    },
});



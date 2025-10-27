import React, { useMemo, useState } from "react";
import { Modal, View, ScrollView, TextInput, Platform, StyleSheet } from "react-native";

import { ThemedText } from "./ThemedText";
import Button from "./Button";
import AppForm from "./form/AppForm";
import AppFormField from "./form/FormField";
import SubmitButton from "./form/SubmitButton";
import { StudentsAndIntListProps } from "./form/AppFormPicker";
import { getSingleReport, updateSingleReport } from "@/config/db";
import { FormikHelpers } from "formik";
import { useQuery } from "@tanstack/react-query";

export interface ReportEditProp {
    id: number;
    date: string;
    placements: number;
    hours: number;
    return_visits: number;
    studies: number;
    comments?: string;
    students?: StudentsAndIntListProps[]
}

interface ReportInitialProp {
    id: number;
    date: string;
    placements: string;
    hours: string;
    return_visits: string;
    studies: string;
    comments?: string;
    students?: StudentsAndIntListProps[]
}

export default function ReportEditForm({ currentReport, visible, onCancel, onEdit }:
    {
        currentReport: ReportEditProp;
        visible: boolean;
        onCancel: () => void;
        onEdit: () => void;
    }) {

    const { id } = currentReport;

    const initialValues: ReportInitialProp = {
        id: currentReport.id,
        date: currentReport.date,
        hours: currentReport.hours.toString(),
        placements: currentReport.placements.toString(),
        return_visits: currentReport.return_visits.toString(),
        studies: currentReport.studies.toString(),
        comments: currentReport.comments,
    };

    const handleSubmit = async (values: ReportInitialProp, helpers: FormikHelpers<ReportInitialProp>) => {
        try {
            const { date, hours, placements, studies, return_visits, comments } = values;

            comments ? comments : 'None';

            const result = await updateSingleReport(
                id,
                date,
                parseFloat(hours),
                parseInt(placements),
                parseInt(return_visits),
                parseInt(studies),
                comments!
            );
            onEdit();
            onCancel();

        } catch (error) {
            console.log('ERROR: ', error);
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <ThemedText style={styles.heading} darkColor="grey" lightColor="grey" type="title">Edit Report</ThemedText>
                    <AppForm<ReportInitialProp>
                        initialValues={initialValues}
                        onSubmit={handleSubmit}>
                        <AppFormField label="Date" name="date" maxLength={40} />
                        <AppFormField name="hours" label="Hours" keyboardType='numeric' multiline maxLength={10} />
                        <AppFormField name="placements" label="Placements" keyboardType='numeric' maxLength={5} />
                        <AppFormField name="return_visits" label="Return Visits" keyboardType='numeric' maxLength={3} />
                        <AppFormField name="studies" label="Number of Bible Studies" keyboardType='numeric' maxLength={100} />

                        <AppFormField name="comments" label="Remark" maxLength={120} multiline />

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



import { Modal, View, ScrollView, StyleSheet } from "react-native";
import AppForm from "./form/AppForm";
import AppFormField from "./form/FormField";
import Button from "./Button";
import SubmitButton from "./form/SubmitButton";
import { ReportEditProp } from "./ReportEditForm";
import { ThemedText } from "./ThemedText";
import { addMonthlyReportTotal, getDiffStudents, openDatabase } from "@/config/db";
import { useQuery } from "@tanstack/react-query";
import getCurrentDate from "@/scripts/getCurrentDate";
import { FormikHelpers } from "formik";
import { Toast } from "toastify-react-native";

export interface MonthlyReportProp {
    month: string;
    hours: string;
    placements: string;
    return_visits: string;
    studies: string;
}

export default function LateReportEditForm({ monthReport, visible, onCancel, onEdit }: {
    monthReport: MonthlyReportProp,
    visible: boolean,
    onCancel: () => void,
    onEdit: () => void
}) {
    const { month, hours, placements, return_visits, studies } = monthReport;

    const initialValues: MonthlyReportProp = {
        month,
        placements,
        hours,
        return_visits,
        studies,
    }

    const handleSubmit = async (values: MonthlyReportProp, helpers: FormikHelpers<MonthlyReportProp>) => {
        try {
            const { month, placements, hours, return_visits, studies } = values;
            console.log('Valuesr: ', values);
            const response = await addMonthlyReportTotal(month, parseInt(placements), parseFloat(hours), parseInt(return_visits), parseInt(studies));
            if (response.success) {
                // Toast.success('Successfully saved.', 'bottom');
                onEdit();
                onCancel();
            }
        } catch (error) {
            console.log('Error saving monthly total: ', error);
        }

    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.modalContainer}>
                <ScrollView contentContainerStyle={styles.modalContent}>
                    <ThemedText style={styles.heading} darkColor="grey" lightColor="grey" type="title">Edit Report Totals</ThemedText>
                    <AppForm<MonthlyReportProp>
                        initialValues={initialValues}
                        onSubmit={handleSubmit}>
                        <AppFormField label="Month" name="month" maxLength={40} />
                        <AppFormField name="placements" label="Placements" keyboardType="numeric" maxLength={5} />
                        <AppFormField name="hours" label="Hours" keyboardType="numeric" multiline maxLength={10} />
                        <AppFormField name="return_visits" label="Return Visits" keyboardType="numeric" maxLength={3} />
                        <AppFormField name="studies" label="Number of Bible Studies" keyboardType="numeric" maxLength={100} />

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
}


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

import { useState } from 'react';
import { Modal, Pressable, StyleSheet, ScrollView, View } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import AppFormField from './form/FormField';
import { IconSymbol } from './ui/IconSymbol';
import AppForm from './form/AppForm';
import { useFormikContext } from "formik";
import TextInputField from './form/TextInputField';
import SubmitIcon from './form/SubmitIcon';
import { addNote } from '@/config/db';

interface NoteProps {
    title: string;
    content: string;
}

export default function NewNoteModal({ visible, onCancel, onAddNote }:
    {
        visible: boolean,
        onCancel: () => void,
        onAddNote: () => void
    }) {
    const [title, setTitle] = useState<string>('Title');
    const [noteBody, setNoteBody] = useState<string>('Content');

    const initialValues: NoteProps = {
        title: '',
        content: ''
    }

    const handleSubmit = async (values: NoteProps) => {
        // console.log('Values: ', values)
        const { title, content } = values;
        const today = new Date();
        const date_created = today.toString();
        const response = await addNote(title, content, date_created);
        console.log('AddNote response: ', response);
        onAddNote();
        onCancel();
    }

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <ScrollView style={styles.modalContent}>
                    <AppForm<NoteProps>
                        initialValues={initialValues}
                        onSubmit={handleSubmit}>
                        <View style={styles.iconRow}>
                            <SubmitIcon />
                            <Pressable onPress={onCancel}>
                                <IconSymbol name='xmark' size={26} color='gray' weight='bold' />
                            </Pressable>
                        </View>

                        <TextInputField
                            name='title'
                            placeholder='Title'
                            placeholderTextColor='#aaa'
                            style={styles.title} />

                        <TextInputField
                            name='content'
                            placeholder='Note'
                            placeholderTextColor='#aaa'
                            multiline
                            style={styles.note} />
                    </AppForm>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContent: {
        paddingTop: 10,
        paddingBottom: 24,
        paddingHorizontal: 16,
        height: '100%',
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#282828' // '#ADD8E6' // '#00BFFF'
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        padding: 12
    },
    title: {
        fontWeight: '600',
        fontSize: 20,
        paddingBottom: 2,
        marginBottom: 4,
        color: 'white',
        lineHeight: 28
    },
    note: {
        color: '#ccc',
        fontSize: 18,
        lineHeight: 26
    }
})
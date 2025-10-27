import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ButtonIcon } from './ButtonIcon';

export default function MapAlertTwoBtnModal({ actionBtnTitle, message, title, visible, onCancel, onDecide }: {
    title: string;
    message: string;
    visible: boolean;
    onCancel: () => void;
    onDecide: () => void;
    actionBtnTitle: string;
}) {

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <ThemedText darkColor='black' lightColor='black' type='subtitle' >
                        {title}
                    </ThemedText>
                    <ThemedText darkColor='black' lightColor='black' type='default' style={{ marginVertical: 6 }}>{message}</ThemedText>
                    <View style={styles.actionRow}>
                        <ButtonIcon title='Cancel' name='xmark' color='white' onPress={onCancel} />
                        <ButtonIcon title={actionBtnTitle} name='trash' color='white' onPress={onDecide} />

                    </View>
                </View>
            </View>

        </Modal>
    )
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
        paddingBottom: 14,
        paddingHorizontal: 16,
        height: 'auto',
        width: 250,
        borderRadius: 12,
        backgroundColor: '#ADD8E6' // '#00BFFF'
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10
    },
})

//  #4C516D
import { Modal, StyleSheet, View } from 'react-native';
import { ThemedText } from './ThemedText';
import { ButtonIcon } from './ButtonIcon';

export default function DelConfirmModal({ visible, onCancel, onDelete }: {
    visible: boolean;
    onCancel: () => void;
    onDelete: () => void;
}) {

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <ThemedText darkColor='black' lightColor='black' type='subtitle' >
                        Confirm Deletion
                    </ThemedText>
                    <ThemedText darkColor='black' lightColor='black' type='default' style={{ marginVertical: 6 }}>Are you sure you want to delete this item</ThemedText>
                    <View style={styles.actionRow}>
                        <ButtonIcon title='Cancel' name='xmark' color='white' onPress={onCancel} />
                        <ButtonIcon title='Delete' name='trash' color='white' onPress={onDelete} />

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
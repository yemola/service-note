import { useState } from 'react';
import { Modal, Share, StyleSheet, Switch, View } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { ButtonIcon } from './ButtonIcon';
import { MonthlyReport } from '@/app/(tabs)/report';
import convertDateString from '@/scripts/convertDateString';

export default function ReportSubmForm({ actionBtnTitle, message, title, visible, onCancel, onShare }: {
    title: string;
    message: MonthlyReport;
    visible: boolean;
    onCancel: () => void;
    onShare: () => void;
    actionBtnTitle: string;
    isPioneer?: boolean;
}) {
    const [isPioneer, setIsPioneer] = useState<boolean>(false);
    const dateStr = message?.date;
    const month = convertDateString(dateStr);

    const shortMsg = `${month}\nParticipated: Yes\nBible Studies: ${message.studies}`;
    const longMsg = `${month}\nHours: ${message.hours}\nBible Studies: ${message.studies}\nComments: ${message.comments || 'None'}
                        `;
    const msgToDisplay = isPioneer ? longMsg : shortMsg;

    const handleRepSubmission = async () => {
        shareReport();
        onShare();
    }

    const shareReport = () => {

        Share.share({
            message: msgToDisplay,
        })
            .then((result) => {
                if (result.action === Share.sharedAction) {
                    if (result.activityType) {
                        console.log('Shared with activity type:', result.activityType);
                    } else {
                        console.log('Shared successfully');
                    }
                } else if (result.action === Share.dismissedAction) {
                    console.log('Sharing dismissed');
                }
            })
            .catch((error) => console.log('Sharing error:', error));
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <ThemedText darkColor='black' lightColor='black' type='subtitle' >
                        {title}
                    </ThemedText>
                    <View style={styles.row}>
                        <ThemedText darkColor='black' lightColor='black'>Reg. Pioneer</ThemedText>
                        <Switch
                            value={isPioneer}
                            onValueChange={() => setIsPioneer(!isPioneer)} />
                    </View>

                    <ThemedText darkColor='black' lightColor='black' type='default' style={{ marginVertical: 6 }}>{msgToDisplay}</ThemedText>
                    <View style={styles.actionRow}>
                        <ButtonIcon title='Cancel' name='xmark' color='white' onPress={onCancel} />
                        <ButtonIcon title={actionBtnTitle} name='arrow.up' color='white' onPress={handleRepSubmission} />

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
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})

//  #4C516D
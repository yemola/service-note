import { Pressable, StyleSheet, View } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

export default function ImageEdit({ onChange, onRestore }: { onChange: () => void, onRestore: () => void }) {

    return (
        <View style={styles.container}>
            <Pressable onPress={onRestore} style={styles.iconBg}>
                <IconSymbol name='arrow.clockwise' color='#001530' weight="bold" size={20} style={styles.iconStyle} />
            </Pressable>
            <Pressable onPress={onChange} style={styles.iconBg}>
                <IconSymbol name='camera.fill' color='#001530' size={20} style={styles.iconStyle} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-end',
        rowGap: 10,
        width: 24,
        bottom: 4,
        marginRight: 10
    },
    iconStyle: {

    },
    iconBg: {
        padding: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderRadius: '50%'
    }
})
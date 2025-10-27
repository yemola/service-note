import React from 'react'
import { OpaqueColorValue, Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from './ThemedText'
import { IconSymbol, IconSymbolName } from './ui/IconSymbol'


export const ButtonIcon = ({
    name, size = 16, title, color, onPress
}: {
    name: IconSymbolName;
    title: string;
    size?: number;
    color: string | OpaqueColorValue;
    onPress: () => void;
}) => {
    return (
        <Pressable style={styles.container} onPress={onPress}>
            <IconSymbol name={name} size={size} color={color} />
            <ThemedText lightColor='white'>{title}</ThemedText>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: '#152640',
        borderRadius: 10,
        columnGap: 6,
        width: '40%'
    }
})
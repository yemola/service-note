import { FontAwesome6 } from '@expo/vector-icons'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'

interface Props {
    onPress: () => void;
}

export function AddButton({ onPress }: Props) {
    return (
        <Pressable style={styles.addBtn} onPress={onPress}>
            <FontAwesome6 name="add" size={24} color="black" />
        </Pressable>
    )
}

const styles = StyleSheet.create({
    addBtn: {
        position: 'absolute',
        bottom: 20, // Adjust to place above tab navigation
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#61DAFB',
        borderRadius: 15,
        height: 45,
        width: 45,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // Adds shadow for Android
    },
})

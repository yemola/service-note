import React from 'react'
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
    title: string;
    onPress: () => void;
}

const Button = ({ onPress, title }: Props) => {
    return (
        <Pressable
            style={styles.button}
            onPress={onPress}>
            <Text style={styles.text}>{title}</Text>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#152640',
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
        width: "100%",
        marginVertical: 10,
    },
    text: {
        color: 'white',
        fontSize: 16,
        textTransform: "uppercase",
        fontWeight: "bold",
    },
})

export default Button
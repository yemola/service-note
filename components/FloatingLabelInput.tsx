import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { useState } from 'react';

interface FloatingLabelInputProps extends TextInputProps {
    label: string;
}

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ label, value, onChangeText, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={[styles.label, (isFocused || value) && styles.labelFocused]}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={[styles.input, isFocused && styles.inputFocused]}
                {...props} // Spread additional TextInput props
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        marginBottom: 20,
    },
    label: {
        position: 'absolute',
        left: 10,
        top: 18,
        fontSize: 16,
        color: 'gray',
    },
    labelFocused: {
        top: -8,
        fontSize: 12,
        color: 'purple',
    },
    input: {
        minHeight: 38,
        maxHeight: 70,
        borderBottomWidth: 1,
        borderColor: 'gray',
        borderRadius: 14,
        fontSize: 16,
        paddingHorizontal: 10,
        marginBottom: 0,
        paddingTop: 4,
        paddingBottom: 0,
    },
    inputFocused: {
        borderColor: 'purple',
    },
});

export default FloatingLabelInput;

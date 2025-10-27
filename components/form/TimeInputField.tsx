import { useFormikContext } from "formik";
import { View, Pressable, TextInput, StyleSheet } from "react-native";

interface TimeProps {
    name: string;
    label: string;
}

function TimeInputField({ name, label, ...otherProps }: TimeProps) {
    const { values, setFieldValue } = useFormikContext<{ [key: string]: any }>();

    const handleSelect = (value: string) => {
        setFieldValue(name, value);
        // setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            <Pressable >
                <TextInput
                    onChangeText={(text) => setFieldValue(name, text)}
                    style={styles.text}
                    placeholder="Enter time"
                    placeholderTextColor="white"
                    value={values[name]}
                    {...otherProps}
                />

            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#152640',
        borderWidth: 1,
        borderRadius: 10,
        paddingLeft: 12,
        width: '50%'
    },
    text: {
        color: "white",
        fontSize: 14,
        paddingVertical: 6
    }
})

export default TimeInputField;

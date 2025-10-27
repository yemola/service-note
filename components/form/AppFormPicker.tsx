import { useState } from 'react';
import { useFormikContext } from "formik";
import { View, Pressable, Modal, Text, FlatList, StyleSheet } from "react-native";

export interface StudentsAndIntListProps {
    id: number;
    name: string;
}
interface AppFormPickerProps {
    name: string;
    label: string;
    items?: string[];
    list?: StudentsAndIntListProps[]; // For Day selection
}

function AppFormPicker({ name, label, items }: AppFormPickerProps) {
    const { values, setFieldValue } = useFormikContext<{ [key: string]: any }>();
    const [showPicker, setShowPicker] = useState(false);

    const handleSelect = (value: string | Date) => {
        setFieldValue(name, value);
        setShowPicker(false);
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setShowPicker(!showPicker)}>
                <Text style={styles.text}>{values[name] ? values[name].toString() : "Select " + label}</Text>
            </Pressable>

            {showPicker && (
                <View style={styles.dayDropdown}>
                    <View style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                        {items && (
                            items.map((item) => (
                                <Pressable onPress={() => handleSelect(item)} key={item}>
                                    <Text style={{ color: "white", paddingVertical: 4 }}>{item}</Text>
                                </Pressable>
                            ))
                        )}
                    </View>
                </View>
            )}
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
    dayModal: {
        backgroundColor: '#152640',
        padding: 10,
        width: "30%",
    },
    dayDropdown: {
        flex: 1,  // Allow the dropdown to take up available space
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,  // Add some spacing between dropdown and time
        backgroundColor: '#152640',
        color: 'white',
        position: 'absolute',
        top: 33,
        left: 2,
        width: 120,
        zIndex: 20
    },
    text: {
        color: "white",
        fontSize: 14,
        paddingVertical: 6
    }
})

export default AppFormPicker;

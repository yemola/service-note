import { useState } from 'react';
import { useFormikContext } from "formik";
import { View, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { ThemedText } from '../ThemedText';

export interface StudentsAndIntListProps {
    id: number;
    name: string;
}

interface MultiSelectPickerProps {
    name: string;
    label: string;
    list?: StudentsAndIntListProps[];
}

function AppInterestPicker({ name, label, list }: MultiSelectPickerProps) {
    const { values, setFieldValue } = useFormikContext<{ [key: string]: any }>();
    const [showPicker, setShowPicker] = useState(false);
    const [selectedItems, setSelectedItems] = useState<StudentsAndIntListProps[]>(values[name] || []);

    // const handleSelect = (item: StudentsAndIntListProps) => {
    //     setSelectedItems((prevSelectedItems) => {
    //         const isSelected = prevSelectedItems.some((selectedItem) => selectedItem.id === item.id);
    //         const newSelectedItems = isSelected
    //             ? prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id)
    //             : [...prevSelectedItems, item];

    //         setFieldValue(name, newSelectedItems);
    //         return newSelectedItems;
    //     });
    // };

    const handleSelect = (item: StudentsAndIntListProps) => {
        setSelectedItems((prevSelectedItems) => {
            const isSelected = prevSelectedItems.some((selectedItem) => selectedItem.id === item.id);
            return isSelected
                ? prevSelectedItems.filter((selectedItem) => selectedItem.id !== item.id)
                : [...prevSelectedItems, item];
        });
        // Call setFieldValue after updating the local state
        setFieldValue(name, selectedItems.some((selectedItem) => selectedItem.id === item.id)
            ? selectedItems.filter((selectedItem) => selectedItem.id !== item.id)
            : [...selectedItems, item]
        );
    };

    const getSelectedText = () => {
        if (selectedItems.length === 0) {
            return `Select ${label}`;
        }
        return selectedItems.map((item) => item.name).join(', ');
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={() => setShowPicker(!showPicker)}>
                <Text style={styles.text}>{getSelectedText()}</Text>
            </Pressable>

            {showPicker && (
                <View style={styles.dayDropdown}>
                    <ScrollView style={{ paddingHorizontal: 12, paddingBottom: 6, paddingTop: 2, maxHeight: 200 }}>
                        <Pressable onPress={() => setShowPicker(false)}>
                            <ThemedText lightColor='white' style={{ fontSize: 13, textAlign: 'right' }} >Close</ThemedText>
                        </Pressable>
                        {list && (
                            list.map((item, index) => (
                                <Pressable
                                    onPress={() => handleSelect(item)}
                                    key={item.name + index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingVertical: 4,
                                    }}
                                >
                                    {selectedItems.some(selectedItem => selectedItem.name === item.name) && (
                                        <MaterialIcons name="check" size={20} color="lightblue" style={{ marginRight: 8 }} />
                                    )}
                                    <Text style={{ color: "white" }}>{item.name}</Text>
                                </Pressable>
                            ))
                        )}
                    </ScrollView>
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
    dayDropdown: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginRight: 10,
        backgroundColor: '#152640',
        color: 'white',
        position: 'absolute',
        top: 33,
        left: 2,
        width: 200,
        zIndex: 20
    },
    text: {
        color: "white",
        fontSize: 14,
        paddingVertical: 6
    },
});

export default AppInterestPicker;

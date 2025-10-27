import { useEffect, useState } from "react";
import { Modal, View, ScrollView, TextInput, Platform, StyleSheet } from "react-native";
import * as Location from 'expo-location';

import { ThemedText } from "./ThemedText";
import Button from "./Button";
import AppForm from "./form/AppForm";
import AppFormField from "./form/FormField";
import SubmitButton from "./form/SubmitButton";
import AppFormPicker from "./form/AppFormPicker";
import TimeInputField from "./form/TimeInputField";
import { convertToBibleStudy, InterestedPerson, updateInterestedPerson } from "@/config/db";
import { FormikHelpers } from "formik";
import { InterestDetails } from "./ReturnVisitForm";
import { Toast } from "toastify-react-native";

export interface InterestProps {
  id: number,
  name: string,
  last_visit: string,
  address: string,
  phone: string,
  topic: string,
  placement: string,
  appointment: string,
  note: string,
  latitude: number,
  longitude: number,
}

export default function RVToBibleStudyForm({ currentInterest, visible, onCancel, onConversion }: {
  currentInterest: InterestedPerson,
  visible: boolean;
  onCancel: () => void;
  onConversion: () => void
}) {
  const cAppointment = currentInterest?.appointment;
  const id = currentInterest?.id;

  // const currentDay = cAppointment.split(" ")[0];
  const [currentDay, ...timeParts] = cAppointment?.split(" ");
  const currentTime = timeParts.join(" ").trim();

  const [geolocation, setGeolocation] = useState<InterestDetails['geolocation']>(undefined);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setGeolocation({
        latitude: Number(location.coords.latitude),
        longitude: Number(location.coords.longitude),
      });
      console.log(geolocation);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const initialValues: InterestDetails = {
    name: currentInterest.name,
    address: currentInterest.address,
    topic: currentInterest.topic,
    placement: currentInterest.placement,
    day: currentDay,
    time: currentTime,
    phone: currentInterest.phone,
    note: currentInterest.note,
    last_visit: currentInterest.last_visit!,
  };

  const handleSubmit = async (values: InterestDetails, helpers: FormikHelpers<InterestDetails>) => {
    try {
      const { placement, day, time, note } = values;
      let latitude = geolocation?.latitude ? geolocation?.latitude : currentInterest?.latitude;
      let longitude = geolocation?.longitude ? geolocation?.longitude : currentInterest?.longitude;
      let appointment = `${day} ${time}`;

      const result = await convertToBibleStudy(
        currentInterest.id,
        currentInterest.name,
        currentInterest.address!,
        currentInterest.phone!,
        placement!,
        appointment,
        note!,
        latitude,
        longitude,
      );
      if (result?.success) {
        Toast.show({
          type: 'success',
          text1: 'Successfully converted',
          position: 'bottom',
          visibilityTime: 4000,
          autoHide: true,
        })
      }
      // Reset geolocation
      setGeolocation(undefined);
      onConversion();
      onCancel();
    } catch (error) {
      console.log('ERROR: ', error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Error converting interest.',
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
      })
    }
  }

  const locationTitle = geolocation ? "Location Saved" : "Get Location";

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <ThemedText style={styles.heading} darkColor="grey" lightColor="grey" type="title">Record As Study </ThemedText>
          <AppForm<InterestDetails>
            initialValues={initialValues}
            onSubmit={handleSubmit}>
            <View style={{ marginBottom: 20 }}>
              <ThemedText darkColor="gray" lightColor="grey" type="defaultSemiBold">Name: {currentInterest?.name}</ThemedText>
              <ThemedText darkColor="gray" lightColor="grey" type="defaultSemiBold">Phone: {currentInterest?.phone}</ThemedText>
              <ThemedText darkColor="gray" lightColor="grey" type="defaultSemiBold">Address: {currentInterest?.address}</ThemedText>
            </View>
            <AppFormField label="Study Pub" name="placement" maxLength={100} />
            <View style={styles.appointmentContainer}>
              <ThemedText darkColor="black" lightColor="black" >Appointment</ThemedText>
              <View style={styles.dayAndTimeContainer}>
                <AppFormPicker name="day" label="Study Day" items={daysOfWeek} />
                <TimeInputField label="Time" name="time" />
              </View>
            </View>

            <AppFormField label="Note" name="note" maxLength={120} multiline />
            <Button title={locationTitle} onPress={handleLocation} />

            <View style={styles.buttonContainer}>
              <View style={{ flex: 1 }}>
                <Button title="Cancel" onPress={onCancel} />
              </View>
              <View style={{ flex: 1 }} >
                <SubmitButton title="Convert" />
              </View>
            </View>
          </AppForm>
        </ScrollView>
      </View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  // ... (rest of your existing styles)
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    width: 300,
    maxWidth: 400, // Limit width for larger screens
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10
  },
  appointmentContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  dayAndTimeContainer: {  // Style for the container
    flexDirection: 'row', // Arrange day and time horizontally
    alignItems: 'flex-start', // Vertically align day and time
    justifyContent: 'center',
    columnGap: 10,
    marginTop: 15,
    position: 'relative',
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
    top: 40,
    left: 10,
    width: 120,
    zIndex: 20
  },
  locationButton: {
    marginBottom: 10,
  },
  cancelButton: {
    marginRight: 10,
    backgroundColor: '#FF3B30',  // Example: Red for cancel
    borderColor: '#FF3B30',
    borderRadius: 12
  },
  addButton: {
    backgroundColor: '#007AFF', // Example: Blue for add
    borderColor: '#007AFF',
    borderRadius: 12
  },
  heading: {
    marginBottom: 15
  },
});



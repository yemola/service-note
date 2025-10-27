import { useState } from "react";
import { Linking, StyleSheet, Platform, View, ActivityIndicator, Button, ImageBackground, Pressable } from 'react-native';
import * as Location from 'expo-location';
import * as Clipboard from "expo-clipboard";
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { InterestedPerson, getRecentInterests } from '../../config/db';
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ExternalLink } from "@/components/ExternalLink";
import { useQuery } from "@tanstack/react-query";
import { Collapsible } from "@/components/Collapsible";
import MapAlertModal from "@/components/MapAlertModal";
import MapAlertTwoBtnModal from "@/components/MapAlertTwoBtnModal";
import RVToBibleStudyForm from "@/components/RVToBibleStudyForm";
import ImageEdit from "@/components/ImageEdit";
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen() {
  const [showConversionForm, setShowConversionForm] = useState<boolean>(false);
  const [showMapAlert, setShowMapAlert] = useState<boolean>(false);
  const [isLongPressed, setIsLongPressed] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState({
    title: '',
    message: ''
  });
  const [showMapAlertTwoBtn, setShowMapAlertTwoBtn] = useState<boolean>(false);
  const [currentInterest, setCurrrentInterest] = useState<InterestedPerson>({
    id: 0,
    userId: 1,
    name: '',
    address: '',
    topic: '',
    placement: '',
    appointment: '',
    phone: '',
    note: '',
    last_visit: '',
    latitude: 0, longitude: 0
  });

  const [topImg, setTopImg] = useState<string | null>(null); // Initial image

  const pickAndResizeImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // This is important for iOS to allow some basic adjustments
      aspect: [16, 9], // Example: Requesting a 16:9 aspect ratio
      quality: 0.8, // Adjust as needed
    });

    if (!result.canceled) {
      setTopImg(result.assets[0].uri);
    }
  };

  const fetchRecentInterests = async () => {
    try {
      const rvList = await getRecentInterests();
      return rvList || [];
    } catch (error) {
      console.error('❌ Error fetching return visits', error);
      return [];
    }
  }

  const { data = [], refetch } = useQuery<InterestedPerson[], Error>({
    queryKey: ['interest-list'],
    queryFn: fetchRecentInterests,
    initialData: []
  })

  const handleCopyNumber = async (number: string) => {
    if (number) {
      await Clipboard.setStringAsync(number);
    }
  }

  const handleDialNumber = async (number: string) => {
    console.log('Dialing number: ', number);
    if (number) {
      callStudent(number);
    }
  }

  const callStudent = (phoneNumber: string) => {
    const formattedPhoneNumber = `tel:${phoneNumber}`;

    Linking.canOpenURL(formattedPhoneNumber)
      .then((supported) => {
        if (!supported) {
          setShowMapAlert(true);
          setAlertMsg({ title: 'Error!', message: `The URL: ${formattedPhoneNumber} cannot be opened. Make sure you are on a device capable of making calls.` })
        } else {
          return Linking.openURL(formattedPhoneNumber);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const handleConversion = async (per: InterestedPerson) => {
    setCurrrentInterest(per);
    setShowConversionForm(true);
  }

  const handleGetDirection = async (per: InterestedPerson) => {
    try {
      if (!per.latitude && !per.longitude) {
        setShowMapAlert(true);
        setAlertMsg({ title: 'Oops!', message: `Interested person's location not saved. \nSave the location on your next visit.` })
        return;
      }

      await checkAndOpenGoogleMaps(per.latitude, per.longitude);
    } catch (error) {
      console.log('Get Direction Error: ', error);
    }
  }

  const checkAndOpenGoogleMaps = async (destinationLatitude: number, destinationLongitude: number) => {
    const { status } = await Location.requestForegroundPermissionsAsync(); // Request permission

    if (status !== 'granted') {
      setShowMapAlertTwoBtn(true);
      return;
    }

    // If permission is granted, proceed to open Google Maps
    openGoogleMapsDirections(destinationLatitude, destinationLongitude);
  };


  const openGoogleMapsDirections = (destinationLatitude: number, destinationLongitude: number) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'google.navigation:q=' });
    const latLng = `${destinationLatitude},${destinationLongitude}`;
    const label = 'Student\'s Location';

    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}&saddr=Current+Location`,
      android: `${scheme}${latLng}`,
    });

    Linking.openURL(url!)
      .catch(err => {
        console.error('Error opening Google Maps:', err);
        setShowMapAlert(true);
        setAlertMsg({ title: 'Google Maps Not Found', message: 'It seems Google Maps is not installed on your device. Please install it from your app store to use this feature.' });
      });
  };

  const handleAdjustLocationSetting = async () => {
    Linking.openSettings();
  }

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
        headerImage={<View style={styles.headerContainer}>
          <ImageBackground
            source={topImg ? { uri: topImg } : require('@/assets/images/preaching7.jpg')}
            style={styles.topImage}
            resizeMode='cover'
          >
            <ImageEdit onChange={pickAndResizeImage} onRestore={() => setTopImg(null)} />

            <ThemedView lightColor='rgba(0, 0, 0, 0.5)' darkColor='rgba(0, 0, 0, 0.5)' style={styles.pgTheme}>
              <ThemedText style={{ textAlign: 'center', fontSize: 14 }}>"Preach the word, be at it urgently" - 2Tim 4:2</ThemedText>
            </ThemedView>

          </ImageBackground>
        </View>}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Service Note</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText style={{ fontStyle: 'italic' }}>Keep accurate record of your field service activities.</ThemedText>
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.subHeading}>Recent Interests</ThemedText>
          {data?.length > 0 ? (data?.map((per, index) => <ThemedView key={per.id}>
            <Collapsible title={per.name} >
              <View style={styles.detailsContainer}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText lightColor="white" type="defaultSemiBold">Phone:</ThemedText>
                  <Pressable onLongPress={() => handleCopyNumber(per.phone!)}
                    onPressIn={() => setIsLongPressed(true)}
                    onPressOut={() => setIsLongPressed(false)}
                    style={[styles.phoneNumberContainer,
                    isLongPressed && styles.phoneNumberLongPressed]}>
                    <ThemedText type='link' style={{ fontSize: 15 }}>{per.phone || 'No number'}</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => handleDialNumber(per.phone!)}>
                    <IconSymbol name='phone.fill' size={16} color='white' />
                  </Pressable>
                </View>

                <ThemedText lightColor="white" type="defaultSemiBold">Appointment: <ThemedText style={styles.value}>{per.appointment}</ThemedText></ThemedText>
                <ThemedText lightColor="white">Placement: <ThemedText style={styles.value}>{per.placement}</ThemedText></ThemedText>
                <ThemedText lightColor="white">Topic: <ThemedText style={styles.value}>{per.topic}</ThemedText></ThemedText>
                <ThemedText lightColor="white">Address: <ThemedText style={styles.value}>{per.address}</ThemedText></ThemedText>

                <View style={styles.linkRow}>
                  <Pressable onPress={() => handleConversion(per)}>
                    <ThemedText type="link" style={{ marginRight: 42, fontSize: 14 }}>Convert to Bible Study</ThemedText>
                  </Pressable>
                  <Pressable onPress={() => handleGetDirection(per)}>
                    <ThemedText type="link" style={{ fontSize: 14 }}>Get Direction</ThemedText>
                  </Pressable>

                </View>
              </View>
            </Collapsible>
          </ThemedView>)) : <ThemedText style={{ fontSize: 15, color: '#aaa' }}>None for now.</ThemedText>
          }
        </ThemedView>

        <ThemedView style={styles.linksContainer}>
          <ThemedText style={styles.subHeading}>Quick Links</ThemedText>
          <ExternalLink href="https://www.jw.org/en/bible-teachings/bible-study-tools/">
            <ThemedText type="link">
              Bible Study Tools
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.jw.org/en/bible-teachings/family/">
            <ThemedText type="link">
              Marriage & Family
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.jw.org/en/bible-teachings/teenagers/">
            <ThemedText type="link">
              Teens & Young Adults
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.jw.org/en/bible-teachings/children/">
            <ThemedText type="link">
              Children
            </ThemedText>
          </ExternalLink>
          <ExternalLink href="https://www.jw.org/en/whats-new/">
            <ThemedText type="link">
              What's new on <ThemedText type="link" style={{ fontStyle: 'italic' }}>JW</ThemedText>
            </ThemedText>
          </ExternalLink>
        </ThemedView>

        {showConversionForm && (
          <RVToBibleStudyForm
            currentInterest={currentInterest}
            visible={showConversionForm}
            onCancel={() => setShowConversionForm(false)}
            onConversion={() => console.log('Converting to Bible Study.')}
          />
        )}


        <MapAlertModal
          title={alertMsg.title}
          message={alertMsg.message}
          visible={showMapAlert}
          onCancel={() => setShowMapAlert(false)}
        />

        <MapAlertTwoBtnModal
          actionBtnTitle='Open Settings'
          title='Location Permission Required'
          message='To get directions, please enable location permissions for this app in your device settings.'
          visible={showMapAlertTwoBtn}
          onCancel={() => setShowMapAlertTwoBtn(false)}
          onDecide={handleAdjustLocationSetting} />

      </ParallaxScrollView>
      {/* <AddButton onPress={() => console.warn('Add item')} /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  headerContainer: {
    marginTop: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailsContainer: {
    borderRadius: 16,
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingBottom: 0,
    paddingTop: 8
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 25,
    marginVertical: 12
  },
  topImage: {
    justifyContent: 'center',
    height: 178,
    width: "100%",
  },
  pgTheme: {
    paddingVertical: 3,
    width: '100%',
    bottom: 4
  },
  subHeading: {
    fontWeight: 'bold',
    fontSize: 17
  },
  linksContainer: {
    rowGap: 5
  },
  phoneNumberContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    marginRight: 12
  },
  phoneNumberLongPressed: {
    backgroundColor: '#ADD8E6'
  },
  value: {
    color: '#baa',
    fontSize: 15
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 7
  },

});

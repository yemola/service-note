
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import ToastManager from 'toastify-react-native';
import 'react-native-reanimated';
import { initializeDatabase, addUser } from '../config/db';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Text, View } from 'react-native';

interface ToastProps {
  text1: string;
  text2?: string;
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const toastConfig = {
  success: ({ text1, text2 }: ToastProps) => (
    <View style={{ backgroundColor: '#bcfe83', padding: 8, borderRadius: 10 }}>
      <Text style={{ color: 'black', fontWeight: 'bold' }}>{text1}</Text>
      {text2 && <Text style={{ color: 'black' }}>{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }: ToastProps) => (
    <View style={{ backgroundColor: '#e12729', padding: 16, borderRadius: 10 }}>
      <Text style={{ color: 'white', fontWeight: 'bold' }}>{text1}</Text>
      {text2 && <Text style={{ color: 'white' }}>{text2}</Text>}
    </View>
  )
  // Override other toast types as needed
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initializeApp = async () => {
      try {
        initializeDatabase();

        const firstLaunch = await AsyncStorage.getItem("isFirstLaunch");
        if (!firstLaunch) {
          addUser();
          await AsyncStorage.setItem("isFirstLaunch", "true");
        }
      } catch (error) {
        console.error("Initialization Error:", error);
      }
    };

    initializeApp();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" translucent={true} />
        <ToastManager config={toastConfig} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}







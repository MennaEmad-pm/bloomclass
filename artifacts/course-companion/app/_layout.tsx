import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Platform, UIManager, View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        await Font.loadAsync({
          PlayfairDisplay_400Regular,
          PlayfairDisplay_700Bold,
          DMSans_400Regular,
          DMSans_500Medium,
          DMSans_700Bold,
        });
      } catch (_e) {
        // carry on — fonts may partially load; icons self-heal via componentDidMount
      } finally {
        if (!cancelled) {
          setReady(true);
          SplashScreen.hideAsync().catch(() => {});
        }
      }
    }

    loadAll();

    // Hard timeout: never block the UI for more than 4 seconds
    const timer = setTimeout(() => {
      if (!cancelled) {
        setReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    }, 4000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF3EE' }}>
        <ActivityIndicator color="#C9748A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <RootLayoutNav />
            <Toast />
          </GestureHandlerRootView>
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

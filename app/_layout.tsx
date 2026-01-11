import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import { UserProvider, useUser } from '@/hooks/use-user';
import { Colors } from "@/constants/theme";
import { vendorService } from "@/src/services/vendorService";

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <UserProvider>
      <RootLayoutContent />
    </UserProvider>
  );
}

function RootLayoutContent() {
  const { onboardingComplete, isLoading: userLoading } = useUser();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize mock data if needed
        await vendorService.initializeMockData();
        setAppReady(true);
      } catch (error) {
        console.error("Error initializing app:", error);
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!appReady || userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.dark.bg,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={Colors.dark.accentPrimary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" />
      {onboardingComplete ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.dark.bg,
            },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="maps" options={{ headerShown: false }} />
          <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
          <Stack.Screen
            name="vendor/[id]"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      ) : (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: Colors.dark.bg,
            },
          }}
        >
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        </Stack>
      )}
    </>
  );
}

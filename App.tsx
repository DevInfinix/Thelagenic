import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VendorRegistration from './screens/VendorRegistration';
import VendorDashboard from './screens/VendorDashboard';

export type RootStackParamList = {
  VendorRegistration: undefined;
  VendorDashboard: { vendorId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="VendorRegistration"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#111827' },
          }}
        >
          <Stack.Screen name="VendorRegistration" component={VendorRegistration} />
          <Stack.Screen name="VendorDashboard" component={VendorDashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
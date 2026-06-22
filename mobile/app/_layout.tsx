import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import "@/features/settings/notificationsSetup";
import { PrototypeProvider } from '@/features/prototype/state';
import { SubscriptionGate } from '@/features/subscription/SubscriptionGate';
import { SubscriptionProvider } from '@/features/subscription/SubscriptionProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={DefaultTheme}>
        <PrototypeProvider>
          <SubscriptionProvider>
            <SubscriptionGate>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="week/[weekNumber]" options={{ headerShown: false }} />
                <Stack.Screen name="testing-center/[month]" options={{ headerShown: false }} />
                <Stack.Screen name="legal" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
              </Stack>
              <StatusBar style="dark" />
            </SubscriptionGate>
          </SubscriptionProvider>
        </PrototypeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

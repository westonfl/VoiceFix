import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, usePathname } from 'expo-router';
import { type PropsWithChildren, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RehearTheme as theme } from '@/constants/theme';
import { usePrototype } from '@/features/prototype/state';

import { CustomPaywall } from './CustomPaywall';
import { useSubscription } from './SubscriptionProvider';

function getSubscriptionErrorCopy(error: string | null) {
  if (!__DEV__) {
    return 'Subscriptions are not available in this build yet. Please try again later or restore an existing purchase.';
  }

  if (!error) {
    return 'RevenueCat could not load the current offering. Check the app configuration and try again.';
  }

  const lowerError = error.toLowerCase();

  if (
    lowerError.includes('no app store products') ||
    lowerError.includes('no available packages') ||
    lowerError.includes('offerings are empty') ||
    lowerError.includes('offerings-empty')
  ) {
    return [
      'RevenueCat is connected, but this build has no products to show.',
      '',
      'Check that RevenueCat has an active current offering with App Store products for bundle ID com.ov.rehear, and that those products are attached to the pro entitlement.',
    ].join('\n');
  }

  return 'RevenueCat could not verify subscription access. Check the configuration, network, and store setup, then try again.';
}

export function SubscriptionGate({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const { state, isHydrated } = usePrototype();
  const {
    status,
    offering,
    error,
    refresh,
    restore,
  } = useSubscription();
  const [restoring, setRestoring] = useState(false);

  if (!isHydrated) {
    return children;
  }

  if (!state.onboardingComplete) {
    return pathname === '/' ? children : <Redirect href="/" />;
  }

  if (status === 'active') {
    return children;
  }

  if (status === 'loading') {
    return <AccessShell mode="loading" />;
  }

  if (status === 'unconfigured') {
    return (
      <AccessShell
        mode="error"
        title="Subscriptions need setup"
        body={
          __DEV__
            ? 'Add the RevenueCat public SDK key for this platform to your .env file, then restart Expo.'
            : 'Subscriptions are not available in this build yet.'
        }
      />
    );
  }

  if (status === 'error' || !offering) {
    async function handleRestore() {
      setRestoring(true);
      const restored = await restore();
      setRestoring(false);

      if (!restored) {
        Alert.alert(
          'No active subscription found',
          'Check that you are signed in with the store account used for your purchase.',
        );
      }
    }

    return (
      <AccessShell
        mode="error"
        title="We couldn’t open subscriptions"
        body={getSubscriptionErrorCopy(error)}
        primaryLabel="Try again"
        onPrimary={refresh}
        secondaryLabel={restoring ? 'Restoring…' : 'Restore purchases'}
        onSecondary={restoring ? undefined : handleRestore}
      />
    );
  }

  return <CustomPaywall offering={offering} />;
}

type AccessShellProps = {
  mode: 'loading' | 'error';
  title?: string;
  body?: string;
  primaryLabel?: string;
  onPrimary?: () => void | Promise<void>;
  secondaryLabel?: string;
  onSecondary?: () => void | Promise<void>;
};

function AccessShell({
  mode,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: AccessShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.brandMark}>
          <View style={styles.waveShort} />
          <View style={styles.waveTall} />
          <View style={styles.waveMedium} />
          <View style={styles.waveTall} />
          <View style={styles.waveShort} />
        </View>

        {mode === 'loading' ? (
          <>
            <ActivityIndicator color={theme.primary} size="small" />
            <Text style={styles.loadingText}>Checking your access…</Text>
          </>
        ) : (
          <View style={styles.message}>
            <MaterialIcons name="lock-outline" size={24} color={theme.text} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>
            {primaryLabel && onPrimary ? (
              <Pressable
                accessibilityRole="button"
                onPress={onPrimary}
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.primaryButtonPressed,
                ]}
              >
                <Text style={styles.primaryLabel}>{primaryLabel}</Text>
              </Pressable>
            ) : null}
            {secondaryLabel && onSecondary ? (
              <Pressable
                accessibilityRole="button"
                onPress={onSecondary}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  shell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  brandMark: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 34,
  },
  waveShort: {
    width: 3,
    height: 12,
    borderRadius: 2,
    backgroundColor: theme.text,
  },
  waveMedium: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: theme.text,
  },
  waveTall: {
    width: 3,
    height: 38,
    borderRadius: 2,
    backgroundColor: theme.text,
  },
  loadingText: {
    marginTop: 14,
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  message: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'flex-start',
  },
  title: {
    marginTop: 18,
    color: theme.text,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  body: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    minHeight: 54,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: theme.primary,
  },
  primaryButtonPressed: {
    backgroundColor: theme.primaryPressed,
    transform: [{ scale: 0.99 }],
  },
  primaryLabel: {
    color: theme.background,
    fontSize: 16,
    fontWeight: '900',
  },
  secondaryButton: {
    minHeight: 48,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  secondaryButtonPressed: {
    opacity: 0.55,
  },
  secondaryLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
});

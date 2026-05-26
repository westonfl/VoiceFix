import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { mainAppText } from '@/features/prototype/localization';
import { PrototypeProvider, usePrototype } from '@/features/prototype/state';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  return (
    <PrototypeProvider>
      <PrototypeTabs />
    </PrototypeProvider>
  );
}

function PrototypeTabs() {
  const colorScheme = useColorScheme();
  const { state } = usePrototype();
  const text = mainAppText[state.language];

  if (Platform.OS === 'ios' && state.onboardingComplete) {
    return (
      <NativeTabs
        backgroundColor="rgba(8, 13, 22, 0.54)"
        blurEffect="systemChromeMaterialDark"
        disableTransparentOnScrollEdge
        iconColor={{ default: '#8190A3', selected: Colors[colorScheme ?? 'light'].tint }}
        labelStyle={{
          default: { color: '#8190A3', fontSize: 11, fontWeight: '600' },
          selected: { color: Colors[colorScheme ?? 'light'].tint, fontSize: 11, fontWeight: '700' },
        }}
        minimizeBehavior="automatic"
        shadowColor="rgba(0, 0, 0, 0.32)">
        <NativeTabs.Trigger name="index">
          <Label>{text.tabs.today}</Label>
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="journey">
          <Label>{text.tabs.journey}</Label>
          <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="journal">
          <Label>{text.tabs.journal}</Label>
          <Icon sf={{ default: 'book', selected: 'book.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <Label>{text.tabs.settings}</Label>
          <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  const tabBarStyle = state.onboardingComplete ? styles.defaultTabBar : styles.hiddenTabBar;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: text.tabs.today,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          title: text.tabs.journey,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: text.tabs.journal,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: text.tabs.settings,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  defaultTabBar: {
    backgroundColor: '#101722',
    borderTopColor: '#203044',
    height: 84,
    paddingTop: 8,
  },
  hiddenTabBar: {
    display: 'none',
  },
});

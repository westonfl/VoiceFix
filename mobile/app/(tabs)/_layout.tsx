import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, VoiceFixTheme as theme } from '@/constants/theme';
import { mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  return <PrototypeTabs />;
}

function PrototypeTabs() {
  const colorScheme = useColorScheme();
  const { state } = usePrototype();
  const text = mainAppText[state.language];

  if (Platform.OS === 'ios' && state.onboardingComplete) {
    return (
      <NativeTabs
        backgroundColor="rgba(255, 248, 245, 0.96)"
        blurEffect="systemChromeMaterialLight"
        disableTransparentOnScrollEdge
        iconColor={{ default: theme.text, selected: Colors[colorScheme ?? 'light'].tint }}
        labelStyle={{
          default: { color: theme.text, fontSize: 11, fontWeight: '800' },
          selected: { color: Colors[colorScheme ?? 'light'].tint, fontSize: 11, fontWeight: '900' },
        }}
        minimizeBehavior="automatic"
        shadowColor="rgba(0, 0, 0, 0.08)">
        <NativeTabs.Trigger name="index">
          <Label>{text.tabs.today}</Label>
          <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="journey">
          <Label>{text.tabs.journey}</Label>
          <Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="coach">
          <Label>{text.tabs.coach}</Label>
          <Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} />
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="journal">
          <Label>{text.tabs.journal}</Label>
          <Icon sf={{ default: 'trophy', selected: 'trophy.fill' }} />
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
          fontWeight: '900',
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
        name="coach"
        options={{
          title: text.tabs.coach,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: text.tabs.journal,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="trophy.fill" color={color} />,
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
    backgroundColor: theme.background,
    borderTopColor: theme.border,
    height: 84,
    paddingTop: 8,
  },
  hiddenTabBar: {
    display: 'none',
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';

import type { IconName, OnboardingOption } from './types';

const waveform = [24, 52, 36, 78, 44, 92, 58, 34, 72, 102, 48, 30, 66, 42, 84, 38];

export function StudioMark({ large = false }: { large?: boolean }) {
  return (
    <View style={[styles.mark, large && styles.markLarge]}>
      <View style={styles.markGlow} />
      <MaterialIcons name="graphic-eq" size={large ? 40 : 26} color={theme.primaryBright} />
    </View>
  );
}

export function SignalWave({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.wave}>
      {waveform.map((height, index) => (
        <View
          key={`${height}-${index}`}
          style={[
            styles.waveBar,
            {
              height: active ? height : Math.max(16, height * 0.62),
              backgroundColor: index === 9 || index === 14 ? theme.energy : theme.primaryBright,
              opacity: active ? (index % 3 === 0 ? 0.96 : 0.66) : 0.36,
            },
          ]}
        />
      ))}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.headerCopy}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  icon = 'arrow-forward',
  disabled = false,
  onPress,
}: {
  label: string;
  icon?: IconName;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
        disabled && styles.disabled,
      ]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
      <MaterialIcons name={icon} size={20} color={theme.backgroundDeep} />
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: OnboardingOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}>
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <MaterialIcons name={option.icon} size={22} color={selected ? theme.backgroundDeep : theme.primaryBright} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionDetail}>{option.detail}</Text>
      </View>
      <MaterialIcons
        name={selected ? 'check-circle' : 'radio-button-unchecked'}
        size={22}
        color={selected ? theme.success : theme.textSubtle}
      />
    </Pressable>
  );
}

export function InfoList({
  items,
}: {
  items: Array<string | { label: string; detail: string; icon: IconName }>;
}) {
  return (
    <View style={styles.infoList}>
      {items.map((item, index) => {
        const value = typeof item === 'string' ? { label: item, detail: '', icon: 'check' as IconName } : item;
        return (
          <View key={`${value.label}-${index}`} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons name={value.icon} size={18} color={theme.primaryBright} />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{value.label}</Text>
              {value.detail ? <Text style={styles.infoDetail}>{value.detail}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function Pill({ label, tone = 'signal' }: { label: string; tone?: 'signal' | 'violet' | 'green' | 'amber' }) {
  const color =
    tone === 'violet' ? theme.journal : tone === 'green' ? theme.success : tone === 'amber' ? theme.warning : theme.primaryBright;

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(50, 230, 226, 0.26)',
    borderRadius: 20,
    borderWidth: 1,
    height: 52,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 52,
  },
  markLarge: {
    borderRadius: 32,
    height: 84,
    width: 84,
  },
  markGlow: {
    backgroundColor: 'rgba(50, 230, 226, 0.16)',
    borderRadius: 80,
    height: 92,
    position: 'absolute',
    width: 92,
  },
  wave: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 112,
    justifyContent: 'center',
  },
  waveBar: {
    borderRadius: 999,
    width: 6,
  },
  headerCopy: {
    gap: 10,
  },
  eyebrow: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: theme.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 36,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    backgroundColor: theme.primaryPressed,
  },
  primaryButtonText: {
    color: theme.backgroundDeep,
    fontSize: 16,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.45,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: 'rgba(50, 230, 226, 0.32)',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: theme.primaryBright,
    fontSize: 15,
    fontWeight: '700',
  },
  option: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 90,
    padding: 14,
  },
  optionSelected: {
    backgroundColor: theme.primarySoft,
    borderColor: 'rgba(50, 230, 226, 0.58)',
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionIcon: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 18,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  optionIconSelected: {
    backgroundColor: theme.primaryBright,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  optionDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  infoIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 16,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  infoText: {
    flex: 1,
    gap: 3,
  },
  infoLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  infoDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

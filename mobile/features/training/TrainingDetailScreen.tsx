import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { headerIconButtonStyles } from '@/constants/headerButtons';
import { VoiceFixTheme as theme } from '@/constants/theme';
import {
  CardGradientBackground,
  type CardGradientVariant,
} from '@/features/onboarding/components';
import {
  DEFAULT_EXERCISE_DURATION_SEC,
} from '@/features/training/recording';
import {
  exerciseCategoryLabel,
  exerciseSoundCue,
} from '@/features/training/liveAnalysis';
import type { MainAppLanguage } from '@/features/prototype/localization';

type TrainingDetailScreenProps = {
  title: string;
  category: string;
  goal: string;
  instruction: string;
  exerciseId: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  gradient: CardGradientVariant;
  language: MainAppLanguage;
  durationSec?: number;
  onClose: () => void;
  onStart: () => void;
};

export function TrainingDetailScreen({
  title,
  category,
  goal,
  instruction,
  exerciseId,
  icon,
  gradient,
  language,
  durationSec = DEFAULT_EXERCISE_DURATION_SEC,
  onClose,
  onStart,
}: TrainingDetailScreenProps) {
  const soundCue = exerciseSoundCue(exerciseId);
  const categoryLabel = exerciseCategoryLabel(category, language);

  return (
    <View style={styles.stack}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={onClose}
          style={({ pressed }) => [
            headerIconButtonStyles.button,
            headerIconButtonStyles.buttonAlignStart,
            pressed && headerIconButtonStyles.buttonPressed,
          ]}
        >
          <MaterialIcons name="close" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <View style={styles.categoryRow}>
            <MaterialIcons name={icon} size={16} color={theme.textSubtle} />
            <Text style={styles.category}>{categoryLabel}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.durationBadge}>
            <MaterialIcons name="timer" size={14} color={theme.textMuted} />
            <Text style={styles.durationText}>{durationSec}s</Text>
          </View>
        </View>
      </View>

      <View style={styles.previewCard}>
        <View style={styles.previewLine} />
        <Text style={styles.previewCue}>{soundCue}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>{language === 'ko' ? '목표' : 'Goal'}</Text>
          <Text style={styles.infoBody}>{goal}</Text>
        </View>
        <View style={styles.infoBlock}>
          <Text style={styles.infoLabel}>
            {language === 'ko' ? '안내' : 'Instructions'}
          </Text>
          <Text style={styles.infoBody}>{instruction}</Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onStart}
        style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}
      >
        <CardGradientBackground variant={gradient} />
        <Text style={styles.startLabel}>{language === 'ko' ? '시작' : 'Start'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 18,
    paddingTop: 8,
  },
  header: {
    gap: 18,
  },
  headerCopy: {
    alignItems: 'center',
    gap: 8,
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  category: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.text,
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  durationBadge: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  durationText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  previewCard: {
    alignItems: 'center',
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    justifyContent: 'center',
    minHeight: 180,
    padding: 24,
  },
  previewLine: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 8,
    width: '72%',
  },
  previewCue: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
  },
  infoCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 24,
    gap: 18,
    padding: 20,
  },
  infoBlock: {
    gap: 6,
  },
  infoLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  infoBody: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  startButton: {
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 999,
    borderWidth: 1.5,
    height: 58,
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  startButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  startLabel: {
    color: theme.textMuted,
    fontSize: 18,
    fontWeight: '800',
    zIndex: 1,
  },
});

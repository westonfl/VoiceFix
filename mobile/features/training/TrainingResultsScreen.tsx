import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';
import type { LiveSessionResult } from '@/features/training/liveAnalysis';
import type { MainAppLanguage } from '@/features/prototype/localization';

type TrainingResultsScreenProps = {
  result: LiveSessionResult;
  language: MainAppLanguage;
  onRedo: () => void;
  onDone: () => void;
};

function ResultStar({ filled, large = false }: { filled: boolean; large?: boolean }) {
  return (
    <View style={[styles.starShell, large && styles.starShellLarge]}>
      {filled ? (
        <LinearGradient
          colors={['#D9FFE1', '#DDF2FF', '#EEE2FF', '#FFFFD6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.starFill}
        />
      ) : (
        <View style={styles.starGhost} />
      )}
      <MaterialIcons
        name="star"
        size={large ? 54 : 42}
        color={filled ? theme.text : theme.border}
        style={styles.starIcon}
      />
    </View>
  );
}

export function TrainingResultsScreen({
  result,
  language,
  onRedo,
  onDone,
}: TrainingResultsScreenProps) {
  const filledStars = Math.max(0, Math.min(3, result.stars));

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <View style={styles.starRow}>
          {[0, 1, 2].map((index) => (
            <ResultStar key={index} filled={index < filledStars} large={index < 2} />
          ))}
        </View>
        <Text style={styles.score}>{result.score}</Text>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>{result.primaryMetric.label}</Text>
        <Text style={styles.metricValue}>{result.primaryMetric.value}%</Text>
        <View style={styles.metricTrack}>
          <View
            style={[
              styles.metricFill,
              { width: `${Math.max(8, result.primaryMetric.value)}%` },
            ]}
          />
          <View
            style={[
              styles.metricThumb,
              { left: `${Math.max(4, Math.min(96, result.primaryMetric.value))}%` },
            ]}
          />
        </View>
        <Text style={styles.metricVerdict}>{result.primaryMetric.verdict}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={language === 'ko' ? '다시 하기' : 'Redo'}
          onPress={onRedo}
          style={({ pressed }) => [styles.redoButton, pressed && styles.redoButtonPressed]}
        >
          <MaterialIcons name="refresh" size={24} color={theme.background} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
        >
          <Text style={styles.doneLabel}>{language === 'ko' ? '완료' : 'Done'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 28,
    justifyContent: 'center',
    minHeight: 560,
    paddingTop: 12,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  starRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 88,
  },
  starShell: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starShellLarge: {
    transform: [{ translateY: -4 }],
  },
  starFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    transform: [{ scale: 0.72 }],
  },
  starGhost: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.surface,
    borderRadius: 999,
    transform: [{ scale: 0.72 }],
  },
  starIcon: {
    zIndex: 1,
  },
  score: {
    color: theme.text,
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -1,
  },
  metricCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 24,
    gap: 10,
    padding: 22,
  },
  metricLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  metricValue: {
    color: theme.text,
    fontSize: 42,
    fontWeight: '900',
  },
  metricTrack: {
    backgroundColor: theme.border,
    borderRadius: 999,
    height: 8,
    marginTop: 4,
    overflow: 'visible',
    position: 'relative',
  },
  metricFill: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 8,
  },
  metricThumb: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 18,
    marginLeft: -9,
    position: 'absolute',
    top: -5,
    width: 18,
  },
  metricVerdict: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  redoButton: {
    alignItems: 'center',
    backgroundColor: theme.text,
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  redoButtonPressed: {
    opacity: 0.9,
  },
  doneButton: {
    alignItems: 'center',
    backgroundColor: theme.text,
    borderRadius: 18,
    flex: 1,
    height: 58,
    justifyContent: 'center',
  },
  doneButtonPressed: {
    opacity: 0.9,
  },
  doneLabel: {
    color: theme.background,
    fontSize: 18,
    fontWeight: '800',
  },
});

import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';
import type { mainAppText } from '@/features/prototype/localization';
import type { MainAppLanguage } from '@/features/prototype/localization';
import type { MonthOneAnalysisResponse } from '@/features/prototype/serverAnalysis';

type TrainingResultsScreenProps = {
  analysis: MonthOneAnalysisResponse | null;
  fallback: boolean;
  language: MainAppLanguage;
  text: (typeof mainAppText)['en'];
  onRedo: () => void;
  onDone: () => void;
};

function FeedbackSection({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={styles.feedbackSection}>
      <Text style={styles.feedbackLabel}>{label}</Text>
      <Text style={styles.feedbackDetail}>{detail}</Text>
    </View>
  );
}

export function TrainingResultsScreen({
  analysis,
  fallback,
  language,
  text,
  onRedo,
  onDone,
}: TrainingResultsScreenProps) {
  const safetyText =
    analysis && analysis.safetyFlags.length > 0
      ? analysis.safetyFlags.join(', ').replaceAll('_', ' ')
      : null;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {fallback || !analysis ? (
          <View style={styles.fallbackPanel}>
            <Text style={styles.fallbackTitle}>
              {language === 'ko' ? '분석을 사용할 수 없습니다' : 'Analysis unavailable'}
            </Text>
            <Text style={styles.fallbackBody}>
              {language === 'ko'
                ? '지금은 녹음을 분석할 수 없습니다. 다시 시도하거나 완료를 눌러 계속하세요.'
                : 'We could not analyze this take right now. Retry or tap Done to continue.'}
            </Text>
          </View>
        ) : (
          <>
            {analysis.comparison ? (
              <FeedbackSection
                label={text.today.secondTakeComparison}
                detail={analysis.comparison.summary}
              />
            ) : null}
            <FeedbackSection
              label={text.today.whatWeHeard}
              detail={analysis.feedback.whatWeHeard}
            />
            <FeedbackSection
              label={text.today.whatItMeans}
              detail={analysis.feedback.whatItOftenMeans}
            />
            <FeedbackSection
              label={text.today.oneFix}
              detail={analysis.feedback.oneThingToTry}
            />
            <FeedbackSection
              label={text.today.retryRule}
              detail={analysis.feedback.retryGoal}
            />
            {safetyText ? (
              <Text style={styles.safety}>{safetyText}</Text>
            ) : null}
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onRedo}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionLabel}>{language === 'ko' ? '다시 하기' : 'Retry'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onDone}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionLabel}>{language === 'ko' ? '완료' : 'Done'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: 20,
    minHeight: 560,
    paddingTop: 12,
  },
  content: {
    gap: 22,
    paddingBottom: 12,
  },
  feedbackSection: {
    gap: 8,
  },
  feedbackLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  feedbackDetail: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  fallbackPanel: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    gap: 10,
    padding: 22,
  },
  fallbackTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '900',
  },
  fallbackBody: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  safety: {
    color: theme.warning,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: theme.text,
    borderRadius: 18,
    flex: 1,
    height: 58,
    justifyContent: 'center',
  },
  actionButtonPressed: {
    opacity: 0.9,
  },
  actionLabel: {
    color: theme.background,
    fontSize: 18,
    fontWeight: '800',
  },
});

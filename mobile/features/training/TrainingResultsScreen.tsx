import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { RehearTheme as theme } from '@/constants/theme';
import { analysisMetricItems, metricGuideTitle } from '@/features/prototype/analysisMetrics';
import type { mainAppText, MainAppLanguage } from '@/features/prototype/localization';
import type { MonthOneAnalysisResponse } from '@/features/prototype/serverAnalysis';

import { AnalysisMetricCard } from './AnalysisMetricCard';
import { qualityDisplay } from './analysisDisplay';

type TrainingResultsScreenProps = {
  analysis: MonthOneAnalysisResponse | null;
  fallback: boolean;
  text: (typeof mainAppText)['en'];
  language: MainAppLanguage;
  exerciseTitle?: string;
  canFinish: boolean;
  onRedo: () => void;
  onDone: () => void;
};

function FeedbackSection({
  label,
  detail,
  highlighted = false,
  delay = 0,
}: {
  label: string;
  detail: string;
  highlighted?: boolean;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420).easing(Easing.out(Easing.cubic))}
      style={[styles.feedbackSection, highlighted && styles.feedbackSectionHighlighted]}
    >
      <View style={styles.feedbackLabelRow}>
        <Text style={[styles.feedbackLabel, highlighted && styles.feedbackLabelHighlighted]}>
          {label}
        </Text>
        {highlighted ? (
          <MaterialIcons name="auto-awesome" size={16} color={theme.text} />
        ) : null}
      </View>
      <Text style={[styles.feedbackDetail, highlighted && styles.feedbackDetailHighlighted]}>
        {detail}
      </Text>
    </Animated.View>
  );
}

function MetricGuide({
  items,
  language,
  delay,
}: {
  items: ReturnType<typeof analysisMetricItems>;
  language: MainAppLanguage;
  delay: number;
}) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420).easing(Easing.out(Easing.cubic))}
      style={styles.metricGuide}
    >
      <Text style={styles.metricGuideTitle}>{metricGuideTitle(language)}</Text>
      <View style={styles.metricList}>
        {items.map((item) => (
          <AnalysisMetricCard key={item.label} item={item} />
        ))}
      </View>
    </Animated.View>
  );
}

function ResultsHero({
  exerciseTitle,
  analysis,
  language,
  delay,
}: {
  exerciseTitle?: string;
  analysis: MonthOneAnalysisResponse;
  language: MainAppLanguage;
  delay: number;
}) {
  const display = qualityDisplay(analysis.quality, language);
  const heroToneStyle =
    display.tone === 'success'
      ? styles.heroIconSuccess
      : display.tone === 'warning'
        ? styles.heroIconWarning
        : styles.heroIconNeutral;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(420).easing(Easing.out(Easing.cubic))}
      style={styles.hero}
    >
      <View style={[styles.heroIcon, heroToneStyle]}>
        <MaterialIcons name={display.icon} size={24} color={theme.text} />
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle}>{exerciseTitle ?? 'Your take'}</Text>
        <Text style={styles.heroSubtitle}>{display.headline}</Text>
      </View>
    </Animated.View>
  );
}

export function TrainingResultsScreen({
  analysis,
  fallback,
  text,
  language,
  exerciseTitle,
  canFinish,
  onRedo,
  onDone,
}: TrainingResultsScreenProps) {
  const actionsReveal = useSharedValue(0);

  useEffect(() => {
    actionsReveal.value = withTiming(1, {
      duration: 520,
      easing: Easing.out(Easing.cubic),
    });
  }, [actionsReveal]);

  const actionsStyle = useAnimatedStyle(() => ({
    opacity: actionsReveal.value,
    transform: [{ translateY: (1 - actionsReveal.value) * 18 }],
  }));

  const safetyText =
    analysis && analysis.safetyFlags.length > 0
      ? analysis.safetyFlags.join(', ').replaceAll('_', ' ')
      : null;
  const metricItems = analysis ? analysisMetricItems(analysis, language) : [];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {fallback || !analysis ? (
          <Animated.View
            entering={FadeInDown.duration(420).easing(Easing.out(Easing.cubic))}
            style={styles.fallbackPanel}
          >
            <View style={[styles.heroIcon, styles.heroIconWarning]}>
              <MaterialIcons name="cloud-off" size={24} color={theme.text} />
            </View>
            <Text style={styles.fallbackTitle}>{text.today.analysisUnavailable}</Text>
            <Text style={styles.fallbackBody}>{text.today.analysisUnavailableBody}</Text>
          </Animated.View>
        ) : (
          <>
            <ResultsHero
              analysis={analysis}
              delay={0}
              exerciseTitle={exerciseTitle}
              language={language}
            />

            {analysis.comparison ? (
              <Animated.View
                entering={FadeInDown.delay(80).duration(420).easing(Easing.out(Easing.cubic))}
                style={[
                  styles.comparisonBanner,
                  analysis.comparison.improved
                    ? styles.comparisonBannerImproved
                    : styles.comparisonBannerNeutral,
                ]}
              >
                <MaterialIcons
                  name={analysis.comparison.improved ? 'trending-up' : 'compare-arrows'}
                  size={18}
                  color={theme.text}
                />
                <Text style={styles.comparisonText}>{analysis.comparison.summary}</Text>
              </Animated.View>
            ) : null}

            <MetricGuide delay={120} items={metricItems} language={language} />

            <FeedbackSection
              delay={180}
              detail={analysis.feedback.whatWeHeard}
              label={text.today.whatWeHeard}
            />
            <FeedbackSection
              delay={240}
              detail={analysis.feedback.whatItOftenMeans}
              label={text.today.whatItMeans}
            />
            <FeedbackSection
              delay={300}
              detail={analysis.feedback.oneThingToTry}
              highlighted
              label={text.today.oneFix}
            />
            <FeedbackSection
              delay={360}
              detail={analysis.feedback.retryGoal}
              label={text.today.retryRule}
            />
            {safetyText ? (
              <Animated.View
                entering={FadeInDown.delay(420).duration(420).easing(Easing.out(Easing.cubic))}
                style={styles.safetyPanel}
              >
                <MaterialIcons name="health-and-safety" size={16} color={theme.textMuted} />
                <Text style={styles.safety}>{safetyText}</Text>
              </Animated.View>
            ) : null}
          </>
        )}
      </ScrollView>

      <Animated.View style={[styles.actions, actionsStyle]}>
        <Pressable
          accessibilityRole="button"
          onPress={onRedo}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.actionLabel}>{text.journal.retry}</Text>
        </Pressable>
        {canFinish ? (
          <Pressable
            accessibilityRole="button"
            onPress={onDone}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.actionLabel}>{text.today.done}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
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
    gap: 18,
    paddingBottom: 12,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 28,
    flexDirection: 'row',
    gap: 14,
    padding: 18,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  heroIconSuccess: {
    backgroundColor: theme.pastelMint,
  },
  heroIconWarning: {
    backgroundColor: theme.pastelLemon,
  },
  heroIconNeutral: {
    backgroundColor: theme.pastelSky,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  comparisonBanner: {
    alignItems: 'center',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  comparisonBannerImproved: {
    backgroundColor: theme.pastelMint,
  },
  comparisonBannerNeutral: {
    backgroundColor: theme.pastelSky,
  },
  comparisonText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  metricGuide: {
    gap: 12,
  },
  metricGuideTitle: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  metricList: {
    gap: 10,
  },
  feedbackSection: {
    gap: 8,
  },
  feedbackSectionHighlighted: {
    backgroundColor: theme.text,
    borderRadius: 24,
    gap: 10,
    padding: 18,
  },
  feedbackLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  feedbackLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  feedbackLabelHighlighted: {
    color: theme.background,
    opacity: 0.72,
  },
  feedbackDetail: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 26,
  },
  feedbackDetailHighlighted: {
    color: theme.background,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 27,
  },
  fallbackPanel: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    gap: 12,
    padding: 22,
  },
  fallbackTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  fallbackBody: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  safetyPanel: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  safety: {
    color: theme.textMuted,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
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

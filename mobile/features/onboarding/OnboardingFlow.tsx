import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';

import { PrimaryButton, SecondaryButton } from './components';
import { initialAnswers, onboardingScreens } from './data';
import { languageOptions, localizePlan, localizeScreen, uiText } from './localization';
import { buildStarterPlan } from './plan';
import { RenderOnboardingScreen } from './screens';
import type { Language, OnboardingAnswers } from './types';

export function OnboardingFlow({ onComplete }: { onComplete?: (answers: OnboardingAnswers, language: Language) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [completedRecordings, setCompletedRecordings] = useState<Record<string, boolean>>({});

  const baseScreen = onboardingScreens[stepIndex];
  const screen = useMemo(() => localizeScreen(baseScreen, language), [baseScreen, language]);
  const plan = useMemo(() => localizePlan(buildStarterPlan(answers), language), [answers, language]);
  const text = uiText[language];
  const progress = (stepIndex + 1) / onboardingScreens.length;
  const recordingComplete = Boolean(completedRecordings[screen.id]);
  const showProgressHeader = stepIndex > 0;
  const hasSecondaryAction =
    Boolean(screen.secondaryAction) &&
    (screen.kind === 'permission' || screen.kind === 'conversion' || screen.kind === 'ready');
  const primaryDisabled = isPrimaryDisabled();

  function goNext() {
    if (stepIndex < onboardingScreens.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    onComplete?.(answers, language);
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex((current) => current - 1);
    }
  }

  function selectAnswer(key: keyof OnboardingAnswers, value: string) {
    setAnswers((current) => ({ ...current, [key]: value }));
  }

  function toggleAnswer(key: keyof OnboardingAnswers, value: string) {
    setAnswers((current) => {
      const currentValue = current[key];

      if (!Array.isArray(currentValue)) {
        return current;
      }

      const nextValue = currentValue.includes(value)
        ? currentValue.filter((item) => item !== value)
        : [...currentValue, value];

      return { ...current, [key]: nextValue };
    });
  }

  function completeRecording() {
    setCompletedRecordings((current) => ({ ...current, [screen.id]: true }));
  }

  function handlePrimaryAction() {
    if (screen.kind === 'permission') {
      selectAnswer('micPermissionStatus', 'granted');
      goNext();
      return;
    }

    if (screen.kind === 'recording' && !recordingComplete) {
      completeRecording();
      return;
    }

    goNext();
  }

  function handleSecondaryAction() {
    if (screen.kind === 'permission') {
      selectAnswer('micPermissionStatus', 'skipped');
    }

    goNext();
  }

  function getPrimaryActionLabel() {
    if (screen.kind === 'recording' && recordingComplete) {
      return uiText[language].continue;
    }

    return screen.primaryAction;
  }

  function isPrimaryDisabled() {
    if ((screen.kind !== 'single' && screen.kind !== 'multi') || !screen.dataKey) {
      return false;
    }

    const value = answers[screen.dataKey];
    return Array.isArray(value) ? value.length === 0 : !value;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        {showProgressHeader ? (
          <View style={styles.topBar}>
            <Pressable accessibilityRole="button" onPress={goBack} style={styles.iconButton}>
              <MaterialIcons name="chevron-left" size={24} color={theme.text} />
            </Pressable>

            <View style={styles.progressBlock}>
              <View style={styles.progressMeta}>
                <Text style={styles.stepId}>{screen.id}</Text>
                <Text style={styles.stepTitle}>
                  {stepIndex + 1} {text.of} {onboardingScreens.length} - {screen.shortTitle}
                </Text>
              </View>
              <View style={styles.progressRail}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>

            <LanguageSelector
              language={language}
              onChange={(nextLanguage) => {
                setLanguage(nextLanguage);
                setLanguageOpen(false);
              }}
              onToggle={() => setLanguageOpen((current) => !current)}
              open={languageOpen}
            />
          </View>
        ) : (
          <View style={styles.firstTopBar}>
            <LanguageSelector
              language={language}
              onChange={(nextLanguage) => {
                setLanguage(nextLanguage);
                setLanguageOpen(false);
              }}
              onToggle={() => setLanguageOpen((current) => !current)}
              open={languageOpen}
            />
          </View>
        )}

        <ScrollView
          bounces={false}
          contentContainerStyle={[styles.content, !showProgressHeader && styles.firstContent]}
          showsVerticalScrollIndicator={false}>
          <RenderOnboardingScreen
            answers={answers}
            onAdvance={goNext}
            onCompleteRecording={completeRecording}
            onSecondary={goNext}
            onSelect={selectAnswer}
            onToggle={toggleAnswer}
            plan={plan}
            language={language}
            recordingComplete={recordingComplete}
            screen={screen}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={getPrimaryActionLabel()}
            disabled={primaryDisabled}
            icon={screen.kind === 'recording' && !recordingComplete ? 'fiber-manual-record' : 'arrow-forward'}
            onPress={handlePrimaryAction}
          />
          {hasSecondaryAction && screen.secondaryAction ? (
            <SecondaryButton label={screen.secondaryAction} onPress={handleSecondaryAction} />
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

function LanguageSelector({
  language,
  onChange,
  onToggle,
  open,
}: {
  language: Language;
  onChange: (language: Language) => void;
  onToggle: () => void;
  open: boolean;
}) {
  const selected = languageOptions.find((option) => option.id === language) ?? languageOptions[0];

  return (
    <View style={styles.languageWrap}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={styles.languageTrigger}>
        <Text style={styles.languageTriggerText}>
          {selected.flag} {selected.abbr}
        </Text>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={18} color={theme.textMuted} />
      </Pressable>
      {open ? (
        <View style={styles.languageMenu}>
          <ScrollView style={styles.languageMenuScroll} showsVerticalScrollIndicator={false}>
            {languageOptions.map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected: language === option.id }}
                onPress={() => onChange(option.id)}
                style={[styles.languageMenuItem, language === option.id && styles.languageMenuItemActive]}>
                <Text style={styles.languageFlag}>{option.flag}</Text>
                <View style={styles.languageMenuCopy}>
                  <Text style={styles.languageAbbr}>{option.abbr}</Text>
                  <Text style={styles.languageName}>{option.name}</Text>
                </View>
                {language === option.id ? (
                  <MaterialIcons name="check" size={18} color={theme.primaryBright} />
                ) : null}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  shell: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  firstTopBar: {
    alignItems: 'flex-end',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  progressBlock: {
    flex: 1,
    gap: 8,
  },
  progressMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  stepId: {
    color: theme.primaryBright,
    fontSize: 12,
    fontWeight: '800',
  },
  stepTitle: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  progressRail: {
    backgroundColor: theme.surface,
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: theme.primaryBright,
    borderRadius: 999,
    height: '100%',
  },
  languageWrap: {
    position: 'relative',
    zIndex: 10,
  },
  languageTrigger: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 38,
    minWidth: 82,
    paddingHorizontal: 10,
  },
  languageTriggerText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '800',
  },
  languageMenu: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 28,
    borderWidth: 1,
    minWidth: 150,
    padding: 6,
    position: 'absolute',
    right: 0,
    top: 44,
  },
  languageMenuScroll: {
    maxHeight: 330,
  },
  languageMenuItem: {
    alignItems: 'center',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  languageMenuItemActive: {
    backgroundColor: theme.primarySoft,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageMenuCopy: {
    flex: 1,
  },
  languageAbbr: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '800',
  },
  languageName: {
    color: theme.textMuted,
    fontSize: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 144,
  },
  firstContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 12,
  },
  footer: {
    backgroundColor: theme.backgroundDeep,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    borderTopWidth: 1,
    bottom: 0,
    gap: 10,
    left: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 14,
    position: 'absolute',
    right: 0,
  },
});

import { MaterialIcons } from '@expo/vector-icons';
import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { useEffect, useMemo, useRef, useState, type ComponentProps } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import {
  readMicPermissionStatus,
  readNotificationPermissionStatus,
  requestMicPermission,
  requestNotificationPermission,
} from '@/features/settings/permissions';

import { PrimaryButton, SecondaryButton } from './components';
import { initialAnswers, onboardingScreens } from './data';
import { languageOptions, getUiCopy, localizePlan, localizeScreen } from './localization';
import { buildStarterPlan } from './plan';
import { RenderOnboardingScreen } from './screens';
import type { Language, OnboardingAnswers } from './types';
import {
  onboardingScreenHasReferencePlayback,
  playOnboardingReference,
  stopOnboardingReference,
} from './referenceTone';
import {
  analysisFailureMessage,
  analyzeOnboardingTake,
  type VoiceCheckResult,
} from './voiceCheck';

const VOICE_CHECK_ANALYSIS_INDEX = onboardingScreens.findIndex((screen) => screen.id === 'ONB-23');

export function OnboardingFlow({ onComplete }: { onComplete?: (answers: OnboardingAnswers, language: Language) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [languageOpen, setLanguageOpen] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(initialAnswers);
  const [completedRecordings, setCompletedRecordings] = useState<Record<string, boolean>>({});
  const [recordingResults, setRecordingResults] = useState<Record<string, VoiceCheckResult>>({});
  const [activeRecordingScreenId, setActiveRecordingScreenId] = useState<string | null>(null);
  const [analyzingScreenId, setAnalyzingScreenId] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const recordingStartedAtRef = useRef<number | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const baseScreen = onboardingScreens[stepIndex];
  const screen = useMemo(() => localizeScreen(baseScreen, language), [baseScreen, language]);
  const plan = useMemo(() => localizePlan(buildStarterPlan(answers), language), [answers, language]);
  const text = getUiCopy(language);
  const progress = (stepIndex + 1) / onboardingScreens.length;
  const voiceCheckSkipped = answers.micPermissionStatus === 'skipped';
  const recordingComplete = Boolean(completedRecordings[screen.id]);
  const isRecordingCurrentScreen = activeRecordingScreenId === screen.id;
  const isAnalyzingCurrentScreen = analyzingScreenId === screen.id;
  const currentRecordingResult = recordingResults[screen.id];
  const showProgressHeader = stepIndex > 0;
  const hasReferencePlayback =
    screen.kind === 'recording' && onboardingScreenHasReferencePlayback(screen.id);
  const hasSecondaryAction =
    Boolean(screen.secondaryAction) &&
    (screen.kind === 'permission' ||
      screen.kind === 'conversion' ||
      screen.kind === 'ready' ||
      hasReferencePlayback);
  const primaryDisabled = isPrimaryDisabled();

  useEffect(() => {
    if (baseScreen.kind !== 'permission' || baseScreen.permissionType !== 'notifications') {
      return;
    }

    let cancelled = false;

    readNotificationPermissionStatus().then((status) => {
      if (cancelled || status !== 'granted') {
        return;
      }

      setAnswers((current) => ({ ...current, notificationPermissionStatus: 'granted' }));
      setStepIndex((current) => current + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [baseScreen.id, baseScreen.kind, baseScreen.permissionType]);

  useEffect(() => {
    return () => {
      stopOnboardingReference();
    };
  }, []);

  useEffect(() => {
    setIsPlayingReference(false);
    stopOnboardingReference();
  }, [screen.id]);

  useEffect(() => {
    async function prepareAudioIfGranted() {
      const status = await readMicPermissionStatus();
      if (status !== 'granted') {
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      setAudioReady(true);
      setPermissionDenied(false);
    }

    prepareAudioIfGranted().catch(() => {
      setPermissionDenied(true);
    });
  }, []);

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

  function markRecordingComplete(screenId: string, result: VoiceCheckResult) {
    setRecordingResults((current) => ({ ...current, [screenId]: result }));
    setCompletedRecordings((current) => ({ ...current, [screenId]: true }));
  }

  async function startRecording() {
    if (voiceCheckSkipped || permissionDenied || !audioReady || isAnalyzingCurrentScreen) {
      return;
    }

    try {
      setActiveRecordingScreenId(screen.id);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingStartedAtRef.current = Date.now();
    } catch {
      recordingStartedAtRef.current = null;
      setActiveRecordingScreenId(null);
      Alert.alert(text.recordFailedTitle, text.recordFailedBody);
    }
  }

  async function stopRecording() {
    try {
      const measuredDurationMs = recordingStartedAtRef.current
        ? Date.now() - recordingStartedAtRef.current
        : 0;
      const durationMs = Math.max(recorderState.durationMillis, measuredDurationMs);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setActiveRecordingScreenId(null);
      recordingStartedAtRef.current = null;

      if (!uri) {
        Alert.alert(text.recordFailedTitle, text.recordMissingBody);
        return;
      }

      setAnalyzingScreenId(screen.id);
      const result = await analyzeOnboardingTake(screen.id, uri, language);
      markRecordingComplete(screen.id, result);
    } catch (error) {
      setRecordingResults((current) => ({
        ...current,
        [screen.id]: {
          durationMs: recorderState.durationMillis,
          message: analysisFailureMessage(error, language),
          saved: false,
        },
      }));
      setCompletedRecordings((current) => ({ ...current, [screen.id]: false }));
    } finally {
      setActiveRecordingScreenId(null);
      setAnalyzingScreenId(null);
      recordingStartedAtRef.current = null;
    }
  }

  async function handleMicPermissionRequest() {
    try {
      const response = await requestMicPermission();
      if (response.granted) {
        await setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
        setAudioReady(true);
        setPermissionDenied(false);
        selectAnswer('micPermissionStatus', 'granted');
        goNext();
        return;
      }

      setPermissionDenied(true);
      if (response.status === 'denied') {
        Alert.alert(text.micDeniedTitle, text.micDeniedBody, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }

      Alert.alert(text.micDeniedTitle, text.micDeniedBody);
    } catch {
      setPermissionDenied(true);
      Alert.alert(text.micDeniedTitle, text.recordFailedBody);
    }
  }

  async function handleNotificationPermissionRequest() {
    try {
      const currentStatus = await readNotificationPermissionStatus();
      if (currentStatus === 'granted') {
        selectAnswer('notificationPermissionStatus', 'granted');
        goNext();
        return;
      }

      const response = await requestNotificationPermission();
      if (response.granted) {
        selectAnswer('notificationPermissionStatus', 'granted');
        goNext();
        return;
      }

      selectAnswer('notificationPermissionStatus', 'denied');
      if (response.status === 'denied') {
        Alert.alert(text.notificationDeniedTitle, text.notificationDeniedBody, [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]);
        return;
      }

      Alert.alert(text.notificationDeniedTitle, text.notificationDeniedBody);
    } catch {
      Alert.alert(text.notificationDeniedTitle, text.notificationDeniedBody);
    }
  }

  async function handlePrimaryAction() {
    if (screen.kind === 'permission') {
      if (screen.permissionType === 'notifications') {
        await handleNotificationPermissionRequest();
      } else {
        await handleMicPermissionRequest();
      }
      return;
    }

    if (screen.kind === 'recording') {
      if (voiceCheckSkipped) {
        goNext();
        return;
      }

      if (recordingComplete) {
        goNext();
        return;
      }

      if (isAnalyzingCurrentScreen) {
        return;
      }

      if (isRecordingCurrentScreen) {
        await stopRecording();
        return;
      }

      await startRecording();
      return;
    }

    goNext();
  }

  async function playReferenceTone() {
    if (
      voiceCheckSkipped ||
      permissionDenied ||
      !audioReady ||
      isRecordingCurrentScreen ||
      isAnalyzingCurrentScreen ||
      isPlayingReference
    ) {
      return;
    }

    setIsPlayingReference(true);

    try {
      await playOnboardingReference(screen.id, {
        onFinish: () => {
          setIsPlayingReference(false);
          void setAudioModeAsync({
            allowsRecording: true,
            playsInSilentMode: true,
          });
        },
      });
    } catch {
      setIsPlayingReference(false);
      void setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      Alert.alert(text.recordFailedTitle, text.referenceToneFailedBody);
    }
  }

  function handleSecondaryAction() {
    if (screen.kind === 'permission') {
      if (screen.permissionType === 'notifications') {
        selectAnswer('notificationPermissionStatus', 'skipped');
        goNext();
        return;
      }

      selectAnswer('micPermissionStatus', 'skipped');
      if (VOICE_CHECK_ANALYSIS_INDEX >= 0) {
        setStepIndex(VOICE_CHECK_ANALYSIS_INDEX);
      } else {
        goNext();
      }
      return;
    }

    if (hasReferencePlayback) {
      void playReferenceTone();
      return;
    }

    goNext();
  }

  function getPrimaryActionLabel() {
    if (screen.kind === 'recording') {
      if (voiceCheckSkipped) {
        return text.continue;
      }

      if (isAnalyzingCurrentScreen) {
        return text.analyzing;
      }

      if (recordingComplete) {
        return text.continue;
      }

      if (isRecordingCurrentScreen) {
        return text.stopAndSave;
      }

      return text.record;
    }

    return screen.primaryAction;
  }

  function getPrimaryActionIcon(): ComponentProps<typeof MaterialIcons>['name'] {
    if (screen.kind !== 'recording' || voiceCheckSkipped) {
      return 'arrow-forward';
    }

    if (isAnalyzingCurrentScreen) {
      return 'hourglass-top';
    }

    if (recordingComplete) {
      return 'arrow-forward';
    }

    if (isRecordingCurrentScreen) {
      return 'stop-circle';
    }

    return 'fiber-manual-record';
  }

  function isPrimaryDisabled() {
    if (screen.kind === 'recording') {
      if (voiceCheckSkipped) {
        return false;
      }

      if (isAnalyzingCurrentScreen) {
        return true;
      }

      if (!audioReady || permissionDenied) {
        return true;
      }

      return false;
    }

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
            onCompleteRecording={() => markRecordingComplete(screen.id, {
              durationMs: 0,
              message: '',
              saved: true,
            })}
            isPlayingReference={isPlayingReference}
            onPlayReference={() => {
              void playReferenceTone();
            }}
            onSecondary={handleSecondaryAction}
            onSelect={selectAnswer}
            onToggle={toggleAnswer}
            plan={plan}
            language={language}
            referencePlaybackLabel={hasReferencePlayback ? screen.secondaryAction : undefined}
            recordingComplete={recordingComplete}
            recordingState={{
              durationMs: isRecordingCurrentScreen
                ? recorderState.durationMillis
                : currentRecordingResult?.durationMs,
              isAnalyzing: isAnalyzingCurrentScreen,
              isRecording: isRecordingCurrentScreen,
              permissionDenied,
              result: currentRecordingResult,
              voiceCheckSkipped,
            }}
            screen={screen}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={getPrimaryActionLabel()}
            disabled={primaryDisabled}
            icon={getPrimaryActionIcon()}
            onPress={() => {
              void handlePrimaryAction();
            }}
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

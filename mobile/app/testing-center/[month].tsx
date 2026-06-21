import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { router, useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RehearTheme as theme } from "@/constants/theme";
import {
  CardGradientBackground,
  type CardGradientVariant,
} from "@/features/onboarding/components";
import { formatDuration } from "@/features/prototype/analysis";
import { analysisMetricItems } from "@/features/prototype/analysisMetrics";
import { AnalysisMetricCard } from "@/features/training/AnalysisMetricCard";
import {
  type MainAppLanguage,
} from "@/features/prototype/localization";
import {
  AnalysisServerError,
  analyzeMonthOneTake,
  type MonthOneAnalysisResponse,
  type MonthOneDrillId,
} from "@/features/prototype/serverAnalysis";
import { isMonthlyTestPassed, usePrototype } from "@/features/prototype/state";

type MonthOneTestCheck = {
  id: string;
  title: LocalizedCopy;
  goal: LocalizedCopy;
  drillId: MonthOneDrillId;
  icon: ComponentProps<typeof MaterialIcons>["name"];
};

type LocalizedCopy = {
  en: string;
  ko: string;
};

type CheckResult = {
  analysis?: MonthOneAnalysisResponse;
  passed: boolean;
  message: string;
  durationMs: number;
};

const monthOneChecks: MonthOneTestCheck[] = [
  {
    id: "breath",
    title: { en: "Sustained Hiss", ko: "지속 Hiss" },
    goal: {
      en: "Keep airflow steady without a pushed start or collapsed ending.",
      ko: "밀어내는 시작이나 무너지는 끝 없이 공기를 고르게 유지합니다.",
    },
    drillId: "sustained_hiss",
    icon: "air",
  },
  {
    id: "gentle-sound",
    title: { en: "Gentle Hum", ko: "부드러운 허밍" },
    goal: {
      en: "Make a small sound that starts easily and stays even.",
      ko: "쉽게 시작되고 고르게 유지되는 작은 소리를 냅니다.",
    },
    drillId: "gentle_hum",
    icon: "graphic-eq",
  },
  {
    id: "resonance",
    title: { en: "Fah / Vah Resonance", ko: "Fah / Vah 공명" },
    goal: {
      en: "Find a clear vowel ring without pushing for volume.",
      ko: "볼륨을 밀지 않고 선명한 모음 울림을 찾습니다.",
    },
    drillId: "fah_vah_resonance",
    icon: "spatial-audio-off",
  },
  {
    id: "tone",
    title: { en: "Short Tone Hold", ko: "짧은 음 유지" },
    goal: {
      en: "Hold one short comfortable tone and release cleanly.",
      ko: "편한 짧은 음을 유지하고 깨끗하게 놓습니다.",
    },
    drillId: "short_tone_hold",
    icon: "music-note",
  },
];

export default function TestingCenterScreen() {
  const { month } = useLocalSearchParams<{ month?: string }>();
  const parsedMonth = Number(month);
  const targetMonth = Number.isFinite(parsedMonth) ? parsedMonth : 1;
  const { state, completeMonthlyTest } = usePrototype();
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const recordingStartedAtRef = useRef<number | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [activeCheckId, setActiveCheckId] = useState<string | null>(null);
  const [analyzingCheckId, setAnalyzingCheckId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, CheckResult>>({});
  const isMonthOne = targetMonth === 1;
  const monthTestPassed = isMonthlyTestPassed(state.monthlyTests, targetMonth);
  const allChecksPassed = monthOneChecks.every(
    (check) => results[check.id]?.passed,
  );
  const showPassMonthButton = allChecksPassed && !monthTestPassed;
  const showAlreadyPassed = allChecksPassed && monthTestPassed;
  const title =
    state.language === "ko"
      ? `${targetMonth}개월 테스트 센터`
      : `Month ${targetMonth} Testing Center`;

  useEffect(() => {
    async function prepareAudio() {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setPermissionDenied(true);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    prepareAudio().catch(() => {
      setPermissionDenied(true);
    });
  }, []);

  const completedCount = useMemo(
    () => monthOneChecks.filter((check) => results[check.id]?.passed).length,
    [results],
  );

  async function startCheckRecording(check: MonthOneTestCheck) {
    if (permissionDenied) {
      Alert.alert(
        state.language === "ko"
          ? "마이크를 사용할 수 없습니다"
          : "Microphone unavailable",
        state.language === "ko"
          ? "테스트 센터는 실제 녹음 권한이 필요합니다."
          : "Testing Center needs real recording permission.",
      );
      return;
    }

    if (activeCheckId || analyzingCheckId) {
      return;
    }

    try {
      setActiveCheckId(check.id);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingStartedAtRef.current = Date.now();
    } catch {
      recordingStartedAtRef.current = null;
      setActiveCheckId(null);
      Alert.alert(
        state.language === "ko"
          ? "녹음을 시작하지 못했습니다"
          : "Could not start recording",
        state.language === "ko" ? "다시 시도해보세요." : "Please try again.",
      );
    }
  }

  async function stopCheckRecording(check: MonthOneTestCheck) {
    try {
      const measuredDurationMs = recordingStartedAtRef.current
        ? Date.now() - recordingStartedAtRef.current
        : 0;
      const durationMs = Math.max(
        recorderState.durationMillis,
        measuredDurationMs,
      );
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      setActiveCheckId(null);
      recordingStartedAtRef.current = null;

      if (!uri) {
        setResults((current) => ({
          ...current,
          [check.id]: {
            durationMs,
            message:
              state.language === "ko"
                ? "녹음 파일을 저장하지 못했습니다. 다시 시도하세요."
                : "The recording was not saved. Try again.",
            passed: false,
          },
        }));
        return;
      }

      setAnalyzingCheckId(check.id);
      const analysis = await analyzeMonthOneTake({
        uri,
        drillId: check.drillId,
        language: state.language,
        takeKind: "first",
      });
      const evaluation = evaluateCheck(check.id, analysis, state.language);
      setResults((current) => ({
        ...current,
        [check.id]: {
          analysis,
          durationMs,
          message: evaluation.message,
          passed: evaluation.passed,
        },
      }));
    } catch (error) {
      setResults((current) => ({
        ...current,
        [check.id]: {
          durationMs: recorderState.durationMillis,
          message: analysisFailureMessage(error, state.language),
          passed: false,
        },
      }));
    } finally {
      setActiveCheckId(null);
      setAnalyzingCheckId(null);
      recordingStartedAtRef.current = null;
    }
  }

  function finishTest() {
    if (!allChecksPassed) {
      return;
    }

    completeMonthlyTest(
      targetMonth,
      monthOneChecks.map((check) => check.id),
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton
            label={state.language === "ko" ? "뒤로" : "Back"}
            name="arrow-back"
            onPress={() => router.back()}
          />
          <Text style={styles.kicker}>
            {state.language === "ko" ? "월말 확인" : "Month-end gate"}
          </Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>
            {isMonthOne
              ? state.language === "ko"
                ? "각 항목을 실제로 녹음하고 분석해서 1개월 기초가 안정적인지 확인합니다."
                : "Record and analyze each check to confirm the Month 1 foundation is stable."
              : state.language === "ko"
                ? "이 테스트 센터는 곧 열립니다."
                : "This testing center is coming soon."}
          </Text>
        </View>

        {isMonthOne ? (
          <>
            <View style={styles.progressPanel}>
              <Text style={styles.panelTitle}>
                {state.language === "ko" ? "진행" : "Progress"}
              </Text>
              <Text style={styles.progressText}>
                {completedCount} / {monthOneChecks.length}
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(completedCount / monthOneChecks.length) * 100}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.checkList}>
              {monthOneChecks.map((check) => {
                const result = results[check.id];
                const isRecording = activeCheckId === check.id;
                const isAnalyzing = analyzingCheckId === check.id;
                const isBlocked = Boolean(
                  (activeCheckId && !isRecording) ||
                  (analyzingCheckId && !isAnalyzing),
                );
                return (
                  <TestCheckCard
                    key={check.id}
                    check={check}
                    durationMs={
                      isRecording
                        ? recorderState.durationMillis
                        : result?.durationMs
                    }
                    isAnalyzing={isAnalyzing}
                    isBlocked={isBlocked}
                    isRecording={isRecording}
                    language={state.language}
                    result={result}
                    onPress={() => {
                      if (isRecording) {
                        void stopCheckRecording(check);
                        return;
                      }

                      void startCheckRecording(check);
                    }}
                  />
                );
              })}
            </View>

            {showPassMonthButton || showAlreadyPassed ? (
              <PrimaryAction
                disabled={showAlreadyPassed}
                icon={showAlreadyPassed ? "verified" : "check-circle"}
                label={
                  showAlreadyPassed
                    ? state.language === "ko"
                      ? "이미 통과했습니다"
                      : "Already passed"
                    : state.language === "ko"
                      ? "1개월 테스트 통과"
                      : "Pass Month 1 test"
                }
                onPress={finishTest}
              />
            ) : null}

            {showAlreadyPassed ? (
              <View style={styles.passNote}>
                <MaterialIcons
                  name="verified"
                  size={20}
                  color={theme.success}
                />
                <Text style={styles.passText}>
                  {state.language === "ko"
                    ? "다음 달을 열 수 있는 상태입니다."
                    : "This month is ready to unlock the next month."}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.panel}>
            <Text style={styles.panelTitle}>
              {state.language === "ko" ? "곧 열립니다" : "Coming soon"}
            </Text>
            <Text style={styles.body}>
              {state.language === "ko"
                ? "현재는 1개월 테스트만 사용할 수 있습니다."
                : "Only the Month 1 test is available right now."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function analysisFailureMessage(error: unknown, language: MainAppLanguage) {
  if (error instanceof AnalysisServerError) {
    const detail = extractAnalysisErrorDetail(error.detail);

    if (error.status) {
      return language === "ko"
        ? `분석 요청이 거부되었습니다. 다시 녹음해보세요.${detail ? ` ${detail}` : ""}`
        : `The analysis request was rejected. Record again.${detail ? ` ${detail}` : ""}`;
    }

    if (error.message.includes("timed out")) {
      return language === "ko"
        ? "분석 시간이 너무 오래 걸렸습니다. 다시 시도하세요."
        : "Analysis took too long. Try again.";
    }

    return language === "ko"
      ? "분석 서버 연결이 여러 번 실패했습니다. 네트워크를 확인하고 다시 시도하세요."
      : "Analysis server connection failed after several tries. Check the network and try again.";
  }

  return language === "ko"
    ? "분석 서버에 연결하지 못했습니다. 다시 시도하세요."
    : "Could not reach the analysis server. Try again.";
}

function extractAnalysisErrorDetail(detail: unknown) {
  if (typeof detail === "string") {
    return detail;
  }

  if (
    typeof detail === "object" &&
    detail !== null &&
    "detail" in detail &&
    typeof detail.detail === "string"
  ) {
    return detail.detail;
  }

  return null;
}

function evaluateCheck(
  checkId: string,
  analysis: MonthOneAnalysisResponse,
  language: MainAppLanguage,
) {
  if (analysis.quality !== "usable") {
    return {
      passed: false,
      message:
        language === "ko"
          ? "녹음 품질이 충분하지 않습니다. 더 선명하게 다시 녹음하세요."
          : "The recording quality was not enough. Record a clearer take.",
    };
  }

  const metrics = analysis.metrics;
  let passed = false;

  if (checkId === "breath") {
    passed =
      metrics.loudnessSteadiness >= 0.45 &&
      metrics.fadeAmount <= 0.55 &&
      metrics.burstRatio <= 1.8;
  } else if (checkId === "gentle-sound") {
    passed =
      metrics.loudnessSteadiness >= 0.42 &&
      metrics.onsetAbruptness <= 0.55 &&
      (metrics.pitchStability === null || metrics.pitchStability >= 0.32);
  } else if (checkId === "resonance") {
    passed =
      metrics.resonanceScore >= 0.35 &&
      metrics.resonanceStability >= 0.3 &&
      metrics.throatEnergyRatio <= 0.72;
  } else if (checkId === "tone") {
    passed =
      metrics.loudnessSteadiness >= 0.42 &&
      metrics.fadeAmount <= 0.55 &&
      (metrics.pitchStability === null || metrics.pitchStability >= 0.34);
  }

  return {
    passed,
    message: passed
      ? language === "ko"
        ? "통과했습니다. 다음 항목으로 가세요."
        : "Passed. Move to the next check."
      : analysis.feedback.oneThingToTry,
  };
}

function TestCheckCard({
  check,
  durationMs,
  isAnalyzing,
  isBlocked,
  isRecording,
  language,
  result,
  onPress,
}: {
  check: MonthOneTestCheck;
  durationMs?: number;
  isAnalyzing: boolean;
  isBlocked: boolean;
  isRecording: boolean;
  language: MainAppLanguage;
  result?: CheckResult;
  onPress: () => void;
}) {
  const copyLanguage = language === "ko" ? "ko" : "en";
  const status = result?.passed
    ? language === "ko"
      ? "통과"
      : "Passed"
    : result
      ? language === "ko"
        ? "다시"
        : "Retry"
      : language === "ko"
        ? "대기"
        : "Ready";
  const gradient = getCheckGradient(check.id);
  const actionLabel = isAnalyzing
    ? language === "ko"
      ? "분석 중"
      : "Analyzing"
    : isBlocked
      ? language === "ko"
        ? "대기"
        : "Waiting"
      : isRecording
        ? language === "ko"
          ? "녹음 중지"
          : "Stop"
        : result?.passed
          ? language === "ko"
            ? "다시 녹음"
            : "Retake"
          : language === "ko"
            ? "시작"
            : "Start";

  return (
    <View style={[styles.checkCard, result?.passed && styles.checkCardPassed]}>
      <View style={styles.checkHeader}>
        <View style={styles.checkIcon}>
          <MaterialIcons
            name={check.icon}
            size={22}
            color={theme.primaryBright}
          />
        </View>
        <View style={styles.checkCopy}>
          <Text style={styles.checkTitle}>{check.title[copyLanguage]}</Text>
          <Text style={styles.checkGoal}>{check.goal[copyLanguage]}</Text>
        </View>
        <Text
          style={[styles.statusPill, result?.passed && styles.statusPillPassed]}
        >
          {status}
        </Text>
      </View>

      {result?.analysis ? (
        <View style={styles.metricRow}>
          {analysisMetricItems(result.analysis, language).map((metric) => (
            <AnalysisMetricCard key={metric.label} compact item={metric} />
          ))}
        </View>
      ) : null}

      {result?.message ? (
        <Text style={styles.resultMessage}>{result.message}</Text>
      ) : null}
      {durationMs ? (
        <Text style={styles.durationText}>{formatDuration(durationMs)}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        disabled={isAnalyzing || isBlocked}
        onPress={onPress}
        style={({ pressed }) => [
          styles.recordButton,
          isRecording && styles.recordButtonRecording,
          (isAnalyzing || isBlocked) && styles.recordButtonDisabled,
          pressed && !isRecording && styles.buttonPressed,
          pressed && isRecording && styles.recordButtonRecordingPressed,
        ]}
      >
        {!isRecording ? (
          <CardGradientBackground
            muted={isAnalyzing || isBlocked}
            variant={gradient}
          />
        ) : null}
        <Text
          style={[
            styles.recordButtonText,
            isRecording && styles.recordButtonTextRecording,
          ]}
        >
          {actionLabel}
        </Text>
        {result?.passed ? (
          <MaterialIcons
            name="refresh"
            size={19}
            color={theme.textMuted}
            style={styles.buttonIcon}
          />
        ) : null}
      </Pressable>
    </View>
  );
}

function IconButton({
  label,
  name,
  onPress,
}: {
  label: string;
  name: ComponentProps<typeof MaterialIcons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.buttonPressed,
      ]}
    >
      <MaterialIcons name={name} size={22} color={theme.text} />
    </Pressable>
  );
}

function PrimaryAction({
  disabled,
  icon,
  label,
  onPress,
}: {
  disabled?: boolean;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && styles.primaryButtonPressed,
      ]}
    >
      <CardGradientBackground muted={disabled} variant="integration" />
      <Text style={styles.primaryText}>{label}</Text>
      <MaterialIcons name={icon} size={22} color={theme.textMuted} />
    </Pressable>
  );
}

function getCheckGradient(checkId: string): CardGradientVariant {
  if (checkId === "breath") {
    return "breath";
  }

  if (checkId === "gentle-sound" || checkId === "tone") {
    return "tone";
  }

  if (checkId === "resonance") {
    return "resonance";
  }

  return "integration";
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 116,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  buttonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  kicker: {
    color: theme.primaryBright,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  header: {
    gap: 9,
  },
  title: {
    color: theme.text,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  progressPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: "rgba(50, 230, 226, 0.28)",
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  progressText: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
  },
  progressTrack: {
    backgroundColor: "rgba(184, 199, 211, 0.18)",
    borderRadius: 999,
    height: 8,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: theme.primaryBright,
    height: "100%",
  },
  checkList: {
    gap: 12,
  },
  checkCard: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 13,
    padding: 14,
  },
  checkCardPassed: {
    borderColor: "rgba(100, 217, 154, 0.46)",
  },
  checkHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
  },
  checkIcon: {
    alignItems: "center",
    backgroundColor: theme.primarySoft,
    borderRadius: 18,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  checkCopy: {
    flex: 1,
    gap: 4,
  },
  checkTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  checkGoal: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  statusPill: {
    backgroundColor: "rgba(184, 199, 211, 0.12)",
    borderRadius: 999,
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 9,
    paddingVertical: 6,
    textTransform: "uppercase",
  },
  statusPillPassed: {
    backgroundColor: "rgba(100, 217, 154, 0.16)",
    color: theme.success,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
  },
  resultMessage: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  durationText: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: "800",
  },
  recordButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: theme.background,
    borderColor: "rgba(69, 69, 77, 0.38)",
    borderWidth: 2,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 48,
    overflow: "hidden",
    paddingHorizontal: 15,
  },
  recordButtonRecording: {
    backgroundColor: theme.background,
    borderColor: "#D64545",
  },
  recordButtonRecordingPressed: {
    backgroundColor: "rgba(214, 69, 69, 0.08)",
  },
  recordButtonDisabled: {
    opacity: 0.5,
  },
  recordButtonText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "900",
    zIndex: 1,
  },
  recordButtonTextRecording: {
    color: "#D64545",
  },
  buttonIcon: {
    zIndex: 1,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderColor: "rgba(69, 69, 77, 0.38)",
    borderRadius: 28,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    overflow: "hidden",
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    opacity: 0.72,
  },
  primaryButtonDisabled: {
    opacity: 0.52,
  },
  primaryText: {
    color: theme.textMuted,
    fontSize: 20,
    fontWeight: "900",
    zIndex: 1,
  },
  passNote: {
    alignItems: "flex-start",
    backgroundColor: "rgba(100, 217, 154, 0.1)",
    borderColor: "rgba(100, 217, 154, 0.28)",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  passText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState, type ComponentProps } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VoiceFixTheme as theme } from "@/constants/theme";
import {
  displayPreferenceValue,
  mainAppLanguageOptions,
  mainAppText,
  type MainAppLanguage,
} from "@/features/prototype/localization";
import {
  AnalysisServerError,
  analyzeMonthOneTake,
  type MonthOneAnalysisResponse,
} from "@/features/prototype/serverAnalysis";
import {
  readMicPermissionStatus,
  readNotificationPermissionStatus,
  requestMicPermission,
  requestNotificationPermission,
} from "@/features/settings/permissions";
import { usePrototype } from "@/features/prototype/state";

export default function SettingsScreen() {
  const { state, resetPrototype, setLanguage, setTrainingPreference } =
    usePrototype();
  const router = useRouter();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [reminderPickerVisible, setReminderPickerVisible] = useState(false);
  const reminderDate = useMemo(
    () => parseTrainingTime(state.trainingTime),
    [state.trainingTime],
  );
  const text = mainAppText[state.language];
  const selectedLanguage =
    mainAppLanguageOptions.find((option) => option.id === state.language) ??
    mainAppLanguageOptions[0];

  async function analyzePickedAudioFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ["audio/*"],
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const analysis: MonthOneAnalysisResponse = await analyzeMonthOneTake({
        uri: result.assets[0].uri,
        drillId: "fah_vah_resonance",
        language: state.language,
        takeKind: "first",
      });

      Alert.alert(
        text.settings.analyzeAudioTitle,
        [
          `${analysis.drillId} · ${analysis.quality}`,
          `resonance ${formatDebugMetric(analysis.metrics.resonanceScore)} · forward ${formatDebugMetric(analysis.metrics.forwardEnergyRatio)} · throat ${formatDebugMetric(analysis.metrics.throatEnergyRatio)}`,
          analysis.feedback.whatWeHeard,
          analysis.feedback.oneThingToTry,
        ]
          .filter(Boolean)
          .join("\n\n"),
      );
    } catch (error) {
      const detail =
        error instanceof AnalysisServerError
          ? `\n\n${error.message}\n${JSON.stringify(error.detail, null, 2).slice(0, 700)}`
          : "";
      Alert.alert(
        text.settings.analyzeAudioFailedTitle,
        `${text.settings.analyzeAudioFailedBody}${detail}`,
      );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>{text.settings.kicker}</Text>
          <Text style={styles.title}>{text.settings.title}</Text>
          <Text style={styles.body}>{text.settings.body}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.settings.dailyTraining}</Text>
          <View style={styles.reminderTimeSetting}>
            <SettingRow
              icon="schedule"
              label={text.settings.reminderTime}
              value={displayPreferenceValue(state.trainingTime, state.language)}
              onPress={() => setReminderPickerVisible(true)}
              expanded={reminderPickerVisible && Platform.OS === "ios"}
            />
            {reminderPickerVisible && Platform.OS === "ios" ? (
              <View style={styles.timePickerSheet}>
                <DateTimePicker
                  display="spinner"
                  mode="time"
                  themeVariant="light"
                  textColor={theme.text}
                  value={reminderDate}
                  onChange={(event, date) =>
                    handleReminderTimeChange(
                      event,
                      date,
                      setTrainingPreference,
                      setReminderPickerVisible,
                    )
                  }
                />
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReminderPickerVisible(false)}
                  style={({ pressed }) => [
                    styles.timePickerDone,
                    pressed && styles.timePickerDonePressed,
                  ]}
                >
                  <Text style={styles.timePickerDoneText}>Done</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
          {reminderPickerVisible && Platform.OS === "android" ? (
            <DateTimePicker
              mode="time"
              value={reminderDate}
              onChange={(event, date) =>
                handleReminderTimeChange(
                  event,
                  date,
                  setTrainingPreference,
                  setReminderPickerVisible,
                )
              }
            />
          ) : null}
          <SettingRow
            icon="record-voice-over"
            label={text.settings.notificationTone}
            value={displayPreferenceValue(
              state.notificationTone,
              state.language,
            )}
            onPress={() =>
              setTrainingPreference(
                "notificationTone",
                state.notificationTone === "Coach-like"
                  ? "Gentle"
                  : "Coach-like",
              )
            }
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.settings.habitRules}</Text>
          <View style={styles.graceBox}>
            <MaterialIcons name="shield" size={22} color={theme.success} />
            <Text style={styles.graceText}>{text.settings.graceCopy}</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat
              value={`${state.streak.current}`}
              label={text.settings.currentStreak}
            />
            <Stat
              value={`${state.streak.best}`}
              label={text.settings.bestStreak}
            />
          </View>
        </View>

        <PermissionsSection text={text.settings} />

        <View style={[styles.panel, styles.otherPanel]}>
          <Text style={styles.panelTitle}>{text.settings.other}</Text>
          <LanguageDropdown
            label={text.settings.language}
            open={languageOpen}
            selectedLanguage={selectedLanguage}
            onToggle={() => setLanguageOpen((current) => !current)}
            onChange={(language) => {
              setLanguage(language);
              setLanguageOpen(false);
            }}
          />
          <SettingRow
            icon="upload-file"
            label={text.settings.analyzeAudioFile}
            value={text.settings.analyzeAudioFileValue}
            onPress={analyzePickedAudioFile}
          />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            resetPrototype();
            router.replace("/");
          }}
          style={({ pressed }) => [
            styles.resetButton,
            pressed && styles.resetPressed,
          ]}
        >
          <Text style={styles.resetText}>{text.settings.reset}</Text>
          <MaterialIcons name="restart-alt" size={20} color={theme.caution} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function PermissionsSection({
  text,
}: {
  text: (typeof mainAppText)["en"]["settings"];
}) {
  const { state, setNotificationsEnabled } = usePrototype();
  const [micEnabled, setMicEnabled] = useState(false);

  const refreshPermissions = useCallback(async () => {
    const [mic, notifications] = await Promise.all([
      readMicPermissionStatus(),
      readNotificationPermissionStatus(),
    ]);
    setMicEnabled(mic === "granted");

    if (state.notificationsEnabled && notifications !== "granted") {
      setNotificationsEnabled(false);
    }
  }, [setNotificationsEnabled, state.notificationsEnabled]);

  useFocusEffect(
    useCallback(() => {
      refreshPermissions().catch(() => {
        // Permission reads should not block settings.
      });
    }, [refreshPermissions]),
  );

  async function handleNotificationsToggle(enabled: boolean) {
    if (enabled) {
      const status = await requestNotificationPermission();
      if (status !== "granted") {
        setNotificationsEnabled(false);
        return;
      }

      setNotificationsEnabled(true);
      return;
    }

    setNotificationsEnabled(false);
  }

  async function handleMicToggle(enabled: boolean) {
    if (enabled) {
      const status = await requestMicPermission();
      setMicEnabled(status === "granted");
      return;
    }

    setMicEnabled(false);
  }

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{text.permissions}</Text>
      <PermissionToggleRow
        icon="notifications"
        label={text.notifications}
        value={state.notificationsEnabled}
        onValueChange={handleNotificationsToggle}
      />
      <PermissionToggleRow
        icon="mic"
        label={text.microphone}
        value={micEnabled}
        onValueChange={handleMicToggle}
      />
    </View>
  );
}

function PermissionToggleRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: boolean;
  onValueChange: (enabled: boolean) => void;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={20} color={theme.primaryBright} />
      </View>
      <Text style={styles.permissionLabel}>{label}</Text>
      <View style={styles.toggleWrap}>
        <Switch
          accessibilityRole="switch"
          value={value}
          onValueChange={onValueChange}
          style={styles.permissionSwitch}
          trackColor={{ false: "#AEAEB8", true: "#000000" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#AEAEB8"
        />
      </View>
    </View>
  );
}

function LanguageDropdown({
  label,
  open,
  selectedLanguage,
  onToggle,
  onChange,
}: {
  label: string;
  open: boolean;
  selectedLanguage: (typeof mainAppLanguageOptions)[number];
  onToggle: () => void;
  onChange: (language: MainAppLanguage) => void;
}) {
  return (
    <View style={styles.languageDropdown}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onToggle}
        style={[styles.settingRow, open && styles.settingRowOpen]}
      >
        <View style={styles.settingIcon}>
          <MaterialIcons
            name="language"
            size={20}
            color={theme.primaryBright}
          />
        </View>
        <View style={styles.settingCopy}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingValue}>
            {selectedLanguage.flag} {selectedLanguage.label} (
            {selectedLanguage.shortLabel})
          </Text>
        </View>
        <MaterialIcons
          name={open ? "expand-less" : "expand-more"}
          size={22}
          color={theme.textSubtle}
        />
      </Pressable>

      {open ? (
        <View style={styles.languageMenu}>
          <ScrollView
            nestedScrollEnabled
            style={styles.languageMenuScroll}
            showsVerticalScrollIndicator={false}
          >
            {mainAppLanguageOptions.map((option) => {
              const selected = selectedLanguage.id === option.id;

              return (
                <Pressable
                  key={option.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onChange(option.id)}
                  style={[
                    styles.languageMenuItem,
                    selected && styles.languageMenuItemActive,
                  ]}
                >
                  <Text style={styles.languageFlag}>{option.flag}</Text>
                  <Text style={styles.languageShortLabel}>
                    {option.shortLabel}
                  </Text>
                  <Text style={styles.languageName}>{option.label}</Text>
                  {selected ? (
                    <MaterialIcons
                      name="check"
                      size={18}
                      color={theme.primaryBright}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

function formatDebugMetric(value: number | undefined) {
  return typeof value === "number" ? value.toFixed(2) : "n/a";
}

function parseTrainingTime(value: string) {
  if (value === "Choose later") {
    return parseTrainingTime("7:30 PM");
  }

  const match = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return parseTrainingTime("7:30 PM");
  }

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }
  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function formatTrainingTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function handleReminderTimeChange(
  event: DateTimePickerEvent,
  date: Date | undefined,
  setTrainingPreference: (
    key: "trainingTime" | "notificationTone",
    value: string,
  ) => void,
  setReminderPickerVisible: (visible: boolean) => void,
) {
  if (Platform.OS === "android" || event.type === "dismissed") {
    setReminderPickerVisible(false);
  }

  if (event.type === "dismissed" || !date) {
    return;
  }

  setTrainingPreference("trainingTime", formatTrainingTime(date));
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  expanded = false,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  value: string;
  onPress?: () => void;
  expanded?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={[styles.settingRow, expanded && styles.settingRowOpen]}
    >
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={20} color={theme.primaryBright} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      {onPress ? (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.textSubtle}
        />
      ) : null}
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
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
  header: {
    gap: 9,
    paddingTop: 12,
  },
  kicker: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  otherPanel: {
    zIndex: 5,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "800",
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 68,
    padding: 12,
  },
  settingRowOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  reminderTimeSetting: {
    position: "relative",
  },
  timePickerSheet: {
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderTopWidth: 0,
    borderWidth: 1,
    overflow: "hidden",
  },
  timePickerDone: {
    alignItems: "center",
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    borderTopWidth: 1,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  timePickerDonePressed: {
    backgroundColor: theme.primarySoft,
  },
  timePickerDoneText: {
    color: theme.primaryBright,
    fontSize: 15,
    fontWeight: "800",
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: theme.primarySoft,
    borderRadius: 17,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  settingCopy: {
    flex: 1,
    gap: 3,
  },
  permissionLabel: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  toggleWrap: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  permissionSwitch: {
    transform: [{ scaleX: 1.06 }, { scaleY: 1.06 }],
  },
  settingLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
  },
  settingValue: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  languageDropdown: {
    position: "relative",
    zIndex: 2,
  },
  languageMenu: {
    backgroundColor: theme.surface,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderTopWidth: 0,
    borderWidth: 1,
    overflow: "hidden",
  },
  languageMenuScroll: {
    maxHeight: 292,
  },
  languageMenuItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  languageMenuItemActive: {
    backgroundColor: theme.primarySoft,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageShortLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
    minWidth: 48,
  },
  languageName: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  graceBox: {
    alignItems: "flex-start",
    backgroundColor: "rgba(245, 245, 250, 1)",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 13,
  },
  graceText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  stat: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    flex: 1,
    padding: 13,
  },
  statValue: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
    textTransform: "uppercase",
  },
  resetButton: {
    alignItems: "center",
    borderColor: "rgba(169, 68, 53, 0.28)",
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 52,
  },
  resetPressed: {
    backgroundColor: "rgba(169, 68, 53, 0.08)",
  },
  resetText: {
    color: theme.caution,
    fontSize: 15,
    fontWeight: "800",
  },
});

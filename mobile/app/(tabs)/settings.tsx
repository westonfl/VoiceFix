import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { displayPreferenceValue, mainAppLanguageOptions, mainAppText } from '@/features/prototype/localization';
import { AnalysisServerError, analyzeMonthOneTake } from '@/features/prototype/serverAnalysis';
import { usePrototype } from '@/features/prototype/state';

export default function SettingsScreen() {
  const { state, resetPrototype, setLanguage, setTrainingPreference } = usePrototype();
  const router = useRouter();
  const text = mainAppText[state.language];
  const selectedLanguage = mainAppLanguageOptions.find((option) => option.id === state.language) ?? mainAppLanguageOptions[0];

  async function analyzePickedAudioFile() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: ['audio/*'],
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const analysis = await analyzeMonthOneTake({
        uri: result.assets[0].uri,
        drillId: 'resonance_vowel',
        language: state.language,
        takeKind: 'first',
      });

      Alert.alert(
        text.settings.analyzeAudioTitle,
        [
          `${analysis.drillId} · ${analysis.quality}`,
          `resonance ${analysis.metrics.resonanceScore.toFixed(2)} · forward ${analysis.metrics.forwardEnergyRatio.toFixed(2)} · throat ${analysis.metrics.throatEnergyRatio.toFixed(2)}`,
          analysis.feedback.whatWeHeard,
          analysis.feedback.oneThingToTry,
        ].join('\n\n'),
      );
    } catch (error) {
      const detail =
        error instanceof AnalysisServerError
          ? `\n\n${error.message}\n${JSON.stringify(error.detail, null, 2).slice(0, 700)}`
          : '';
      Alert.alert(text.settings.analyzeAudioFailedTitle, `${text.settings.analyzeAudioFailedBody}${detail}`);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{text.settings.kicker}</Text>
          <Text style={styles.title}>{text.settings.title}</Text>
          <Text style={styles.body}>{text.settings.body}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.settings.dailyTraining}</Text>
          <SettingRow
            icon="schedule"
            label={text.settings.reminderTime}
            value={displayPreferenceValue(state.trainingTime, state.language)}
            onPress={() => setTrainingPreference('trainingTime', state.trainingTime === '7:30 PM' ? '8:00 AM' : '7:30 PM')}
          />
          <SettingRow
            icon="record-voice-over"
            label={text.settings.notificationTone}
            value={displayPreferenceValue(state.notificationTone, state.language)}
            onPress={() => setTrainingPreference('notificationTone', state.notificationTone === 'Coach-like' ? 'Gentle' : 'Coach-like')}
          />
          <SettingRow
            icon="timer"
            label={text.settings.sessionLength}
            value={displayPreferenceValue(state.sessionLength, state.language)}
            onPress={() => setTrainingPreference('sessionLength', state.sessionLength === '12 minutes' ? '5 minutes' : '12 minutes')}
          />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.settings.habitRules}</Text>
          <View style={styles.graceBox}>
            <MaterialIcons name="shield" size={22} color={theme.success} />
            <Text style={styles.graceText}>{text.settings.graceCopy}</Text>
          </View>
          <View style={styles.statsRow}>
            <Stat value={`${state.streak.current}`} label={text.settings.currentStreak} />
            <Stat value={`${state.streak.best}`} label={text.settings.bestStreak} />
          </View>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{text.settings.safetyAndData}</Text>
          <SettingRow icon="health-and-safety" label={text.settings.safetyReminder} value={text.settings.safetyReminderValue} />
          <SettingRow
            icon="language"
            label={text.settings.language}
            value={`${selectedLanguage.label} (${selectedLanguage.shortLabel})`}
            onPress={() => setLanguage(state.language === 'en' ? 'ko' : 'en')}
          />
          <SettingRow icon="mic" label={text.settings.audio} value={text.settings.audioValue} />
          <SettingRow icon="upload-file" label={text.settings.analyzeAudioFile} value={text.settings.analyzeAudioFileValue} onPress={analyzePickedAudioFile} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            resetPrototype();
            router.replace('/');
          }}
          style={({ pressed }) => [styles.resetButton, pressed && styles.resetPressed]}>
          <Text style={styles.resetText}>{text.settings.reset}</Text>
          <MaterialIcons name="restart-alt" size={20} color={theme.caution} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole={onPress ? 'button' : undefined} onPress={onPress} style={styles.settingRow}>
      <View style={styles.settingIcon}>
        <MaterialIcons name={icon} size={20} color={theme.primaryBright} />
      </View>
      <View style={styles.settingCopy}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingValue}>{value}</Text>
      </View>
      {onPress ? <MaterialIcons name="chevron-right" size={20} color={theme.textSubtle} /> : null}
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
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 68,
    padding: 12,
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 17,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  settingCopy: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
  settingValue: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  graceBox: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(100, 217, 154, 0.1)',
    borderColor: 'rgba(100, 217, 154, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
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
    flexDirection: 'row',
    gap: 10,
  },
  stat: {
    backgroundColor: theme.surface,
    borderRadius: 8,
    flex: 1,
    padding: 13,
  },
  statValue: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  resetButton: {
    alignItems: 'center',
    borderColor: 'rgba(255, 122, 112, 0.35)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    minHeight: 52,
  },
  resetPressed: {
    backgroundColor: 'rgba(255, 122, 112, 0.08)',
  },
  resetText: {
    color: theme.caution,
    fontSize: 15,
    fontWeight: '800',
  },
});

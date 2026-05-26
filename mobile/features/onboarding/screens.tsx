import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';

import { InfoList, OptionCard, Pill, ScreenHeader, SignalWave, StudioMark } from './components';
import { answerLabel, uiText } from './localization';
import type { Language, OnboardingAnswers, OnboardingScreen, StarterPlan } from './types';

type ScreenProps = {
  screen: OnboardingScreen;
  answers: OnboardingAnswers;
  language: Language;
  plan: StarterPlan;
  recordingComplete: boolean;
  onAdvance: () => void;
  onSecondary: () => void;
  onSelect: (key: keyof OnboardingAnswers, value: string) => void;
  onToggle: (key: keyof OnboardingAnswers, value: string) => void;
  onCompleteRecording: () => void;
};

export function RenderOnboardingScreen(props: ScreenProps) {
  const { screen } = props;

  if (screen.kind === 'splash') {
    return <SplashScreen {...props} />;
  }

  if (screen.kind === 'single' || screen.kind === 'multi') {
    return <ChoiceScreen {...props} />;
  }

  if (screen.kind === 'permission') {
    return <PermissionScreen {...props} />;
  }

  if (screen.kind === 'voiceIntro') {
    return <InfoScreen {...props} />;
  }

  if (screen.kind === 'recording') {
    return <RecordingScreen {...props} />;
  }

  if (screen.kind === 'analysis') {
    return <AnalysisScreen {...props} />;
  }

  if (screen.kind === 'recap') {
    return <RecapScreen {...props} />;
  }

  if (screen.kind === 'plan') {
    return <PlanScreen {...props} />;
  }

  if (screen.kind === 'sessionPreview') {
    return <SessionPreviewScreen {...props} />;
  }

  if (screen.kind === 'conversion') {
    return <ConversionScreen {...props} />;
  }

  if (screen.kind === 'ready') {
    return <ReadyScreen {...props} />;
  }

  return <InfoScreen {...props} />;
}

function SplashScreen({ screen }: ScreenProps) {
  return (
    <View style={[styles.center, styles.splash]}>
      <StudioMark large />
      <View style={styles.splashCopy}>
        <Text style={styles.brand}>VoiceFix</Text>
        <Text style={styles.display}>{screen.title}</Text>
        <Text style={styles.body}>{screen.body}</Text>
      </View>
    </View>
  );
}

function InfoScreen({ screen }: ScreenProps) {
  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      {screen.comparison ? <InfoList items={screen.comparison} /> : null}
      {screen.bullets ? <InfoList items={screen.bullets} /> : null}
    </View>
  );
}

function ChoiceScreen({ screen, answers, onSelect, onToggle }: ScreenProps) {
  const dataKey = screen.dataKey;
  const value = dataKey ? answers[dataKey] : '';
  const selectedValues = Array.isArray(value) ? value : [value];

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.options}>
        {screen.options?.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            selected={selectedValues.includes(option.id)}
            onPress={() => {
              if (!dataKey) {
                return;
              }

              if (screen.kind === 'multi') {
                onToggle(dataKey, option.id);
                return;
              }

              onSelect(dataKey, option.id);
            }}
          />
        ))}
      </View>
    </View>
  );
}

function PermissionScreen({ screen }: ScreenProps) {
  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.permissionPanel}>
        <MaterialIcons name="mic" size={34} color={theme.primaryBright} />
        <View style={styles.permissionCopy}>
          <Text style={styles.panelTitle}>Mic access for baseline checks</Text>
          <Text style={styles.panelText}>VoiceFix listens only during exercises you start.</Text>
        </View>
      </View>
    </View>
  );
}

function RecordingScreen({ screen, language, recordingComplete }: ScreenProps) {
  const recording = screen.recording;
  const text = uiText[language];

  if (!recording) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={recording.title} body={recording.instruction} />
      <View style={styles.recordingPanel}>
        <View style={styles.recordingTop}>
          <View style={styles.recordIcon}>
            <MaterialIcons name={recording.icon} size={28} color={theme.backgroundDeep} />
          </View>
          <View>
            <Text style={styles.recordMeta}>
              {text.sample} {recording.index}
              {language === 'ko' ? text.of : ` ${text.of} `}5
            </Text>
            <Text style={styles.recordTitle}>{recording.title}</Text>
          </View>
        </View>
        <SignalWave active />
        <View style={styles.listenList}>
          {recording.listensFor.map((item) => (
            <Pill key={item} label={item} tone={recordingComplete ? 'green' : 'signal'} />
          ))}
        </View>
      </View>
      {screen.secondaryAction && !recordingComplete ? (
        <Text style={styles.secondaryHint}>
          {screen.secondaryAction} {text.actionUnavailable}
        </Text>
      ) : null}
    </View>
  );
}

function AnalysisScreen({ screen }: ScreenProps) {
  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.analysisPanel}>
        <SignalWave active />
        <InfoList items={screen.bullets ?? []} />
      </View>
    </View>
  );
}

function RecapScreen({ screen, answers, language, plan }: ScreenProps) {
  const text = uiText[language];

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.recapGrid}>
        <RecapBlock
          icon="person-search"
          title={text.fromAnswers}
          body={
            language === 'ko'
              ? `${answerLabel(answers.primaryGoal, language)} 목표, ${answerLabel(answers.playbackComfort, language)}, ${answerLabel(answers.practiceLength, language)}${text.recapRoutine}.`
              : `${answerLabel(answers.primaryGoal, language)} goal, ${answerLabel(answers.playbackComfort, language)} playback comfort, ${answerLabel(answers.practiceLength, language)} ${text.recapRoutine}.`
          }
        />
        <RecapBlock
          icon="graphic-eq"
          title={text.fromVoiceCheck}
          body={
            language === 'ko'
              ? `${text.starterHypothesis} ${plan.focus}.`
              : `${text.starterHypothesis} ${plan.focus.toLowerCase()}.`
          }
        />
        <RecapBlock icon="verified" title={text.carefulClaim} body={text.carefulClaimBody} />
      </View>
    </View>
  );
}

function PlanScreen({ screen, language, plan }: ScreenProps) {
  const text = uiText[language];

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={plan.focus} body={plan.reason} />
      <View style={styles.planPanel}>
        {plan.planDays.map((day) => (
          <View key={day.range} style={styles.planRow}>
            <Text style={styles.planRange}>{day.range}</Text>
            <View style={styles.planCopy}>
              <Text style={styles.planTitle}>{day.title}</Text>
              <Text style={styles.planDetail}>{day.detail}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.cueBox}>
        <MaterialIcons name="tips-and-updates" size={22} color={theme.warning} />
        <Text style={styles.cueText}>
          {text.firstCue} {plan.cue}
        </Text>
      </View>
    </View>
  );
}

function SessionPreviewScreen({ screen, plan }: ScreenProps) {
  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.sessionPanel}>
        <Text style={styles.panelTitle}>{plan.firstSession}</Text>
        {plan.drills.map((drill, index) => (
          <View key={drill} style={styles.sessionRow}>
            <Text style={styles.sessionNumber}>{index + 1}</Text>
            <Text style={styles.sessionText}>{drill}</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.textSubtle} />
          </View>
        ))}
      </View>
    </View>
  );
}

function ConversionScreen({ screen, language }: ScreenProps) {
  const text = uiText[language];

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.conversionGrid}>
        <RecapBlock icon="play-circle" title={text.freeNow} body={text.freeNowBody} />
        <RecapBlock icon="auto-graph" title={text.premiumLater} body={text.premiumLaterBody} />
      </View>
    </View>
  );
}

function ReadyScreen({ screen, language, plan }: ScreenProps) {
  const text = uiText[language];

  return (
    <View style={styles.stack}>
      <ScreenHeader eyebrow={screen.eyebrow} title={screen.title} body={screen.body} />
      <View style={styles.readyPanel}>
        <StudioMark />
        <View style={styles.readyCopy}>
          <Text style={styles.panelTitle}>{plan.firstSession}</Text>
          <Text style={styles.panelText}>
            {text.focus} {plan.focus}
          </Text>
        </View>
      </View>
      <InfoList items={[...plan.drills, text.stopIfHurts]} />
    </View>
  );
}

function RecapBlock({ icon, title, body }: { icon: React.ComponentProps<typeof MaterialIcons>['name']; title: string; body: string }) {
  return (
    <View style={styles.recapBlock}>
      <View style={styles.recapIcon}>
        <MaterialIcons name={icon} size={20} color={theme.primaryBright} />
      </View>
      <Text style={styles.recapTitle}>{title}</Text>
      <Text style={styles.recapBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 18,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  splash: {
    gap: 26,
    minHeight: 620,
  },
  splashCopy: {
    gap: 10,
  },
  brand: {
    color: theme.primaryBright,
    fontSize: 16,
    fontWeight: '800',
  },
  display: {
    color: theme.text,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 46,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  options: {
    gap: 10,
  },
  permissionPanel: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(50, 230, 226, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  permissionCopy: {
    flex: 1,
    gap: 4,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
  },
  panelText: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  recordingPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  recordingTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 13,
    marginBottom: 10,
  },
  recordIcon: {
    alignItems: 'center',
    backgroundColor: theme.primaryBright,
    borderRadius: 22,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  recordMeta: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '700',
  },
  recordTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  listenList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryHint: {
    color: theme.textSubtle,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  analysisPanel: {
    gap: 14,
  },
  recapGrid: {
    gap: 10,
  },
  recapBlock: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 15,
  },
  recapIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 16,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  recapTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  recapBody: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  planPanel: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(50, 230, 226, 0.18)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 16,
    padding: 16,
  },
  planRow: {
    flexDirection: 'row',
    gap: 14,
  },
  planRange: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    width: 78,
  },
  planCopy: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  planDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  cueBox: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 184, 94, 0.1)',
    borderColor: 'rgba(244, 184, 94, 0.3)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  cueText: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  sessionPanel: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  sessionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sessionNumber: {
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    height: 30,
    lineHeight: 30,
    textAlign: 'center',
    width: 30,
  },
  sessionText: {
    color: theme.text,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  conversionGrid: {
    gap: 10,
  },
  readyPanel: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  readyCopy: {
    flex: 1,
    gap: 4,
  },
});

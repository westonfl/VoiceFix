import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioPlayer } from 'expo-audio';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { formatDuration } from '@/features/prototype/analysis';
import { getWeek } from '@/features/prototype/curriculum';
import { displaySessionText, displayWeek, mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';

export default function JournalScreen() {
  const { state } = usePrototype();
  const hasClips = state.savedClips.length > 0;
  const text = mainAppText[state.language];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{text.journal.kicker}</Text>
          <Text style={styles.title}>{text.journal.title}</Text>
          <Text style={styles.body}>{text.journal.body}</Text>
        </View>

        {!hasClips ? (
          <View style={styles.emptyPanel}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="graphic-eq" size={28} color={theme.primaryBright} />
            </View>
            <Text style={styles.emptyTitle}>{text.journal.emptyTitle}</Text>
            <Text style={styles.body}>{text.journal.emptyBody}</Text>
          </View>
        ) : null}

        {hasClips ? (
          <View style={styles.comparePanel}>
            <Text style={styles.panelTitle}>{text.journal.latestComparison}</Text>
            <View style={styles.compareGrid}>
              <TakeBlock label={text.journal.firstTake} value={formatDuration(state.savedClips[0].firstDurationMs)} />
              <TakeBlock label={text.journal.retry} value={formatDuration(state.savedClips[0].retryDurationMs)} accent />
            </View>
          </View>
        ) : null}

        <View style={styles.clipList}>
          {state.savedClips.map((clip) => (
            <ClipCard key={clip.id} clip={clip} />
          ))}
        </View>

        <View style={styles.monthPanel}>
          <Text style={styles.panelTitle}>{text.journal.monthlyCheckpoints}</Text>
          {[text.journal.checkpointOne, text.journal.checkpointTwo, text.journal.checkpointThree].map((item, index) => (
            <View key={item} style={styles.checkpointRow}>
              <Text style={styles.checkpointNumber}>{index + 1}</Text>
              <Text style={styles.checkpointText}>{item}</Text>
              <Text style={styles.checkpointState}>{index === 0 && hasClips ? text.journal.open : text.journal.later}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TakeBlock({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={[styles.takeBlock, accent && styles.takeBlockAccent]}>
      <Text style={styles.takeLabel}>{label}</Text>
      <Text style={styles.takeValue}>{value}</Text>
    </View>
  );
}

function ClipCard({ clip }: { clip: ReturnType<typeof usePrototype>['state']['savedClips'][number] }) {
  const firstPlayer = useAudioPlayer(clip.firstTakeUri ?? null);
  const retryPlayer = useAudioPlayer(clip.retryTakeUri ?? null);
  const { state } = usePrototype();
  const text = mainAppText[state.language];
  const clipWeek = getWeek(clip.weekNumber);
  const clipWeekDisplay = displayWeek(clipWeek, state.language);
  const clipRole = clip.title.split(' - ')[1];
  const clipTitle = clipRole ? `${clipWeekDisplay.title} - ${displaySessionText(clipRole, state.language)}` : clipWeekDisplay.title;

  function playFirst() {
    firstPlayer.seekTo(0);
    firstPlayer.play();
  }

  function playRetry() {
    retryPlayer.seekTo(0);
    retryPlayer.play();
  }

  return (
    <View style={styles.clipCard}>
      <View style={styles.clipTop}>
        <View style={styles.clipIcon}>
          <MaterialIcons name="library-music" size={20} color={theme.journal} />
        </View>
        <View style={styles.clipCopy}>
          <Text style={styles.clipTitle}>{clipTitle}</Text>
          <Text style={styles.clipMeta}>{text.common.week} {clip.weekNumber} · {text.common.day} {clip.dayNumber}</Text>
        </View>
      </View>
      <Text style={styles.clipText}>{clip.observation}</Text>
      <Text style={styles.clipResult}>{clip.comparison}</Text>
      <View style={styles.playRow}>
        <PlayButton label={text.journal.first} disabled={!clip.firstTakeUri} onPress={playFirst} />
        <PlayButton label={text.journal.retry} disabled={!clip.retryTakeUri} onPress={playRetry} />
      </View>
      <View style={styles.uriBlock}>
        <Text style={styles.uriText}>{text.journal.first}: {clip.firstTakeUri ? text.journal.savedLocally : text.journal.noUri}</Text>
        <Text style={styles.uriText}>{text.journal.retry}: {clip.retryTakeUri ? text.journal.savedLocally : text.journal.noUri}</Text>
      </View>
    </View>
  );
}

function PlayButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.playButton, pressed && styles.playButtonPressed, disabled && styles.playButtonDisabled]}>
      <MaterialIcons name="play-arrow" size={18} color={disabled ? theme.textSubtle : theme.backgroundDeep} />
      <Text style={[styles.playButtonText, disabled && styles.playButtonTextDisabled]}>{label}</Text>
    </Pressable>
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
    color: theme.journal,
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
  emptyPanel: {
    alignItems: 'flex-start',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(155, 124, 255, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(155, 124, 255, 0.14)',
    borderRadius: 22,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  comparePanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(155, 124, 255, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  compareGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  takeBlock: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  takeBlockAccent: {
    borderColor: 'rgba(100, 217, 154, 0.42)',
  },
  takeLabel: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  takeValue: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },
  clipList: {
    gap: 10,
  },
  clipCard: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 15,
  },
  clipTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  clipIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(155, 124, 255, 0.14)',
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  clipCopy: {
    flex: 1,
    gap: 3,
  },
  clipTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  clipMeta: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  clipText: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  clipResult: {
    color: theme.success,
    fontSize: 14,
    fontWeight: '800',
  },
  playRow: {
    flexDirection: 'row',
    gap: 10,
  },
  playButton: {
    alignItems: 'center',
    backgroundColor: theme.journal,
    borderRadius: 10,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 42,
  },
  playButtonPressed: {
    opacity: 0.78,
  },
  playButtonDisabled: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderWidth: 1,
  },
  playButtonText: {
    color: theme.backgroundDeep,
    fontSize: 14,
    fontWeight: '800',
  },
  playButtonTextDisabled: {
    color: theme.textSubtle,
  },
  uriBlock: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 8,
    gap: 4,
    padding: 10,
  },
  uriText: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '700',
  },
  monthPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  checkpointRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 40,
  },
  checkpointNumber: {
    color: theme.journal,
    fontSize: 13,
    fontWeight: '800',
    width: 18,
  },
  checkpointText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  checkpointState: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

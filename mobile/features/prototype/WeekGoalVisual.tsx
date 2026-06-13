import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';

type WeekGoalVisualProps = {
  weekNumber: number;
  compact?: boolean;
  locked?: boolean;
};

export function WeekGoalVisual({ weekNumber, compact = false, locked = false }: WeekGoalVisualProps) {
  const sizeStyle = compact ? styles.compact : styles.hero;

  if (locked) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <View style={styles.lockedArc}>
          {[0, 1, 2, 3, 4].map((index) => (
            <View key={index} style={[styles.ghostMark, { transform: [{ translateY: Math.abs(index - 2) * 8 }] }]} />
          ))}
        </View>
        <View style={styles.lockBadge}>
          <MaterialIcons name="lock" size={compact ? 16 : 22} color={theme.text} />
        </View>
      </View>
    );
  }

  if (weekNumber === 1) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <View style={styles.breathTrack} />
        <View style={styles.breathDots}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={[styles.airDot, { opacity: 0.35 + index * 0.2 }]} />
          ))}
        </View>
      </View>
    );
  }

  if (weekNumber === 2) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <View style={styles.onsetRow}>
          {[0, 1, 2].map((index) => (
            <View key={index} style={[styles.ghostMark, { width: 12 + index * 8 }]} />
          ))}
          <View style={styles.soundCore} />
        </View>
      </View>
    );
  }

  if (weekNumber === 3) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <View style={styles.resonanceCenter} />
        <View style={styles.resonanceArc}>
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <View key={index} style={[styles.resonanceDot, { transform: [{ translateY: Math.abs(index - 3) * 7 }] }]} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.frame, sizeStyle]}>
      <View style={styles.bridgeRow}>
        <View style={styles.bridgeLine} />
        <View style={styles.bridgePulse} />
        <View style={styles.bridgeOpen} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hero: {
    height: 138,
    width: '100%',
  },
  compact: {
    height: 82,
    width: '100%',
  },
  breathTrack: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 6,
    width: '72%',
  },
  breathDots: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  airDot: {
    backgroundColor: theme.textMuted,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  onsetRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  ghostMark: {
    backgroundColor: 'rgba(184, 199, 211, 0.42)',
    borderRadius: 999,
    height: 6,
    width: 22,
  },
  soundCore: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 8,
    width: 54,
  },
  resonanceCenter: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  resonanceArc: {
    flexDirection: 'row',
    gap: 8,
    position: 'absolute',
    top: '36%',
  },
  resonanceDot: {
    backgroundColor: 'rgba(184, 199, 211, 0.56)',
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  bridgeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  bridgeLine: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 6,
    width: 56,
  },
  bridgePulse: {
    borderColor: theme.text,
    borderRadius: 14,
    borderWidth: 5,
    height: 28,
    width: 28,
  },
  bridgeOpen: {
    backgroundColor: 'rgba(184, 199, 211, 0.58)',
    borderRadius: 999,
    height: 6,
    width: 76,
  },
  lockedArc: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  lockBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 16, 0.76)',
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    position: 'absolute',
    width: 42,
  },
});

import { StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';
import type { AnalysisMetricItem } from '@/features/prototype/analysisMetrics';

type AnalysisMetricCardProps = {
  item: AnalysisMetricItem;
  compact?: boolean;
};

function statusStyles(status: AnalysisMetricItem['status']) {
  if (status === 'good') {
    return {
      card: styles.cardGood,
      value: styles.valueGood,
      dot: styles.dotGood,
    };
  }

  if (status === 'watch') {
    return {
      card: styles.cardWatch,
      value: styles.valueWatch,
      dot: styles.dotWatch,
    };
  }

  return {
    card: styles.cardNeutral,
    value: styles.valueNeutral,
    dot: styles.dotNeutral,
  };
}

export function AnalysisMetricCard({ item, compact = false }: AnalysisMetricCardProps) {
  const tone = statusStyles(item.status);

  if (compact) {
    return (
      <View style={[styles.compactCard, tone.card]}>
        <View style={styles.compactTop}>
          <Text style={[styles.compactValue, tone.value]}>{item.value}</Text>
          <View style={[styles.statusDot, tone.dot]} />
        </View>
        <Text style={styles.compactLabel}>{item.label}</Text>
        <Text style={styles.compactTarget}>{item.goodTarget}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, tone.card]}>
      <View style={styles.header}>
        <View style={styles.valueBlock}>
          <Text style={[styles.value, tone.value]}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
        <View style={[styles.statusDot, tone.dot]} />
      </View>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.target}>{item.goodTarget}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 20,
    gap: 8,
    padding: 16,
  },
  cardGood: {
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
  },
  cardWatch: {
    backgroundColor: theme.pastelLemon,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
  },
  cardNeutral: {
    borderColor: 'rgba(0, 0, 0, 0.06)',
    borderWidth: 1,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueBlock: {
    flex: 1,
    gap: 2,
  },
  value: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  valueGood: {
    color: theme.text,
  },
  valueWatch: {
    color: theme.text,
  },
  valueNeutral: {
    color: theme.textMuted,
  },
  label: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusDot: {
    borderRadius: 999,
    height: 10,
    marginTop: 8,
    width: 10,
  },
  dotGood: {
    backgroundColor: theme.pastelMint,
    borderColor: theme.text,
    borderWidth: 2,
  },
  dotWatch: {
    backgroundColor: theme.text,
  },
  dotNeutral: {
    backgroundColor: theme.textSubtle,
  },
  description: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  target: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  compactCard: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 16,
    flex: 1,
    gap: 4,
    minWidth: 0,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  compactTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  compactValue: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  compactLabel: {
    color: theme.textSubtle,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  compactTarget: {
    color: theme.textMuted,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});

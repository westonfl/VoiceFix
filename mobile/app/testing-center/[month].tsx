import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';

const monthOneChecks = [
  'Sustained breath without pushing',
  'Gentle sound without throat pressure',
  'Easy resonance without forcing buzz',
  'Short tone with clean release',
];

export default function TestingCenterScreen() {
  const { month } = useLocalSearchParams<{ month?: string }>();
  const parsedMonth = Number(month);
  const targetMonth = Number.isFinite(parsedMonth) ? parsedMonth : 1;
  const { state, completeMonthlyTest } = usePrototype();
  const text = mainAppText[state.language];
  const isMonthOne = targetMonth === 1;
  const passed = state.monthlyTests[`${targetMonth}`]?.status === 'passed';
  const title = state.language === 'ko' ? `${targetMonth}개월 테스트 센터` : `Month ${targetMonth} Testing Center`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <IconButton label={state.language === 'ko' ? '뒤로' : 'Back'} name="arrow-back" onPress={() => router.back()} />
          <Text style={styles.kicker}>{state.language === 'ko' ? '월말 확인' : 'Month-end gate'}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>
            {isMonthOne
              ? state.language === 'ko'
                ? '다음 달은 여기서 좋은 결과를 얻은 뒤 열립니다.'
                : 'The next month opens only after this check shows good results.'
              : state.language === 'ko'
                ? '이 테스트 센터는 곧 열립니다.'
                : 'This testing center is coming soon.'}
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{state.language === 'ko' ? '확인 항목' : 'Checks'}</Text>
          {(isMonthOne ? monthOneChecks : ['Coming soon']).map((check, index) => (
            <View key={check} style={styles.checkRow}>
              <View style={styles.checkNumber}>
                <Text style={styles.checkNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.checkText}>{check}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>{state.language === 'ko' ? '통과 기준' : 'Pass rule'}</Text>
          <Text style={styles.body}>
            {state.language === 'ko'
              ? '각 항목에서 첫 테이크, 재시도, 분석 결과가 모두 안정적이어야 합니다. 이 프로토타입에서는 버튼으로 통과 상태를 시뮬레이션합니다.'
              : 'Each check needs a first take, retry, and stable analysis result. In this prototype, the button simulates a passed result.'}
          </Text>
        </View>

        {isMonthOne ? (
          <PrimaryAction
            disabled={passed}
            icon={passed ? 'check-circle' : 'science'}
            label={passed ? state.language === 'ko' ? '통과 완료' : 'Passed' : state.language === 'ko' ? '프로토타입 통과 처리' : 'Mark prototype passed'}
            onPress={() => completeMonthlyTest(1)}
          />
        ) : null}

        {passed ? (
          <View style={styles.passNote}>
            <MaterialIcons name="verified" size={20} color={theme.success} />
            <Text style={styles.passText}>{state.language === 'ko' ? '다음 달을 열 수 있는 상태입니다.' : 'This month is ready to unlock the next month.'}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({ label, name, onPress }: { label: string; name: ComponentProps<typeof MaterialIcons>['name']; onPress: () => void }) {
  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && styles.buttonPressed]}>
      <MaterialIcons name={name} size={22} color={theme.text} />
    </Pressable>
  );
}

function PrimaryAction({ disabled, icon, label, onPress }: { disabled?: boolean; icon: ComponentProps<typeof MaterialIcons>['name']; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.primaryButton, disabled && styles.primaryButtonDisabled, pressed && styles.primaryButtonPressed]}>
      <Text style={styles.primaryText}>{label}</Text>
      <MaterialIcons name={icon} size={22} color={theme.backgroundDeep} />
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
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  buttonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  kicker: {
    color: theme.primaryBright,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    gap: 9,
  },
  title: {
    color: theme.text,
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 37,
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
    gap: 12,
    padding: 16,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  checkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  checkNumber: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  checkNumberText: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '900',
  },
  checkText: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    backgroundColor: theme.primaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.72,
  },
  primaryText: {
    color: theme.backgroundDeep,
    fontSize: 16,
    fontWeight: '900',
  },
  passNote: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(100, 217, 154, 0.1)',
    borderColor: 'rgba(100, 217, 154, 0.26)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
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

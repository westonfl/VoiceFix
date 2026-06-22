import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PACKAGE_TYPE,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PRIVACY_URL, TERMS_URL } from '@/constants/env';
import { RehearTheme as theme } from '@/constants/theme';
import { SignalWave } from '@/features/onboarding/components';

import { useSubscription } from './SubscriptionProvider';

const benefitCopy = [
  'A guided voice session every day',
  'Plain feedback after each take',
  'Your complete six-month practice path',
  'Progress saved in your private journal',
];

export function CustomPaywall({ offering }: { offering: PurchasesOffering }) {
  const { purchase, restore } = useSubscription();
  const packages = useMemo(
    () => [...offering.availablePackages].sort(comparePackages),
    [offering.availablePackages],
  );
  const preferredPackage =
    packages.find((item) => item.packageType === PACKAGE_TYPE.ANNUAL) ??
    packages[0];
  const [selectedIdentifier, setSelectedIdentifier] = useState(
    preferredPackage?.identifier,
  );
  const [purchasePending, setPurchasePending] = useState(false);
  const [restorePending, setRestorePending] = useState(false);
  const selectedPackage =
    packages.find((item) => item.identifier === selectedIdentifier) ??
    preferredPackage;

  async function handlePurchase() {
    if (!selectedPackage || purchasePending) {
      return;
    }

    setPurchasePending(true);

    try {
      await purchase(selectedPackage);
    } catch {
      Alert.alert(
        'Purchase didn’t complete',
        'Nothing was charged. Check your connection and try again.',
      );
    } finally {
      setPurchasePending(false);
    }
  }

  async function handleRestore() {
    if (restorePending) {
      return;
    }

    setRestorePending(true);

    try {
      const restored = await restore();

      if (!restored) {
        Alert.alert(
          'No active subscription found',
          'Check that you are signed in with the store account used for your purchase.',
        );
      }
    } finally {
      setRestorePending(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        bounces={false}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brand}>REHEAR</Text>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
        </View>

        <View style={styles.signalStage}>
          <SignalWave />
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YOUR PRACTICE PLAN IS READY</Text>
          <Text style={styles.title}>Less guessing.{`\n`}A clearer next take.</Text>
          <Text style={styles.subtitle}>
            Keep the private feedback loop that turns every recording into one
            useful thing to try next.
          </Text>
        </View>

        <View style={styles.benefits}>
          {benefitCopy.map((benefit) => (
            <View key={benefit} style={styles.benefitRow}>
              <MaterialIcons name="check" size={18} color={theme.text} />
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <View style={styles.planSection}>
          <Text style={styles.sectionLabel}>CHOOSE YOUR RHYTHM</Text>
          <View style={styles.planList}>
            {packages.map((item) => (
              <PlanOption
                key={item.identifier}
                item={item}
                selected={item.identifier === selectedPackage?.identifier}
                onPress={() => setSelectedIdentifier(item.identifier)}
              />
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!selectedPackage || purchasePending}
          onPress={handlePurchase}
          style={({ pressed }) => [
            styles.continueButton,
            pressed && styles.continueButtonPressed,
            (!selectedPackage || purchasePending) && styles.buttonDisabled,
          ]}
        >
          {purchasePending ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <>
              <Text style={styles.continueText}>
                {getCallToAction(selectedPackage)}
              </Text>
              <MaterialIcons
                name="arrow-forward"
                size={20}
                color={theme.background}
              />
            </>
          )}
        </Pressable>

        <Text style={styles.renewalCopy}>{getRenewalCopy(selectedPackage)}</Text>

        <View style={styles.footerLinks}>
          <FooterLink label="Terms" url={TERMS_URL} />
          <View style={styles.footerDot} />
          <Pressable
            accessibilityRole="button"
            disabled={restorePending}
            onPress={handleRestore}
          >
            <Text style={styles.footerLink}>
              {restorePending ? 'Restoring…' : 'Restore purchases'}
            </Text>
          </Pressable>
          <View style={styles.footerDot} />
          <FooterLink label="Privacy" url={PRIVACY_URL} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanOption({
  item,
  selected,
  onPress,
}: {
  item: PurchasesPackage;
  selected: boolean;
  onPress: () => void;
}) {
  const annual = item.packageType === PACKAGE_TYPE.ANNUAL;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.plan,
        selected && styles.planSelected,
        pressed && styles.planPressed,
      ]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioCenter} /> : null}
      </View>
      <View style={styles.planCopy}>
        <View style={styles.planTitleRow}>
          <Text style={styles.planTitle}>{getPackageTitle(item)}</Text>
          {annual ? (
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeText}>BEST VALUE</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.planDetail}>{getPackageDetail(item)}</Text>
      </View>
      <View style={styles.planPrice}>
        <Text style={styles.price}>{item.product.priceString}</Text>
        <Text style={styles.pricePeriod}>{getPeriodLabel(item)}</Text>
      </View>
    </Pressable>
  );
}

function FooterLink({ label, url }: { label: string; url: string | null }) {
  async function openLink() {
    if (!url) {
      Alert.alert(`${label} link isn’t configured yet.`);
      return;
    }

    await Linking.openURL(url);
  }

  return (
    <Pressable accessibilityRole="link" onPress={openLink}>
      <Text style={styles.footerLink}>{label}</Text>
    </Pressable>
  );
}

function comparePackages(left: PurchasesPackage, right: PurchasesPackage) {
  const priority: Partial<Record<PACKAGE_TYPE, number>> = {
    [PACKAGE_TYPE.ANNUAL]: 0,
    [PACKAGE_TYPE.SIX_MONTH]: 1,
    [PACKAGE_TYPE.THREE_MONTH]: 2,
    [PACKAGE_TYPE.MONTHLY]: 3,
    [PACKAGE_TYPE.WEEKLY]: 4,
  };

  return (priority[left.packageType] ?? 10) - (priority[right.packageType] ?? 10);
}

function getPackageTitle(item: PurchasesPackage) {
  const titles: Partial<Record<PACKAGE_TYPE, string>> = {
    [PACKAGE_TYPE.ANNUAL]: 'Annual',
    [PACKAGE_TYPE.SIX_MONTH]: 'Six months',
    [PACKAGE_TYPE.THREE_MONTH]: 'Three months',
    [PACKAGE_TYPE.TWO_MONTH]: 'Two months',
    [PACKAGE_TYPE.MONTHLY]: 'Monthly',
    [PACKAGE_TYPE.WEEKLY]: 'Weekly',
    [PACKAGE_TYPE.LIFETIME]: 'Lifetime',
  };

  return titles[item.packageType] ?? item.product.title;
}

function getPackageDetail(item: PurchasesPackage) {
  if (
    item.packageType === PACKAGE_TYPE.ANNUAL &&
    item.product.pricePerMonthString
  ) {
    return `${item.product.pricePerMonthString} per month, billed annually`;
  }

  const trial = getTrialLabel(item);
  return trial ?? 'Full access to every Rehear feature';
}

function getPeriodLabel(item: PurchasesPackage) {
  const labels: Partial<Record<PACKAGE_TYPE, string>> = {
    [PACKAGE_TYPE.ANNUAL]: '/ year',
    [PACKAGE_TYPE.SIX_MONTH]: '/ 6 months',
    [PACKAGE_TYPE.THREE_MONTH]: '/ 3 months',
    [PACKAGE_TYPE.TWO_MONTH]: '/ 2 months',
    [PACKAGE_TYPE.MONTHLY]: '/ month',
    [PACKAGE_TYPE.WEEKLY]: '/ week',
  };

  return labels[item.packageType] ?? '';
}

function getTrialLabel(item: PurchasesPackage | undefined) {
  const intro = item?.product.introPrice;

  if (!intro || intro.price !== 0) {
    return null;
  }

  const unit = intro.periodUnit.toLowerCase();
  const plural = intro.periodNumberOfUnits === 1 ? unit : `${unit}s`;
  return `${intro.periodNumberOfUnits}-${plural} free trial`;
}

function getCallToAction(item: PurchasesPackage | undefined) {
  return getTrialLabel(item) ? 'Start my free trial' : 'Continue with Rehear';
}

function getRenewalCopy(item: PurchasesPackage | undefined) {
  const trial = getTrialLabel(item);
  const store = Platform.OS === 'ios' ? 'Apple ID' : 'Google Play account';
  const price = item
    ? `${item.product.priceString}${getPeriodLabel(item)}`
    : 'the displayed price';

  if (trial) {
    return `${trial}, then ${price}. Payment is charged to your ${store}. Cancel anytime in subscription settings.`;
  }

  return `${price}. Payment is charged to your ${store}. Renews automatically until canceled in subscription settings.`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brand: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  proBadge: {
    borderRadius: 99,
    backgroundColor: theme.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  proBadgeText: {
    color: theme.background,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  signalStage: {
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    overflow: 'hidden',
  },
  hero: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  title: {
    marginTop: 9,
    color: theme.text,
    fontSize: 38,
    lineHeight: 41,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  subtitle: {
    maxWidth: 470,
    marginTop: 13,
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  benefits: {
    gap: 10,
    marginTop: 24,
    paddingVertical: 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  benefitText: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  planSection: {
    marginTop: 28,
  },
  sectionLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  planList: {
    gap: 10,
    marginTop: 10,
  },
  plan: {
    minHeight: 79,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    backgroundColor: theme.surface,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  planSelected: {
    borderWidth: 2,
    borderColor: theme.text,
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  planPressed: {
    transform: [{ scale: 0.992 }],
  },
  radio: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.textSubtle,
    borderRadius: 11,
  },
  radioSelected: {
    borderColor: theme.text,
  },
  radioCenter: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: theme.text,
  },
  planCopy: {
    flex: 1,
    marginLeft: 12,
  },
  planTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 7,
  },
  planTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
  },
  valueBadge: {
    borderRadius: 6,
    backgroundColor: theme.pastelMint,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  valueBadgeText: {
    color: theme.text,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  planDetail: {
    marginTop: 4,
    color: theme.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  planPrice: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  price: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '900',
  },
  pricePeriod: {
    marginTop: 2,
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '700',
  },
  continueButton: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: theme.primary,
  },
  continueButtonPressed: {
    backgroundColor: theme.primaryPressed,
    transform: [{ scale: 0.992 }],
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  continueText: {
    color: theme.background,
    fontSize: 16,
    fontWeight: '900',
  },
  renewalCopy: {
    marginTop: 12,
    paddingHorizontal: 8,
    color: theme.textSubtle,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  footerLink: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.textSubtle,
  },
});

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { RehearTheme as theme } from "@/constants/theme";

const sections = [
  {
    title: "Practice feedback, not medical advice",
    body: "Rehear analyzes short recordings for practice cues. It does not diagnose vocal, breathing, or medical conditions. Stop if singing causes pain, dizziness, breathing trouble, or persistent hoarseness, and consider a qualified professional.",
  },
  {
    title: "Your recordings",
    body: "Saved practice recordings and progress stay on this device. Recordings sent for analysis are processed to return feedback and are not intentionally retained by Rehear after the request finishes. Deleting local data removes saved progress and app-owned recordings from this device.",
  },
  {
    title: "Coach messages",
    body: "Messages sent to the Coach are transmitted to Rehear's analysis service and its AI provider to generate a reply. Do not include sensitive personal, health, or identifying information.",
  },
  {
    title: "Subscriptions",
    body: "Purchases are processed by Apple or Google and managed through RevenueCat. Rehear does not receive your full payment-card details. Deleting local data does not cancel a subscription; manage or cancel it through the store subscription settings.",
  },
  {
    title: "Terms of use",
    body: "Use Rehear only for personal practice and at a comfortable volume. Feedback may be incomplete or inaccurate and should be treated as a practice suggestion, not professional instruction. You remain responsible for deciding whether an exercise is appropriate for you.",
  },
] as const;

export default function LegalScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Close"
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <MaterialIcons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy, terms & safety</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Effective June 21, 2026</Text>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  header: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  headerSpacer: { width: 44 },
  content: { padding: 24, paddingBottom: 56 },
  updated: { color: theme.textMuted, fontSize: 13, marginBottom: 24 },
  section: {
    borderBottomColor: theme.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: 24,
    marginBottom: 24,
  },
  title: { color: theme.text, fontSize: 18, fontWeight: "800", marginBottom: 8 },
  body: { color: theme.textMuted, fontSize: 15, lineHeight: 23 },
});

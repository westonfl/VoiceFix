import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { headerIconButtonStyles } from "@/constants/headerButtons";
import { VoiceFixTheme as theme } from "@/constants/theme";
import {
  CardGradientBackground,
  type CardGradientVariant,
} from "@/features/onboarding/components";
import { DEFAULT_EXERCISE_DURATION_SEC } from "@/features/training/recording";
import { getExerciseIllustration } from "@/features/training/exerciseIllustrations";
import {
  exerciseCategoryLabel,
  exerciseSoundCue,
} from "@/features/training/liveAnalysis";
import {
  fillTemplate,
  type mainAppText,
  type MainAppLanguage,
} from "@/features/prototype/localization";

type TrainingDetailScreenProps = {
  title: string;
  category: string;
  goal: string;
  instruction: string;
  exerciseId: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  gradient: CardGradientVariant;
  language: MainAppLanguage;
  text: (typeof mainAppText)["en"]["today"];
  durationSec?: number;
  onClose: () => void;
  onStart: () => void;
};

export function TrainingDetailScreen({
  title,
  category,
  goal,
  instruction,
  exerciseId,
  icon,
  gradient,
  language,
  text,
  durationSec = DEFAULT_EXERCISE_DURATION_SEC,
  onClose,
  onStart,
}: TrainingDetailScreenProps) {
  const soundCue = exerciseSoundCue(exerciseId);
  const categoryLabel = exerciseCategoryLabel(category, language);
  const illustration = getExerciseIllustration(exerciseId);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text.closeLabel}
            onPress={onClose}
            style={({ pressed }) => [
              headerIconButtonStyles.button,
              headerIconButtonStyles.buttonAlignStart,
              pressed && headerIconButtonStyles.buttonPressed,
            ]}
          >
            <MaterialIcons name="close" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <View style={styles.categoryRow}>
              <MaterialIcons name={icon} size={16} color={theme.textSubtle} />
              <Text style={styles.category}>{categoryLabel}</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.durationBadge}>
              <MaterialIcons name="timer" size={14} color={theme.textMuted} />
              <Text style={styles.durationText}>{durationSec}s</Text>
            </View>
          </View>
        </View>

        <View style={styles.previewCard}>
          {illustration ? (
            <Image
              accessibilityLabel={fillTemplate(text.exerciseIllustrationA11y, {
                title,
              })}
              contentFit="contain"
              source={illustration}
              style={styles.previewImage}
            />
          ) : (
            <>
              <View style={styles.previewLine} />
              <Text style={styles.previewCue}>{soundCue}</Text>
            </>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{text.goalLabel}</Text>
            <Text style={styles.infoBody}>{goal}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>{text.instructionsLabel}</Text>
            <Text style={styles.infoBody}>{instruction}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={onStart}
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed,
          ]}
        >
          <CardGradientBackground variant={gradient} />
          <Text style={styles.startLabel}>{text.startLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 12,
    paddingTop: 8,
  },
  header: {
    gap: 18,
  },
  headerCopy: {
    alignItems: "center",
    gap: 8,
  },
  categoryRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  category: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    color: theme.text,
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
  },
  durationBadge: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  durationText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  previewCard: {
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 18,
    justifyContent: "center",
    overflow: "hidden",
  },
  previewImage: {
    aspectRatio: 1,
    width: "100%",
  },
  previewLine: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 8,
    width: "72%",
  },
  previewCue: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#F3F0FF",
    borderRadius: 24,
    gap: 18,
    padding: 20,
  },
  infoBlock: {
    gap: 6,
  },
  infoLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  infoBody: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  footer: {
    paddingTop: 12,
  },
  startButton: {
    alignItems: "center",
    borderColor: "rgba(0, 0, 0, 0.28)",
    borderRadius: 999,
    borderWidth: 1.5,
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
  },
  startButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  startLabel: {
    color: theme.textMuted,
    fontSize: 18,
    fontWeight: "800",
    zIndex: 1,
  },
});

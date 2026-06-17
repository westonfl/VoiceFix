import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { CloseIconButton, headerIconButtonStyles } from "@/constants/headerButtons";
import { VoiceFixTheme as theme } from "@/constants/theme";
import {
  CardGradientBackground,
  type CardGradientVariant,
} from "@/features/onboarding/components";
import { DEFAULT_EXERCISE_DURATION_SEC } from "@/features/training/recording";
import {
  type ExerciseIllustrationSlide,
  getExerciseIllustrationSlides,
} from "@/features/training/exerciseIllustrations";
import {
  exerciseCategoryLabel,
  exerciseSoundCue,
} from "@/features/training/liveAnalysis";
import {
  fillTemplate,
  type mainAppText,
  type MainAppLanguage,
} from "@/features/prototype/localization";

type ExerciseGuide = {
  setup: string;
  steps: string[];
  listenFor: string;
  stopIf: string;
};

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
  const illustrationSlides = getExerciseIllustrationSlides(exerciseId);
  const guide = getExerciseGuide(exerciseId, soundCue);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
        <View style={styles.header}>
          <CloseIconButton
            accessibilityLabel={text.closeLabel}
            onPress={onClose}
            style={headerIconButtonStyles.buttonAlignStart}
          />
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
          {illustrationSlides.length > 0 ? (
            <ExerciseIllustrationCarousel
              accessibilityLabel={fillTemplate(text.exerciseIllustrationA11y, {
                title,
              })}
              exerciseId={exerciseId}
              slides={illustrationSlides}
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

        <View style={styles.guideSection}>
          <View style={styles.guideHeader}>
            <MaterialIcons name="checklist" size={20} color={theme.text} />
            <Text style={styles.guideTitle}>How to do it</Text>
          </View>
          <Text style={styles.guideSetup}>{guide.setup}</Text>

          <View style={styles.stepList}>
            {guide.steps.map((step, index) => (
              <View key={`${exerciseId}-step-${index}`} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.cueGrid}>
            <View style={styles.cueBlock}>
              <Text style={styles.cueLabel}>Listen for</Text>
              <Text style={styles.cueText}>{guide.listenFor}</Text>
            </View>
            <View style={styles.cueBlock}>
              <Text style={styles.cueLabel}>Stop if</Text>
              <Text style={styles.cueText}>{guide.stopIf}</Text>
            </View>
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

function ExerciseIllustrationCarousel({
  accessibilityLabel,
  exerciseId,
  slides,
}: {
  accessibilityLabel: string;
  exerciseId: string;
  slides: ExerciseIllustrationSlide[];
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [frameWidth, setFrameWidth] = useState(0);
  const hasMultipleSlides = slides.length > 1;
  const isHissCarousel = exerciseId === "sustained-hiss" && hasMultipleSlides;

  useEffect(() => {
    setActiveIndex(0);
  }, [exerciseId]);

  function handleScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void {
    if (frameWidth <= 0) {
      return;
    }

    const nextIndex = Math.round(
      event.nativeEvent.contentOffset.x / frameWidth,
    );
    setActiveIndex(Math.max(0, Math.min(slides.length - 1, nextIndex)));
  }

  function selectSlide(index: number): void {
    setActiveIndex(index);
    if (frameWidth > 0) {
      scrollRef.current?.scrollTo({ x: frameWidth * index, animated: true });
    }
  }

  return (
    <View
      style={[styles.carousel, isHissCarousel ? styles.hissCarousel : null]}
    >
      {isHissCarousel ? (
        <View style={styles.hissSlideTabs}>
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                key={`${exerciseId}-${slide.label || "tab"}-${index}`}
                onPress={() => selectSlide(index)}
                style={[
                  styles.hissSlideTab,
                  isActive ? styles.hissSlideTabActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.hissSlideTabText,
                    isActive ? styles.hissSlideTabTextActive : null,
                  ]}
                >
                  {slide.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <View
        onLayout={(event) => setFrameWidth(event.nativeEvent.layout.width)}
        style={[styles.carouselFrame, isHissCarousel ? styles.hissStage : null]}
      >
        {isHissCarousel ? (
          <>
            <View style={styles.hissBreathBandTop} />
            <View style={styles.hissBreathBandBottom} />
          </>
        ) : null}

        <ScrollView
          accessibilityLabel={accessibilityLabel}
          horizontal
          nestedScrollEnabled
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          pagingEnabled
          ref={scrollRef}
          scrollEnabled={hasMultipleSlides}
          showsHorizontalScrollIndicator={false}
          style={styles.carouselScroll}
        >
          {slides.map((slide, index) => (
            <View
              key={`${exerciseId}-${slide.label || "illustration"}-${index}`}
              style={[
                styles.carouselSlide,
                frameWidth > 0 ? { width: frameWidth } : null,
              ]}
            >
              <Image
                accessibilityLabel={
                  slide.label
                    ? `${accessibilityLabel}: ${slide.label}`
                    : accessibilityLabel
                }
                contentFit="contain"
                source={slide.source}
                style={[
                  styles.previewImage,
                  isHissCarousel ? styles.hissPreviewImage : null,
                ]}
              />
              {slide.label && !isHissCarousel ? (
                <View style={styles.slideBadge}>
                  <Text style={styles.slideBadgeText}>{slide.label}</Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      </View>

      {isHissCarousel ? (
        <View style={styles.hissCaptionRow}>
          <View style={styles.hissCaptionIcon}>
            <MaterialIcons name="air" size={16} color="#5A8178" />
          </View>
          <View style={styles.hissCaptionCopy}>
            <Text style={styles.hissCaptionLabel}>
              {slides[activeIndex]?.label}
            </Text>
            <Text style={styles.hissCaptionText}>Soft, narrow, even airflow</Text>
          </View>
        </View>
      ) : hasMultipleSlides ? (
        <View style={styles.slideDots}>
          {slides.map((slide, index) => (
            <View
              key={`${exerciseId}-${slide.label || "dot"}-${index}`}
              style={[
                styles.slideDot,
                index === activeIndex ? styles.slideDotActive : null,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function getExerciseGuide(exerciseId: string, soundCue: string): ExerciseGuide {
  const guides: Record<string, ExerciseGuide> = {
    "sustained-hiss": {
      setup: 'Make a quiet snake-like "sss." This is airflow practice, not singing.',
      steps: [
        "Sit or stand tall and let your shoulders stay loose.",
        "Take one quiet breath in through your nose or mouth.",
        'Start a soft "sss" and keep it narrow, like air leaking slowly from a tire.',
        "Stop before you run out of air. Do not squeeze the ending.",
      ],
      listenFor: "An even sound from start to finish.",
      stopIf: "Your throat, jaw, or shoulders start working hard.",
    },
    "gentle-hum": {
      setup: 'Use a tiny "mm" on any easy pitch. It should feel smaller than normal singing.',
      steps: [
        "Close your lips gently, without pressing them together.",
        "Take a comfortable breath.",
        'Let a quiet "mm" begin, as if you are agreeing softly.',
        "Hold it for a few seconds, then release while it still feels easy.",
      ],
      listenFor: "A steady hum that does not get louder by force.",
      stopIf: "The hum feels stuck in your throat.",
    },
    "soft-hum-start": {
      setup: "Practice the first moment of sound. The goal is a gentle start, not volume.",
      steps: [
        "Prepare a small, comfortable hum.",
        "Breathe in quietly.",
        "Let the hum appear after the breath instead of punching it on.",
        "Repeat the start a few times inside the recording if needed.",
      ],
      listenFor: "A clean beginning without a cough-like bump.",
      stopIf: "You feel yourself grabbing the first sound.",
    },
    "mmm-resonance": {
      setup: 'Make a light "mmm" and notice where it buzzes.',
      steps: [
        "Close your lips gently and keep your teeth slightly apart.",
        'Start a small "mmm" on an easy pitch.',
        "Let the buzz live near the lips or front of the face.",
        "Keep the sound easy instead of making it louder.",
      ],
      listenFor: "A small forward buzz, not a pressed throat sound.",
      stopIf: "You need extra volume to feel the buzz.",
    },
    "fah-vah-resonance": {
      setup: 'Speak-sing "fah" or "vah" softly, like a warm-up syllable.',
      steps: [
        'Choose "fah" if it feels easier, or "vah" if it rings more naturally.',
        "Take a quiet breath.",
        "Say the syllable gently on one comfortable pitch.",
        "Keep each repeat light and connected to the breath.",
      ],
      listenFor: "The same easy ring on each repeat.",
      stopIf: "The consonant makes you push or bite the sound.",
    },
    "hum-to-ah": {
      setup: 'Start with "mm," then open to "ah" without changing effort.',
      steps: [
        "Begin with a gentle hum on an easy pitch.",
        "Keep the hum small for one second.",
        'Open your mouth to "ah" while keeping the same airflow.',
        "End before the sound gets heavy.",
      ],
      listenFor: 'The "ah" should feel like it grows out of the hum.',
      stopIf: "Opening your mouth makes the sound jump or tighten.",
    },
    "short-tone": {
      setup: "Sing one comfortable note for only a few seconds.",
      steps: [
        "Pick an easy pitch in your speaking range.",
        "Breathe in without lifting your shoulders.",
        'Sing a small "ah" for 3-5 seconds.',
        "Release the note cleanly before you need to squeeze.",
      ],
      listenFor: "A tone that stays calm at the end.",
      stopIf: "You are holding the note just to prove you can.",
    },
  };

  return (
    guides[exerciseId] ?? {
      setup: `Use the cue "${soundCue}" softly and keep the task small.`,
      steps: [
        "Take one quiet breath.",
        "Make the sound at an easy volume.",
        "Keep the effort steady for the recording.",
        "Stop before anything feels strained.",
      ],
      listenFor: "A simple, repeatable sound.",
      stopIf: "The exercise creates pain, pressure, or throat tightness.",
    }
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
  carousel: {
    width: "100%",
  },
  carouselFrame: {
    width: "100%",
  },
  carouselScroll: {
    width: "100%",
  },
  carouselSlide: {
    alignItems: "center",
    justifyContent: "center",
  },
  slideBadge: {
    alignSelf: "center",
    backgroundColor: "rgba(255, 248, 245, 0.9)",
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 14,
    marginTop: -44,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  slideBadgeText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  slideDots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    paddingBottom: 14,
    paddingTop: 10,
  },
  slideDot: {
    backgroundColor: theme.border,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  slideDotActive: {
    backgroundColor: theme.textMuted,
    width: 18,
  },
  hissCarousel: {
    backgroundColor: "#FBF6EE",
    padding: 12,
  },
  hissSlideTabs: {
    backgroundColor: "#EFE8DF",
    borderColor: "#E1D5CA",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
    padding: 4,
  },
  hissSlideTab: {
    alignItems: "center",
    borderRadius: 999,
    flex: 1,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  hissSlideTabActive: {
    backgroundColor: "#FFFDF8",
    shadowColor: "#3B2D25",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  hissSlideTabText: {
    color: "#81766F",
    fontSize: 12,
    fontWeight: "800",
  },
  hissSlideTabTextActive: {
    color: theme.text,
  },
  hissStage: {
    backgroundColor: "#FFFDF8",
    borderColor: "#E7DCD1",
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 274,
    overflow: "hidden",
    position: "relative",
  },
  hissBreathBandTop: {
    backgroundColor: "rgba(122, 159, 151, 0.12)",
    borderRadius: 999,
    height: 86,
    position: "absolute",
    right: -34,
    top: 36,
    transform: [{ rotate: "-8deg" }],
    width: "58%",
  },
  hissBreathBandBottom: {
    backgroundColor: "rgba(157, 149, 196, 0.12)",
    borderRadius: 999,
    bottom: 20,
    height: 54,
    left: 30,
    position: "absolute",
    transform: [{ rotate: "3deg" }],
    width: "44%",
  },
  hissPreviewImage: {
    aspectRatio: 1.08,
    marginVertical: 8,
    width: "94%",
  },
  hissCaptionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 12,
  },
  hissCaptionIcon: {
    alignItems: "center",
    backgroundColor: "#E6F0EB",
    borderRadius: 999,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  hissCaptionCopy: {
    flex: 1,
    gap: 2,
  },
  hissCaptionLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
  },
  hissCaptionText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
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
  guideSection: {
    gap: 14,
    paddingHorizontal: 2,
  },
  guideHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  guideTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "800",
  },
  guideSetup: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 23,
  },
  stepList: {
    gap: 10,
  },
  stepRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    alignItems: "center",
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 26,
    justifyContent: "center",
    marginTop: 1,
    width: 26,
  },
  stepNumberText: {
    color: theme.background,
    fontSize: 13,
    fontWeight: "800",
  },
  stepText: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  cueGrid: {
    gap: 10,
  },
  cueBlock: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
    padding: 14,
  },
  cueLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  cueText: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
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

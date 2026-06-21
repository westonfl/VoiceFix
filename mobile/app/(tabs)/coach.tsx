import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

import { RehearTheme as theme } from "@/constants/theme";
import {
  CoachChatError,
  streamCoach,
  type CoachChatMessage,
} from "@/features/prototype/coachChat";
import { mainAppText } from "@/features/prototype/localization";
import { usePrototype } from "@/features/prototype/state";

const STARTER_PROMPTS = [
  "How do I keep my hiss steady?",
  "What should I do if my throat feels tight?",
  "Explain today's exercise in simpler words.",
];
const IOS_NATIVE_TAB_CLEARANCE = 82;

export default function CoachScreen() {
  const { currentWeek, state } = usePrototype();
  const text = mainAppText[state.language];
  const [messages, setMessages] = useState<CoachChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hasStreamStarted, setHasStreamStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<ScrollView>(null);
  const currentSession = useMemo(
    () =>
      currentWeek.dailySessions.find(
        (session) => session.day === state.currentDayNumber,
      ),
    [currentWeek.dailySessions, state.currentDayNumber],
  );
  const currentExerciseTitle =
    currentSession?.drill ?? currentWeek.exercises[0]?.title;

  async function sendMessages(nextMessages: CoachChatMessage[]) {
    setIsSending(true);
    setHasStreamStarted(false);
    setError(null);

    try {
      let assistantContent = "";
      await streamCoach(
        {
          language: state.language,
          messages: nextMessages.slice(-12),
          context: {
            currentWeekNumber: state.currentWeekNumber,
            currentDayNumber: state.currentDayNumber,
            currentExerciseTitle,
          },
        },
        (delta) => {
          assistantContent += delta;
          setHasStreamStarted(true);
          setMessages([
            ...nextMessages,
            { role: "assistant", content: assistantContent },
          ]);
        },
      );
    } catch (sendError) {
      setMessages(nextMessages);
      setError(getCoachErrorMessage(sendError));
    } finally {
      setIsSending(false);
      setHasStreamStarted(false);
    }
  }

  function submitDraft(content = draft) {
    const trimmed = content.trim();
    if (!trimmed || isSending) {
      return;
    }

    const nextMessages: CoachChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setDraft("");
    setMessages(nextMessages);
    sendMessages(nextMessages);
  }

  function retryLastAsk() {
    if (messages.length === 0 || isSending) {
      return;
    }

    sendMessages(messages);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <View style={styles.kickerRow}>
            <MaterialIcons name="forum" size={16} color={theme.textSubtle} />
            <Text style={styles.kicker}>REHEAR COACH</Text>
          </View>
          <Text style={styles.title}>{text.tabs.coach}</Text>
          <Text style={styles.body}>
            {"Ask about today's drill, practice cues, or how to keep the work easy and safe."}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            messagesRef.current?.scrollToEnd({ animated: false })
          }
          ref={messagesRef}
          showsVerticalScrollIndicator={false}
          style={styles.messages}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialIcons name="record-voice-over" size={24} color={theme.text} />
              </View>
              <Text style={styles.emptyTitle}>Start with one practical question.</Text>
              <Text style={styles.emptyBody}>
                Coach answers stay focused on Rehear practice and will keep
                safety boundaries around pain or medical concerns.
              </Text>
              <View style={styles.promptList}>
                {STARTER_PROMPTS.map((prompt) => (
                  <Pressable
                    accessibilityRole="button"
                    key={prompt}
                    onPress={() => submitDraft(prompt)}
                    style={({ pressed }) => [
                      styles.promptChip,
                      pressed && styles.promptChipPressed,
                    ]}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                    <MaterialIcons name="north-east" size={15} color={theme.textMuted} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={`${message.role}-${index}-${message.content.slice(0, 12)}`}
                message={message}
              />
            ))
          )}

          {isSending && !hasStreamStarted ? (
            <View style={styles.thinkingRow}>
              <View style={styles.thinkingDot} />
              <Text style={styles.thinkingText}>Coach is thinking...</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={18} color={theme.caution} />
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={retryLastAsk}
                style={({ pressed }) => [
                  styles.retryButton,
                  pressed && styles.retryButtonPressed,
                ]}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            Platform.OS === "ios" ? styles.composerAboveNativeTabs : null,
          ]}
        >
          <TextInput
            accessibilityLabel="Ask Rehear Coach"
            editable={!isSending}
            multiline
            onChangeText={setDraft}
            placeholder="Ask about your practice..."
            placeholderTextColor={theme.textSubtle}
            returnKeyType="send"
            style={styles.input}
            value={draft}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send question"
            disabled={!draft.trim() || isSending}
            onPress={() => submitDraft()}
            style={({ pressed }) => [
              styles.sendButton,
              (!draft.trim() || isSending) && styles.sendButtonDisabled,
              pressed && styles.sendButtonPressed,
            ]}
          >
            <MaterialIcons name="send" size={20} color={theme.background} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function getCoachErrorMessage(error: unknown) {
  if (isCoachChatError(error) && error.status === 503) {
    return "Coach could not get an answer right now. Please wait a moment, then retry.";
  }

  if (isCoachChatError(error) && error.status === undefined) {
    return "Could not reach the Rehear server. Start the backend, then retry.";
  }

  return "Coach hit an unexpected error. Please try again.";
}

function isCoachChatError(error: unknown): error is CoachChatError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "CoachChatError"
  );
}

function MessageBubble({ message }: { message: CoachChatMessage }) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowCoach,
      ]}
    >
      {!isUser ? (
        <View style={styles.coachMark}>
          <MaterialIcons name="auto-awesome" size={15} color={theme.text} />
        </View>
      ) : null}
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.coachBubble,
        ]}
      >
        {isUser ? (
          <Text style={[styles.messageText, styles.userMessageText]}>
            {message.content}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    gap: 8,
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  kickerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  kicker: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  title: {
    color: theme.text,
    fontSize: 38,
    fontWeight: "900",
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 23,
    maxWidth: 330,
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    gap: 14,
    paddingBottom: 18,
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  emptyState: {
    gap: 16,
    paddingTop: 18,
  },
  emptyIcon: {
    alignItems: "center",
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  emptyBody: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  promptList: {
    gap: 10,
    paddingTop: 4,
  },
  promptChip: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  promptChipPressed: {
    backgroundColor: theme.surfacePressed,
    transform: [{ scale: 0.99 }],
  },
  promptText: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: "row",
    gap: 8,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowCoach: {
    justifyContent: "flex-start",
  },
  coachMark: {
    alignItems: "center",
    backgroundColor: theme.primarySoft,
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    marginTop: 4,
    width: 28,
  },
  messageBubble: {
    borderRadius: 22,
    maxWidth: "88%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: theme.text,
    borderTopRightRadius: 8,
    maxWidth: "82%",
  },
  coachBubble: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderTopLeftRadius: 8,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },
  userMessageText: {
    color: theme.background,
  },
  thinkingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    paddingLeft: 36,
  },
  thinkingDot: {
    backgroundColor: theme.textSubtle,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  thinkingText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  errorBox: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  errorText: {
    color: theme.textMuted,
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
  },
  retryButton: {
    backgroundColor: theme.text,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  retryButtonPressed: {
    opacity: 0.86,
  },
  retryText: {
    color: theme.background,
    fontSize: 12,
    fontWeight: "900",
  },
  composer: {
    alignItems: "flex-end",
    borderColor: theme.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingBottom: Platform.OS === "ios" ? 8 : 14,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  composerAboveNativeTabs: {
    marginBottom: IOS_NATIVE_TAB_CLEARANCE,
  },
  input: {
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 22,
    borderWidth: 1,
    color: theme.text,
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    maxHeight: 116,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  paragraph: {
    marginBottom: 10,
    marginTop: 0,
  },
  strong: {
    fontWeight: "800",
  },
  heading1: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 25,
    marginBottom: 8,
    marginTop: 4,
  },
  heading2: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23,
    marginBottom: 7,
    marginTop: 4,
  },
  heading3: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 6,
    marginTop: 2,
  },
  bullet_list: {
    marginBottom: 8,
    marginTop: 0,
  },
  ordered_list: {
    marginBottom: 8,
    marginTop: 0,
  },
  list_item: {
    marginBottom: 5,
  },
  bullet_list_icon: {
    color: theme.textMuted,
    marginRight: 7,
  },
  ordered_list_icon: {
    color: theme.textMuted,
    fontWeight: "800",
    marginRight: 7,
  },
  code_inline: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.border,
    borderRadius: 4,
    borderWidth: 1,
    color: theme.text,
    fontSize: 13,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  fence: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.border,
    borderRadius: 6,
    borderWidth: 1,
    color: theme.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    padding: 10,
  },
  code_block: {
    backgroundColor: theme.primarySoft,
    borderColor: theme.border,
    borderRadius: 6,
    borderWidth: 1,
    color: theme.text,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
    padding: 10,
  },
  blockquote: {
    backgroundColor: theme.primarySoft,
    borderLeftColor: theme.textMuted,
    borderLeftWidth: 3,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  link: {
    color: theme.primary,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

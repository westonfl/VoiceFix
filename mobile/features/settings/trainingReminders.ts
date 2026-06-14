import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { MainAppLanguage } from "@/features/prototype/localization";

export const TRAINING_REMINDER_ID = "daily-training-reminder";
const ANDROID_CHANNEL_ID = "training-reminders";

export function parseTrainingTimeParts(trainingTime: string) {
  if (trainingTime === "Choose later") {
    return null;
  }

  const match = trainingTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  let hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }
  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

export function buildReminderContent(
  notificationTone: string,
  language: MainAppLanguage,
) {
  const gentle = notificationTone === "Gentle";

  if (language === "ko") {
    return gentle
      ? {
          title: "부드러운 알림",
          body: "준비되면 오늘의 짧은 발성 연습을 시작하세요.",
        }
      : {
          title: "연습 시간입니다",
          body: "오늘의 발성 세션이 기다립니다. 한 번 녹음하고, 하나만 고치세요.",
        };
  }

  return gentle
    ? {
        title: "Gentle nudge",
        body: "When you're ready, your short voice session is waiting.",
      }
    : {
        title: "Practice time",
        body: "Your daily voice session is ready. One take, one fix, done.",
      };
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Training reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function cancelTrainingReminder() {
  await Notifications.cancelScheduledNotificationAsync(TRAINING_REMINDER_ID);
}

export async function syncTrainingReminder(options: {
  enabled: boolean;
  trainingTime: string;
  notificationTone: string;
  language: MainAppLanguage;
}) {
  await cancelTrainingReminder();

  if (!options.enabled) {
    return;
  }

  const timeParts = parseTrainingTimeParts(options.trainingTime);
  if (!timeParts) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  await ensureAndroidChannel();

  const content = buildReminderContent(
    options.notificationTone,
    options.language,
  );

  await Notifications.scheduleNotificationAsync({
    identifier: TRAINING_REMINDER_ID,
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: timeParts.hour,
      minute: timeParts.minute,
      ...(Platform.OS === "android"
        ? { channelId: ANDROID_CHANNEL_ID }
        : {}),
    },
  });
}

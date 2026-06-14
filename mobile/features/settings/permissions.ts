import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as Notifications from "expo-notifications";
import type { PermissionStatus } from "expo-modules-core";

export async function readMicPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await getRecordingPermissionsAsync();
  return status;
}

export async function readNotificationPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestMicPermission(): Promise<PermissionStatus> {
  const { status } = await requestRecordingPermissionsAsync();
  return status;
}

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return status;
}

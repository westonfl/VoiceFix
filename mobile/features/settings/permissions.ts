import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import * as Notifications from "expo-notifications";
import type { PermissionResponse, PermissionStatus } from "expo-modules-core";

export async function readMicPermissionStatus(): Promise<PermissionStatus> {
  const response = await getRecordingPermissionsAsync();
  return response.status;
}

export async function readNotificationPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
}

export async function requestMicPermission(): Promise<PermissionResponse> {
  return requestRecordingPermissionsAsync();
}

export async function requestNotificationPermission(): Promise<PermissionResponse> {
  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
}

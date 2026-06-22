const DEFAULT_ANALYSIS_SERVER_URL = 'http://127.0.0.1:8000';

export const REVENUECAT_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || 'pro';

export function getApiHeaders(): Record<string, string> {
  const apiKey = process.env.EXPO_PUBLIC_REHEAR_API_KEY?.trim();
  return apiKey ? { 'X-Rehear-API-Key': apiKey } : {};
}

export const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL?.trim() || null;
export const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_URL?.trim() || null;

export function getAnalysisServerUrl() {
  const configured = process.env.EXPO_PUBLIC_ANALYSIS_SERVER_URL ?? DEFAULT_ANALYSIS_SERVER_URL;
  return configured.replace(/\/$/, '');
}

export function getRevenueCatApiKey(platform: string) {
  if (platform === 'ios') {
    return process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY?.trim() || null;
  }

  if (platform === 'android') {
    return process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY?.trim() || null;
  }

  return null;
}

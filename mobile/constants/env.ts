const DEFAULT_ANALYSIS_SERVER_URL = 'http://127.0.0.1:8000';

export function getAnalysisServerUrl() {
  const configured = process.env.EXPO_PUBLIC_ANALYSIS_SERVER_URL ?? DEFAULT_ANALYSIS_SERVER_URL;
  return configured.replace(/\/$/, '');
}

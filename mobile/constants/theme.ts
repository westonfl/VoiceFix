/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#17C9D2';
const tintColorDark = '#32E6E2';

export const Colors = {
  light: {
    text: '#F1F7FA',
    background: '#0B1018',
    tint: tintColorLight,
    icon: '#788897',
    tabIconDefault: '#788897',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F1F7FA',
    background: '#070A10',
    tint: tintColorDark,
    icon: '#788897',
    tabIconDefault: '#788897',
    tabIconSelected: tintColorDark,
  },
};

export const VoiceFixTheme = {
  background: '#0B1018',
  backgroundDeep: '#070A10',
  surface: '#151E2B',
  surfaceRaised: '#101722',
  surfacePressed: '#203044',
  text: '#F1F7FA',
  textMuted: '#B8C7D3',
  textSubtle: '#788897',
  border: '#203044',
  primary: '#17C9D2',
  primaryBright: '#32E6E2',
  primaryPressed: '#0C7F8B',
  primarySoft: '#073F49',
  journal: '#9B7CFF',
  energy: '#F05ACB',
  caution: '#FF7A70',
  warning: '#F4B85E',
  success: '#64D99A',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

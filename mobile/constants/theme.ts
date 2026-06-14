/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColor = "#000000";

export const Colors = {
  light: {
    text: "#000000",
    background: "#FFFFFF",
    tint: tintColor,
    icon: "#000000",
    tabIconDefault: "#000000",
    tabIconSelected: tintColor,
  },
  dark: {
    text: "#000000",
    background: "#FFFFFF",
    tint: tintColor,
    icon: "#000000",
    tabIconDefault: "#000000",
    tabIconSelected: tintColor,
  },
};

export const VoiceFixTheme = {
  background: "#FFFFFF",
  backgroundDeep: "#FFFFFF",
  surface: "#F5F5FA",
  surfaceRaised: "#F0F0F6",
  surfacePressed: "#E2E2EA",
  text: "#000000",
  textMuted: "#45454D",
  textSubtle: "#A4A4AF",
  border: "#E2E2EA",
  primary: "#000000",
  primaryBright: "#000000",
  primaryPressed: "#222222",
  primarySoft: "#F2F2F8",
  journal: "#9B9BA8",
  energy: "#111111",
  caution: "#000000",
  warning: "#A4A4AF",
  success: "#000000",
  pastelMint: "#D9FFE1",
  pastelSky: "#DDF2FF",
  pastelLilac: "#EEE2FF",
  pastelPink: "#FFE3F0",
  pastelLemon: "#FFFFD6",
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

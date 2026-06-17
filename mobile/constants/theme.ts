/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColor = "#17110F";

export const Colors = {
  light: {
    text: "#17110F",
    background: "#FFF8F5",
    tint: tintColor,
    icon: "#17110F",
    tabIconDefault: "#17110F",
    tabIconSelected: tintColor,
  },
  dark: {
    text: "#17110F",
    background: "#FFF8F5",
    tint: tintColor,
    icon: "#17110F",
    tabIconDefault: "#17110F",
    tabIconSelected: tintColor,
  },
};

export const VoiceFixTheme = {
  background: "#FFF8F5",
  backgroundDeep: "#FFF6F0",
  surface: "#F8F1EC",
  surfaceRaised: "#F2EAE6",
  surfacePressed: "#E7DDD8",
  text: "#17110F",
  textMuted: "#4F4642",
  textSubtle: "#9F9692",
  border: "#E5DAD5",
  primary: "#17110F",
  primaryBright: "#17110F",
  primaryPressed: "#2C211D",
  primarySoft: "#F3E9E3",
  journal: "#91878A",
  energy: "#1E1714",
  caution: "#17110F",
  warning: "#9F9692",
  success: "#17110F",
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

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';

export const headerIconButtonStyles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  buttonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  buttonAlignStart: {
    alignSelf: 'flex-start',
  },
  sheetCloseButton: {
    left: 22,
    position: 'absolute',
    top: 22,
    zIndex: 1,
  },
});

type CloseIconButtonProps = {
  accessibilityLabel?: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function CloseIconButton({
  accessibilityLabel = 'Close',
  onPress,
  style,
}: CloseIconButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        headerIconButtonStyles.button,
        pressed && headerIconButtonStyles.buttonPressed,
        style,
      ]}
    >
      <MaterialIcons name="close" size={22} color={theme.text} />
    </Pressable>
  );
}

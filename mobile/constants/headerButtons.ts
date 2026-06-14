import { StyleSheet } from 'react-native';

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
});

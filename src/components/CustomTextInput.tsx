import React, { FC, ReactNode, useEffect, useRef } from 'react';
import { StyleProp, StyleSheet, Text, TextInput, TextStyle, View } from 'react-native';
import { useThemedStyles } from '../services/theme.service';
import { Theme } from '../styles/theme/theme-types';
import { getPadding } from '../styles/utils';

interface CustomTextInputProps {
  // Needed to blur the input when the modal is closed
  isVisible: boolean;
  value: string;
  onChangeText: (text: string) => void;
  style?: StyleProp<TextStyle>;
  multiline?: boolean;
  numberOfLines?: number;
  placeholder?: string;
  iconLeft?: ReactNode;
}

export const CustomTextInput: FC<CustomTextInputProps> = ({
  isVisible,
  value,
  onChangeText,
  style,
  multiline,
  numberOfLines,
  placeholder,
  iconLeft,
}) => {
  const inputRef = useRef<TextInput>(null);
  const showPlaceholder = !value || (value === '' && !!placeholder);
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    if (!isVisible && inputRef.current) {
      inputRef.current?.blur();
    }
  }, [isVisible]);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={[
          styles.input,
          iconLeft ? styles.inputWithIcon : undefined,
          multiline ? { textAlignVertical: 'center' } : undefined,
          style,
        ]}
        onChangeText={onChangeText}
        value={value}
        multiline={multiline}
        numberOfLines={numberOfLines}
      />
      {iconLeft && <View style={styles.iconContainer}>{iconLeft}</View>}
      {showPlaceholder && (
        <Text style={[styles.placeholder, iconLeft ? styles.placeholderWithIcon : undefined, style]}>
          {placeholder}
        </Text>
      )}
    </View>
  );
};

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      position: 'relative',
    },
    input: {
      width: '100%',
      height: '100%',
      ...getPadding(7, 12, 9),
      borderWidth: 1,
      borderRadius: 8,
      borderColor: theme.surfaceBorder,
      backgroundColor: theme.backgroundDark,
      color: theme.textPrimary,
    },
    inputWithIcon: {
      paddingLeft: 32,
    },
    iconContainer: {
      position: 'absolute',
      top: 9,
      left: 11,
      width: 16,
      height: 16,
    },
    placeholder: {
      position: 'absolute',
      top: 8,
      left: 15,
      width: '100%',
      height: 20,
      color: theme.textSecondary,
      pointerEvents: 'none',
    },
    placeholderWithIcon: {
      left: 35,
    },
  });
}

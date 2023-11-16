import { useAppState } from '@react-native-community/hooks';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { typo } from '../styles/typo';

export interface ToggleProps {
  state: boolean;
  setState: (newState: boolean) => void;
  label: string;
}

export const Toggle: React.FC<ToggleProps> = ({ state, setState, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setState(!state)}
        style={[styles.toggleContainer, { backgroundColor: state ? colors.blue : 'rgba(0,0,0,0.3)' }]}>
        <View style={[styles.knob, { left: state ? 12 : 1 }]} />
        <View style={styles.borderHighlight} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typo.body,
    color: colors.textPrimary,
  },
  toggleContainer: {
    width: 26,
    height: 15,
    borderRadius: 8,
  },
  borderHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 26,
    height: 15,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  knob: {
    top: 1,
    width: 13,
    height: 13,
    backgroundColor: '#fff',
    borderRadius: 999,
  },
});

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { DayLabel, DayPickerButton } from './DayPickerButton';
import { PrimaryButton } from './PrimaryButton';
import { getPadding } from '../styles/utils';

const days: {
  id: number;
  abbreviation: DayLabel;
  time?: string;
}[] = [
  { id: 0, abbreviation: 'M', time: '8:15' },
  { id: 1, abbreviation: 'T', time: '7:45' },
  { id: 2, abbreviation: 'W', time: '8:00' },
  { id: 3, abbreviation: 'T', time: '7:10' },
  { id: 4, abbreviation: 'F', time: undefined },
  { id: 5, abbreviation: 'S', time: undefined },
  { id: 6, abbreviation: 'S', time: undefined },
];

export function DayPicker(): JSX.Element {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <>
      <View style={styles.container}>
        {days.map(day => (
          <DayPickerButton
            key={day.id}
            day={day.abbreviation}
            time={day.time}
            isSelected={selectedDay === day.id}
            onPress={() => setSelectedDay(day.id)}
          />
        ))}
      </View>
      <PrimaryButton onPress={() => setSelectedDay(null)} label='Clear selection' />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#545250',
    ...getPadding(8, 16),
  },
});
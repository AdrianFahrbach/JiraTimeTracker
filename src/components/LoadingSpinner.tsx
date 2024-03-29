import { useAtomValue } from 'jotai';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { themeAtom } from '../atoms';
import { LOADING_SPINNER_SPEED } from '../const';

interface LoadingSpinnerProps {
  style?: ViewStyle;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ style }) => {
  const theme = useAtomValue(themeAtom);
  const [activeElement, setActiveElement] = useState(0);

  const { image, opacityInactive } = useMemo(() => {
    if (theme.type === 'light') {
      return { image: require('../assets/loading-spinner-element-light.png'), opacityInactive: 0.15 };
    } else {
      return { image: require('../assets/loading-spinner-element-dark.png'), opacityInactive: 0.12 };
    }
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveElement(prev => (prev + 1) % 4);
    }, LOADING_SPINNER_SPEED);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[styles.container, style]}>
      <Animated.Image
        width={14}
        height={14}
        style={[styles.topRight, { opacity: activeElement === 0 ? 1 : opacityInactive }]}
        source={image}
      />
      <Animated.Image
        width={14}
        height={14}
        style={[styles.bottomRight, { opacity: activeElement === 1 ? 1 : opacityInactive }]}
        source={image}
      />
      <Animated.Image
        width={14}
        height={14}
        style={[styles.bottomLeft, { opacity: activeElement === 2 ? 1 : opacityInactive }]}
        source={image}
      />
      <Animated.Image
        width={14}
        height={14}
        style={[styles.topLeft, { opacity: activeElement === 3 ? 1 : opacityInactive }]}
        source={image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 30,
    height: 30,
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    transform: [{ rotate: '90deg' }],
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    transform: [{ rotate: '180deg' }],
  },
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: [{ rotate: '270deg' }],
  },
});

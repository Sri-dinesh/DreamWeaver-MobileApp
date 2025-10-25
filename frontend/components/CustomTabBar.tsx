import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, palette, radii, shadows, spacing, typography } from '@/theme';

interface TabItem {
  name: string;
  icon: string;
  label: string;
  color: string;
}

interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TABS: TabItem[] = [
  { name: 'index', icon: 'home', label: 'Home', color: palette.primary },
  { name: 'journal', icon: 'journal', label: 'Journal', color: '#F072C5' },
  { name: 'analytics', icon: 'analytics-outline', label: 'Analytics', color: '#F5B25A' },
  { name: 'community', icon: 'people', label: 'Community', color: '#5AC4F3' },
];

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: CustomTabBarProps) {
  const animatedValues = React.useRef(
    TABS.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel(
      animatedValues.map((anim, index) =>
        Animated.timing(anim, {
          toValue: state.index === index ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [state.index]);

  return (
    <LinearGradient
      colors={gradients.tabBar}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.tabBar}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const animValue = animatedValues[index];

          const scaleAnim = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.1],
          });

          const opacityAnim = animValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[index].key,
              preventDefault: false,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(state.routes[index].name, {
                merge: true,
              });
            }
          };

          return (
            <TouchableOpacity
              key={tab.name}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                {isFocused ? (
                  <LinearGradient
                    colors={[`${tab.color}33`, `${tab.color}18`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activePill}
                  >
                    <Ionicons
                      name={tab.icon as any}
                      size={20}
                      color={tab.color}
                    />
                    <Animated.Text
                      style={[
                        styles.tabLabel,
                        {
                          color: tab.color,
                          opacity: opacityAnim,
                          marginLeft: opacityAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 2],
                          }),
                        },
                      ]}
                    >
                      {tab.label}
                    </Animated.Text>
                  </LinearGradient>
                ) : (
                  <Ionicons
                    name={tab.icon as any}
                    size={24}
                    color={palette.textMuted}
                  />
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 0,
    ...shadows.subtle,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 50,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
  },
  indicatorContainer: {
    height: 3,
    width: '100%',
    marginTop: 8,
    position: 'relative',
  },
});

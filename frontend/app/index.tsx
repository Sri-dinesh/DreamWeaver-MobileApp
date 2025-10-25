import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { gradients, palette, radii, spacing, typography } from '@/theme';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 16,
        mass: 1,
        stiffness: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <LinearGradient
      colors={gradients.header}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoHalo}>
            <LinearGradient
              colors={gradients.cardAccent}
              style={styles.logoBackdrop}
            />
            <Image
              source={require('@/assets/images/dreamweaverLogo2.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.title}>DreamWeaver</Text>
          <Text style={styles.subtitle}>Improve Mental Wellbeing</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/auth/login')}
          >
            <LinearGradient
              colors={gradients.buttonPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButtonInner}
            >
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Unlock the mysteries of your dreams</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.md,
  },
  logoHalo: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: spacing.sm,
  },
  logoBackdrop: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 110,
    opacity: 0.7,
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  title: {
    ...typography.display,
    fontSize: 34,
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 8 },
    textShadowRadius: 16,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.78)',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  primaryButtonInner: {
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...typography.subheading,
    color: 'white',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  secondaryButtonText: {
    ...typography.subheading,
    color: 'white',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xxxl,
    color: 'rgba(255, 255, 255, 0.7)',
    ...typography.bodySecondary,
    textAlign: 'center',
  },
});

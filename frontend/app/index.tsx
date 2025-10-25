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
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 14,
        mass: 1,
        stiffness: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={['#e8e8f0', '#f5f3fb', '#e8e8f0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.cardWrapper}>
          <LinearGradient
            colors={['#ffffff', '#faf8ff']}
            style={styles.card}
          >
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('@/assets/images/MainLogoNoBG.png')}
                  style={styles.logo}
                />
              </View>
            </View>

            {/* Text Section */}
            <View style={styles.textSection}>
              <Text style={styles.mainTitle}>DreamWeaver</Text>
              <Text style={styles.tagline}>Improve Mental Wellbeing</Text>
              <Text style={styles.description}>
                Unlock the mysteries of your dreams
              </Text>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonSection}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/auth/login')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#5c6eb8', '#3d4a8f']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/register')}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity> */}
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  content: {
    width: '100%',
    maxWidth: 360,
  },
  cardWrapper: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: 'rgba(93, 110, 184, 0.2)',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
  },
  card: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  logoSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  textSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a2e',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5c6eb8',
    marginTop: spacing.xs,
  },
  description: {
    fontSize: 13,
    fontWeight: '400',
    color: '#8a92bd',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  buttonSection: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: 'rgba(93, 110, 184, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  primaryButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#d8d5e8',
    borderRadius: 16,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5c6eb8',
    letterSpacing: 0.3,
  },
});
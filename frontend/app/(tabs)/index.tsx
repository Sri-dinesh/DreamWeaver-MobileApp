import { useAuth } from '@/context/AuthContext';
import { fetchAllStats, Stats } from '@/services/statsService';
import {
  GradientStop,
  gradients,
  palette,
  radii,
  shadows,
  spacing,
  typography,
} from '@/theme';
import { getItem } from '@/utils/secureStorage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface FeatureCard {
  title: string;
  description: string;
  icon: any;
  route: string;
  color: string;
  gradient: GradientStop;
}

const features: FeatureCard[] = [
  {
    title: 'Spirit Guide',
    description: 'Chat with your dream guide',
    icon: 'chatbubbles',
    route: '/spirit-guide',
    color: '#7457F8',
    gradient: ['#8E7BFF', '#B48CFF'] as const,
  },
  {
    title: 'AI Tools',
    description: 'Generate prompts & imagery',
    icon: 'sparkles',
    route: '/prompt-builder',
    color: '#F072C5',
    gradient: ['#F39CD6', '#FAD1EB'] as const,
  },
  {
    title: 'Dream Art',
    description: 'Create art from your dreams',
    icon: 'images',
    route: '/dream-art',
    color: '#5AC4F3',
    gradient: ['#5FD2F8', '#A1ECFF'] as const,
  },
  {
    title: 'Lucid Trainer',
    description: 'Lucid dreaming techniques',
    icon: 'flash',
    route: '/lucid-trainer',
    color: '#F5B25A',
    gradient: ['#F5C06D', '#FFE3A6'] as const,
  },
  {
    title: 'Sleep Planner',
    description: 'Plan your sleep schedule',
    icon: 'moon',
    route: '/sleep-planner',
    color: '#89ADF9',
    gradient: ['#A1C3FF', '#D6E4FF'] as const,
  },
  {
    title: 'Audio Library',
    description: 'Upload & manage audio files',
    icon: 'library',
    route: '/audio-library',
    color: '#6DD8B3',
    gradient: ['#8FE8C9', '#C4F5E4'] as const,
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('Hello');
  const [stats, setStats] = useState<Stats>({
    dreamCount: 0,
    lucidDreamCount: 0,
    avgSleep: '0h',
  });
  const [loading, setLoading] = useState(true);
  const entranceAnim = useRef(new Animated.Value(0)).current;

  // Helper to get token
  // const getToken = async () => {
  //   try {
  //     return localStorage.getItem('userToken');
  //   } catch (error) {
  //     console.error('Error getting token:', error);
  //     return null;
  //   }
  // };

  const getToken = async () => {
    try {
      // Use your storage utility instead of direct localStorage
      // return await storage.getItem('userToken');
      // Or if using the new secureStorage.ts:
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // Function to get appropriate greeting based on time of day
  const getGreeting = (hour: number): string => {
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 18) return 'Good Afternoon';
    if (hour >= 18 && hour < 22) return 'Good Evening';
    return 'Good Night';
  };

  // Effect for updating greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const currentHour = new Date().getHours();
      setGreeting(getGreeting(currentHour));
    };

    updateGreeting(); // Run once immediately
    const interval = setInterval(updateGreeting, 60 * 1000); // Update every minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Effect for loading stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const fetchedStats = await fetchAllStats();
        setStats(fetchedStats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      damping: 14,
      mass: 0.9,
      stiffness: 120,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.greetingSection}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.username || 'Dream Explorer'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.profileButtonContainer}>
              {user?.profile_picture_url && user.profile_picture_url.startsWith('http') ? (
                <Image
                  source={{ uri: user.profile_picture_url }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/images/default-profile.png')}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: entranceAnim,
              transform: [
                {
                  translateY: entranceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [28, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={gradients.cardPrimary}
              style={styles.statCard}
            >
              <View style={styles.statIconPill}>
                <Ionicons name="book-outline" size={22} color={palette.primary} />
              </View>
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.dreamCount}
              </Text>
              <Text style={styles.statLabel}>Dreams</Text>
            </LinearGradient>

            <LinearGradient
              colors={gradients.cardSecondary}
              style={styles.statCard}
            >
              <View style={styles.statIconPill}>
                <Ionicons name="flash-outline" size={22} color={palette.success} />
              </View>
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.lucidDreamCount}
              </Text>
              <Text style={styles.statLabel}>Lucid</Text>
            </LinearGradient>

            <LinearGradient
              colors={gradients.cardAccent}
              style={styles.statCard}
            >
              <View style={styles.statIconPill}>
                <Ionicons name="moon-outline" size={22} color={palette.info} />
              </View>
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.avgSleep}
              </Text>
              <Text style={styles.statLabel}>Sleep</Text>
            </LinearGradient>
          </View>

          <View style={styles.featuresSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore Features</Text>
            </View>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureCard}
                  onPress={() => router.push(feature.route as any)}
                >
                  <LinearGradient
                    colors={feature.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featureCardGradient}
                  >
                    <View style={styles.featureCardContent}>
                      <View style={styles.featureIconContainer}>
                        <Ionicons
                          name={feature.icon as any}
                          size={24}
                          color="white"
                        />
                      </View>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl + 12,
    paddingBottom: spacing.xxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.92)',
    marginBottom: spacing.xs,
  },
  userName: {
    ...typography.heading,
    fontSize: 30,
    color: '#FFFFFF',
  },
  profileButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
  },
  profileButtonContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  profileImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.soft,
  },
  statIconPill: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  statLabel: {
    ...typography.caption,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  featuresSection: {
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading,
    color: palette.textPrimary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: radii.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  featureCardGradient: {
    padding: spacing.lg,
    minHeight: 164,
    justifyContent: 'space-between',
    borderRadius: radii.lg,
  },
  featureCardContent: {
    flex: 1,
  },
  featureIconContainer: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    ...typography.subheading,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  featureDescription: {
    ...typography.bodySecondary,
    color: 'rgba(255, 255, 255, 0.85)',
  },
});

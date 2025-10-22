import { useAuth } from '@/context/AuthContext';
import { fetchAllStats, Stats } from '@/services/statsService';
import { getItem } from '@/utils/secureStorage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
  gradient: string[];
}

const features: FeatureCard[] = [
  // {
  //   title: 'Dream Journal',
  //   description: 'Record and analyze your dreams',
  //   icon: 'book',
  //   route: '/journal',
  //   color: '#7C3AED',
  //   gradient: ['#7C3AED', '#A855F7'],
  // },
  {
    title: 'Spirit Guide',
    description: 'Chat with your dream guide',
    icon: 'chatbubbles',
    route: '/spirit-guide',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#A855F7'],
  },
  {
    title: 'AI Tools',
    description: 'Generate prompts & imagery',
    icon: 'sparkles',
    route: '/prompt-builder',
    color: '#EC4899',
    gradient: ['#EC4899', '#F472B6'],
  },
  {
    title: 'Dream Art',
    description: 'Create art from your dreams',
    icon: 'images',
    route: '/dream-art',
    color: '#06B6D4',
    gradient: ['#06B6D4', '#22D3EE'],
  },
  {
    title: 'Lucid Trainer',
    description: 'Learn lucid dreaming techniques',
    icon: 'flash',
    route: '/lucid-trainer',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#FBBF24'],
  },
  {
    title: 'Sleep Recorder',
    description: 'Record your sleep patterns',
    icon: 'radio',
    route: '/sleep-recorder',
    color: '#EF4444',
    gradient: ['#EF4444', '#F87171'],
  },
  {
    title: 'Sleep Planner',
    description: 'Plan your sleep schedule',
    icon: 'moon',
    route: '/sleep-planner',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#60A5FA'],
  },
  {
    title: 'Audio Library',
    description: 'Upload & manage audio files',
    icon: 'library',
    route: '/audio-library',
    color: '#10B981',
    gradient: ['#10B981', '#34D399'],
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#D946EF']}
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
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <LinearGradient
              colors={['#F0F4FF', '#F8FAFF']}
              style={styles.statCard}
            >
              <Ionicons name="book-outline" size={22} color="#7C3AED" />
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.dreamCount}
              </Text>
              <Text style={styles.statLabel}>Dreams</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#F0FDF4', '#F8FAFF']}
              style={styles.statCard}
            >
              <Ionicons name="flash-outline" size={22} color="#10B981" />
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.lucidDreamCount}
              </Text>
              <Text style={styles.statLabel}>Lucid</Text>
            </LinearGradient>

            <LinearGradient
              colors={['#F0F9FF', '#F8FAFF']}
              style={styles.statCard}
            >
              <Ionicons name="moon-outline" size={22} color="#3B82F6" />
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
                    colors={[feature.gradient[0], feature.gradient[1]]}
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
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F6FF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '400',
    marginBottom: 6,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
  },
  profileButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
  },
  profileButtonContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 36,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 10,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  featureCard: {
    width: (width - 54) / 2,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  featureCardGradient: {
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  featureCardContent: {
    flex: 1,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
});

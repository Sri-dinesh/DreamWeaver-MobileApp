import { useAuth } from '@/context/AuthContext';
import { fetchAllStats, Stats } from '@/services/statsService';
import { getItem } from '@/utils/secureStorage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
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
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    title: 'AI Tools',
    description: 'Generate prompts & imagery',
    icon: 'sparkles',
    route: '/prompt-builder',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
  },
  {
    title: 'Dream Art',
    description: 'Create art from your dreams',
    icon: 'images',
    route: '/dream-art',
    color: '#8B5CF6',
    gradient: ['#8B5CF6', '#A78BFA'],
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
    color: '#06B6D4',
    gradient: ['#06B6D4', '#22D3EE'],
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
        colors={['#4C1D95', '#7C3AED', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.headerContent}>
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{greeting}</Text>
              <Text style={styles.userName}>
                {user?.username || 'Dream Explorer'}
              </Text>
              <Text style={styles.welcomeText}>
                Ready to explore your dreams?
              </Text>
            </View>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <BlurView intensity={20} style={styles.profileButtonBlur}>
                <Ionicons
                  name="person-circle-outline"
                  size={32}
                  color="white"
                />
              </BlurView>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            {/* Dreams logged card */}
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.statCard}
            >
              <Ionicons name="book-outline" size={24} color="#7C3AED" />
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.dreamCount}
              </Text>
              <Text style={styles.statLabel}>Dreams Logged</Text>
            </LinearGradient>

            {/* Lucid dreams card */}
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.statCard}
            >
              <Ionicons name="flash-outline" size={24} color="#10B981" />
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.lucidDreamCount}
              </Text>
              <Text style={styles.statLabel}>Lucid Dreams</Text>
            </LinearGradient>

            {/* Average sleep card */}
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.statCard}
            >
              <Ionicons name="moon-outline" size={24} color="#3B82F6" />
              <Text style={styles.statNumber}>
                {loading ? '-' : stats.avgSleep}
              </Text>
              <Text style={styles.statLabel}>Avg Sleep</Text>
            </LinearGradient>
          </View>

          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Explore Features</Text>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureCard}
                  onPress={() => router.push(feature.route as any)}
                >
                  <LinearGradient
                    colors={['#FFFFFF', '#FAFBFC']}
                    style={styles.featureCardGradient}
                  >
                    <LinearGradient
                      colors={feature.gradient as [string, string]}
                      style={styles.featureIcon}
                    >
                      <Ionicons
                        name={feature.icon as any}
                        size={24}
                        color="white"
                      />
                    </LinearGradient>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
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
    backgroundColor: '#FAFBFC',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerOverlay: {
    padding: 24,
    paddingTop: 10,
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  profileButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  profileButtonBlur: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 6,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  featureCard: {
    width: (width - 68) / 2,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  featureCardGradient: {
    padding: 24,
    borderRadius: 6,
    alignItems: 'flex-start',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 22,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '500',
  },
});

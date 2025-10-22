import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { analyticsService } from '@/services/analyticsService';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dreamConsistency, setDreamConsistency] = useState<any>(null);
  const [emotionalSleepMap, setEmotionalSleepMap] = useState<any>(null);
  const [emotionsDistribution, setEmotionsDistribution] = useState<any>(null);
  const [sleepDuration, setSleepDuration] = useState<any>(null);
  const [lucidDreams, setLucidDreams] = useState<any>(null);
  const [correlations, setCorrelations] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all analytics data in parallel
      const [
        consistencyData,
        emotionalMapData,
        emotionsData,
        sleepData,
        lucidData,
        correlationsData
      ] = await Promise.all([
        analyticsService.getDreamConsistency(),
        analyticsService.getEmotionalSleepMap(),
        analyticsService.getDreamEmotionsDistribution(),
        analyticsService.getSleepDuration(),
        analyticsService.getLucidDreamsPerDay(),
        analyticsService.getSleepDreamCorrelations()
      ]);

      setDreamConsistency(consistencyData);
      setEmotionalSleepMap(emotionalMapData);
      setEmotionsDistribution(emotionsData);
      setSleepDuration(sleepData);
      setLucidDreams(lucidData);
      setCorrelations(correlationsData);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to fetch analytics data');
      Alert.alert('Error', 'Failed to fetch analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderDreamConsistency = () => {
    // Check if we have a message instead of data
    if (dreamConsistency && typeof dreamConsistency === 'object' && 'message' in dreamConsistency) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="calendar-outline" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.placeholderTitle}>
            {dreamConsistency.message || 'Start journaling your dreams'}
          </Text>
          <Text style={styles.placeholderText}>
            to see consistency insights here!
          </Text>
        </View>
      );
    }

    if (!dreamConsistency || dreamConsistency.consistency === undefined) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="calendar-outline" size={32} color="#7C3AED" />
          </View>
          <Text style={styles.placeholderTitle}>
            {dreamConsistency?.message || 'Start journaling your dreams'}
          </Text>
          <Text style={styles.placeholderText}>
            to see consistency insights here!
          </Text>
        </View>
      );
    }

    const consistency = dreamConsistency.consistency;
    const percentage = Math.min(100, Math.round(consistency * 100));
    
    return (
      <View style={styles.dataCard}>
        <View style={styles.consistencyHeader}>
          <Text style={styles.consistencyTitle}>Dream Consistency</Text>
          <Text style={styles.consistencyValue}>{percentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${percentage}%`, backgroundColor: '#7C3AED' }
            ]}
          />
        </View>
        <Text style={styles.consistencyDescription}>
          {percentage > 80 
            ? 'Excellent consistency! Keep up the great work.' 
            : percentage > 60 
            ? 'Good consistency. Try to maintain a regular dream journaling habit.'
            : 'Work on building a more consistent dream journaling routine.'}
        </Text>
      </View>
    );
  };

  const renderEmotionalSleepMap = () => {
    // Check if we have a message instead of data
    if (emotionalSleepMap && typeof emotionalSleepMap === 'object' && 'message' in emotionalSleepMap) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="heart-outline" size={32} color="#EF4444" />
          </View>
          <Text style={styles.placeholderTitle}>{emotionalSleepMap.message || 'Record some dreams'}</Text>
          <Text style={styles.placeholderText}>
            to see your emotional sleep map!
          </Text>
        </View>
      );
    }

    // Safely check if it's a non-empty array
    if (!Array.isArray(emotionalSleepMap) || emotionalSleepMap.length === 0) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="heart-outline" size={32} color="#EF4444" />
          </View>
          <Text style={styles.placeholderTitle}>Record some dreams</Text>
          <Text style={styles.placeholderText}>
            to see your emotional sleep map!
          </Text>
        </View>
      );
    }

    // Now safe to use .forEach()
    const emotionCounts: any = {};
    emotionalSleepMap.forEach((dream: any) => {
      const emotion = dream.emotion || 'unknown';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const emotions = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count: count as number,
      color: getEmotionColor(emotion)
    })).sort((a, b) => b.count - a.count);

    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Emotional Sleep Map</Text>
        <View style={styles.emotionsContainer}>
          {emotions.map((item, index) => (
            <View key={index} style={styles.emotionItem}>
              <View style={[styles.emotionColor, { backgroundColor: item.color }]} />
              <Text style={styles.emotionLabel}>{item.emotion}</Text>
              <Text style={styles.emotionCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEmotionsDistribution = () => {
    // Check if we have a message instead of data
    if (emotionsDistribution && typeof emotionsDistribution === 'object' && 'message' in emotionsDistribution) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="pie-chart-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.placeholderTitle}>
            {emotionsDistribution.message || 'No dream emotion data available yet.'}
          </Text>
        </View>
      );
    }

    if (!Array.isArray(emotionsDistribution) || emotionsDistribution.length === 0) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="pie-chart-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.placeholderTitle}>
            No dream emotion data available yet.
          </Text>
        </View>
      );
    }

    // Sort by percentage descending
    const sortedEmotions = emotionsDistribution
      .sort((a: any, b: any) => b.percentage - a.percentage)
      .slice(0, 5);

    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Dream Emotions Distribution</Text>
        <View style={styles.pieChartContainer}>
          {sortedEmotions.map((item: any, index: number) => {
            const percentage = Math.round(item.percentage);
            return (
              <View key={index} style={styles.pieSliceContainer}>
                <View style={styles.pieSliceHeader}>
                  <View style={[styles.pieSliceColor, { backgroundColor: getEmotionColor(item.emotion) }]} />
                  <Text style={styles.pieSliceLabel}>{item.emotion}</Text>
                </View>
                <Text style={styles.pieSliceValue}>{percentage}%</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderSleepDuration = () => {
    if (!sleepDuration || sleepDuration.length === 0) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="bar-chart-outline" size={32} color="#3B82F6" />
          </View>
          <Text style={styles.placeholderTitle}>
            No sleep duration data available
          </Text>
          <Text style={styles.placeholderText}>for the last 30 days.</Text>
        </View>
      );
    }

    // Calculate average sleep duration
    const totalDuration = sleepDuration.reduce((sum: number, entry: any) => sum + entry.duration, 0);
    const avgDuration = totalDuration / sleepDuration.length;
    
    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Sleep Duration (Last 30 Days)</Text>
        <View style={styles.sleepStatsContainer}>
          <View style={styles.sleepStatItem}>
            <Text style={styles.sleepStatValue}>{avgDuration.toFixed(1)}</Text>
            <Text style={styles.sleepStatLabel}>Avg. Hours</Text>
          </View>
          <View style={styles.sleepStatItem}>
            <Text style={styles.sleepStatValue}>{sleepDuration.length}</Text>
            <Text style={styles.sleepStatLabel}>Days Tracked</Text>
          </View>
        </View>
        <View style={styles.sleepChartContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sleepDuration.slice(0, 10).map((entry: any, index: number) => (
              <View key={index} style={styles.sleepChartBarContainer}>
                <View 
                  style={[
                    styles.sleepChartBar,
                    { 
                      height: `${Math.min(100, entry.duration * 10)}%`,
                      backgroundColor: entry.duration > 7 ? '#10B981' : entry.duration > 6 ? '#F59E0B' : '#EF4444'
                    }
                  ]}
                />
                <Text style={styles.sleepChartLabel}>
                  {new Date(entry.date).getDate()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderLucidDreams = () => {
    if (!lucidDreams || lucidDreams.length === 0) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="flash-outline" size={32} color="#10B981" />
          </View>
          <Text style={styles.placeholderTitle}>
            No lucid dream data available yet.
          </Text>
          <Text style={styles.placeholderText}>
            Mark dreams as lucid in your journal!
          </Text>
        </View>
      );
    }

    // Calculate total lucid dreams
    const totalLucid = lucidDreams.reduce((sum: number, entry: any) => sum + entry.count, 0);
    
    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Lucid Dreams</Text>
        <View style={styles.lucidStatsContainer}>
          <View style={styles.lucidStatItem}>
            <Text style={styles.lucidStatValue}>{totalLucid}</Text>
            <Text style={styles.lucidStatLabel}>Total Lucid Dreams</Text>
          </View>
        </View>
        <View style={styles.lucidChartContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {lucidDreams.slice(0, 10).map((entry: any, index: number) => (
              <View key={index} style={styles.lucidChartBarContainer}>
                <View 
                  style={[
                    styles.lucidChartBar,
                    { 
                      height: `${Math.min(100, entry.count * 20)}%`,
                      backgroundColor: '#10B981'
                    }
                  ]}
                />
                <Text style={styles.lucidChartLabel}>
                  {new Date(entry.date).getDate()}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderCorrelations = () => {
    if (!correlations || correlations.correlation === undefined) {
      return (
        <View style={styles.placeholderCard}>
          <View style={styles.placeholderIcon}>
            <Ionicons name="analytics-outline" size={32} color="#8B5CF6" />
          </View>
          <Text style={styles.placeholderTitle}>
            {correlations?.message || 'Not enough combined sleep and dream data'}
          </Text>
          <Text style={styles.placeholderText}>
            to calculate correlations. Please ensure you have recorded both
            sleep plans and dream entries (including lucid status).
          </Text>
        </View>
      );
    }

    const correlation = correlations.correlation;
    const correlationPercentage = Math.round(Math.abs(correlation) * 100);
    const correlationType = correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'neutral';
    
    return (
      <View style={styles.dataCard}>
        <Text style={styles.cardTitle}>Sleep & Dream Correlations</Text>
        <View style={styles.correlationContainer}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationValue}>
              {correlation > 0 ? '+' : ''}{correlation.toFixed(2)}
            </Text>
            <Text style={styles.correlationType}>
              {correlationType} correlation
            </Text>
          </View>
          <View style={styles.correlationBarContainer}>
            <View 
              style={[
                styles.correlationBar,
                { 
                  width: `${correlationPercentage}%`,
                  backgroundColor: correlation > 0 ? '#10B981' : correlation < 0 ? '#EF4444' : '#6B7280'
                }
              ]}
            />
          </View>
          <Text style={styles.correlationDescription}>
            {correlation > 0.5 
              ? 'Strong positive correlation between sleep duration and lucid dreams.' 
              : correlation > 0.2 
              ? 'Moderate positive correlation between sleep duration and lucid dreams.'
              : correlation < -0.5
              ? 'Strong negative correlation between sleep duration and lucid dreams.'
              : correlation < -0.2
              ? 'Moderate negative correlation between sleep duration and lucid dreams.'
              : 'Weak correlation between sleep duration and lucid dreams.'}
          </Text>
        </View>
      </View>
    );
  };

  const getEmotionColor = (emotion: string) => {
    const colors: any = {
      'joy': '#10B981',
      'happiness': '#10B981',
      'excitement': '#10B981',
      'fear': '#EF4444',
      'anxiety': '#EF4444',
      'terror': '#EF4444',
      'surprise': '#F59E0B',
      'amazement': '#F59E0B',
      'curiosity': '#3B82F6',
      'confusion': '#3B82F6',
      'sadness': '#6B7280',
      'melancholy': '#6B7280',
      'default': '#8B5CF6'
    };
    return colors[emotion.toLowerCase()] || colors.default;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
          style={styles.headerGradient}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Analytics</Text>
              <Text style={styles.headerSubtitle}>
                Insights into your dream patterns
              </Text>
            </View>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>
              Insights into your dream patterns
            </Text>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Ionicons name="share-outline" size={20} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Consistency Insights</Text>
          {renderDreamConsistency()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotional Sleep Map</Text>
          {renderEmotionalSleepMap()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Emotions Distribution</Text>
          {renderEmotionsDistribution()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 Days Sleep Duration</Text>
          {renderSleepDuration()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lucid Dreams per Day</Text>
          {renderLucidDreams()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep & Dream Correlations</Text>
          {renderCorrelations()}
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
  headerGradient: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 10,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  placeholderCard: {
    padding: 40,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    backgroundColor: '#FFFFFF',
  },
  placeholderIcon: {
    width: 64,
    height: 64,
    borderRadius: 6,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  // New styles for data cards
  dataCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  // Dream consistency styles
  consistencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  consistencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  consistencyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#7C3AED',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  consistencyDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  // Emotional sleep map styles
  emotionsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  emotionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emotionColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  emotionLabel: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  emotionCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  // Pie chart styles
  pieChartContainer: {
    flexDirection: 'column',
    gap: 16,
  },
  pieSliceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pieSliceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pieSliceColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  pieSliceLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  pieSliceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  // Sleep duration styles
  sleepStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  sleepStatItem: {
    alignItems: 'center',
  },
  sleepStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#3B82F6',
    marginBottom: 4,
  },
  sleepStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  sleepChartContainer: {
    marginTop: 16,
  },
  sleepChartBarContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 40,
  },
  sleepChartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  sleepChartLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Lucid dreams styles
  lucidStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lucidStatItem: {
    alignItems: 'center',
  },
  lucidStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10B981',
    marginBottom: 4,
  },
  lucidStatLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  lucidChartContainer: {
    marginTop: 16,
  },
  lucidChartBarContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 40,
  },
  lucidChartBar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  lucidChartLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Correlation styles
  correlationContainer: {
    alignItems: 'center',
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  correlationValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginRight: 8,
  },
  correlationType: {
    fontSize: 16,
    color: '#6B7280',
  },
  correlationBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  correlationBar: {
    height: '100%',
    borderRadius: 6,
  },
  correlationDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
});

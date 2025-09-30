import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const mockStats = {
  totalDreams: 47,
  lucidDreams: 12,
  avgSleepHours: 7.2,
  mostCommonTag: 'flying',
  dreamStreak: 5,
  emotionalTone: 'positive',
};

const commonTags = [
  { tag: 'flying', count: 8 },
  { tag: 'water', count: 6 },
  { tag: 'people', count: 5 },
  { tag: 'animals', count: 4 },
  { tag: 'home', count: 3 },
];

const emotions = [
  { emotion: 'joy', count: 15, color: '#10B981' },
  { emotion: 'fear', count: 8, color: '#EF4444' },
  { emotion: 'surprise', count: 7, color: '#F59E0B' },
  { emotion: 'curiosity', count: 12, color: '#3B82F6' },
  { emotion: 'sadness', count: 5, color: '#6B7280' },
];

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Insights into your dream patterns</Text>
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
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="calendar-outline" size={32} color="#7C3AED" />
            </View>
            <Text style={styles.placeholderTitle}>Start journaling your dreams</Text>
            <Text style={styles.placeholderText}>to see consistency insights here!</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotional Sleep Map</Text>
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="heart-outline" size={32} color="#EF4444" />
            </View>
            <Text style={styles.placeholderTitle}>Record some dreams</Text>
            <Text style={styles.placeholderText}>to see your emotional sleep map!</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Emotions Distribution</Text>
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="pie-chart-outline" size={32} color="#F59E0B" />
            </View>
            <Text style={styles.placeholderTitle}>No dream emotion data available yet.</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last 30 Days Sleep Duration</Text>
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="bar-chart-outline" size={32} color="#3B82F6" />
            </View>
            <Text style={styles.placeholderTitle}>No sleep duration data available</Text>
            <Text style={styles.placeholderText}>for the last 30 days.</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lucid Dreams per Day</Text>
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="flash-outline" size={32} color="#10B981" />
            </View>
            <Text style={styles.placeholderTitle}>No lucid dream data available yet.</Text>
            <Text style={styles.placeholderText}>Mark dreams as lucid in your journal!</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sleep & Dream Correlations</Text>
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.placeholderCard}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="analytics-outline" size={32} color="#8B5CF6" />
            </View>
            <Text style={styles.placeholderTitle}>Not enough combined sleep and dream data</Text>
            <Text style={styles.placeholderText}>to calculate correlations. Please ensure you have recorded both sleep plans and dream entries (including lucid status).</Text>
          </LinearGradient>
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
});
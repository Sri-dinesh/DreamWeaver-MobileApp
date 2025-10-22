import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@dreamweaver.app')
        },
        {
          text: 'Call',
          onPress: () => Linking.openURL('tel:+11234567890')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const helpTopics = [
    {
      title: 'Getting Started',
      description: 'Learn how to begin your dream journaling journey',
      icon: 'rocket-outline',
      route: '/getting-started-guide'
    },
    {
      title: 'Dream Logging',
      description: 'Tips for effective dream recording and analysis',
      icon: 'cloud-upload-outline',
      route: '/dream-logging-tips'
    },
    {
      title: 'Lucid Dreaming',
      description: 'Techniques to achieve and enhance lucid dreams',
      icon: 'moon-outline',
      route: '/lucid-dreaming-guide'
    },
    {
      title: 'Sleep Tracking',
      description: 'Understanding your sleep patterns and insights',
      icon: 'bed-outline',
      route: '/sleep-tracking-guide'
    }
  ];

  const supportOptions = [
    {
      title: 'FAQ',
      description: 'Find answers to common questions',
      icon: 'help-circle-outline',
      route: '/faq'
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'mail-outline',
      action: handleContactSupport
    },
    {
      title: 'Community Forum',
      description: 'Connect with other dreamers',
      icon: 'people-outline',
      route: '/community-forum'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.heroIconContainer}>
            <Ionicons name="help-circle" size={48} color="#7C3AED" />
          </View>
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroDescription}>
            Find answers to common questions or get in touch with our support team
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Help Topics</Text>
        <View style={styles.optionsContainer}>
          {helpTopics.map((topic, index) => (
            <TouchableOpacity 
              key={topic.title}
              style={[styles.optionRow, index === helpTopics.length - 1 && styles.lastOption]}
              onPress={() => router.push(topic.route as any)}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name={topic.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{topic.title}</Text>
                <Text style={styles.optionDescription}>{topic.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.optionsContainer}>
          {supportOptions.map((option, index) => (
            <TouchableOpacity 
              key={option.title}
              style={[styles.optionRow, index === supportOptions.length - 1 && styles.lastOption]}
              onPress={option.action || (() => router.push(option.route as any))}
            >
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.feedbackSection}>
          <Text style={styles.feedbackTitle}>Was this helpful?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity style={styles.feedbackButton}>
              <Ionicons name="thumbs-up-outline" size={20} color="#10B981" />
              <Text style={styles.feedbackButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.feedbackButton}>
              <Ionicons name="thumbs-down-outline" size={20} color="#EF4444" />
              <Text style={styles.feedbackButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Response Time</Text>
              <Text style={styles.infoText}>
                Our support team typically responds within 24 hours. For urgent issues, please call our support line.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  content: {
    padding: 24,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 32,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  feedbackSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});

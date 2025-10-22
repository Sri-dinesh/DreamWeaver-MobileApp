import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AboutScreen() {
  const appVersion = '1.0.0';
  const buildNumber = '2025.01.15';

  const openPrivacyPolicy = () => {
    Linking.openURL('https://dreamweaver.app/privacy');
  };

  const openTermsOfService = () => {
    Linking.openURL('https://dreamweaver.app/terms');
  };

  const teamMembers = [
    {
      name: 'S Sridinesh',
      role: 'Lead Developer',
      image: 'AM'
    },
    {
      name: 'M Charan Chandra',
      role: 'Founder',
      image: 'TK'
    },
    {
      name: 'Jordan Smith',
      role: 'Dream Researcher',
      image: 'JS'
    }
  ];

  const appFeatures = [
    'Dream Journaling',
    'Lucid Dream Training',
    'Sleep Tracking',
    'Community Sharing',
    'AI Dream Analysis',
    'Audio Recording'
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.appInfoSection}>
          <View style={styles.appIconContainer}>
            <Ionicons name="moon" size={48} color="#7C3AED" />
          </View>
          <Text style={styles.appName}>DreamWeaver</Text>
          <Text style={styles.appVersion}>Version {appVersion}</Text>
          <Text style={styles.buildNumber}>Build {buildNumber}</Text>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionTitle}>About DreamWeaver</Text>
          <Text style={styles.descriptionText}>
            DreamWeaver is a comprehensive dream journaling app designed to help you explore, understand, 
            and enhance your dream experiences. Our mission is to unlock the mysteries of the subconscious 
            mind through advanced tracking, analysis, and community sharing.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Key Features</Text>
        <View style={styles.featuresContainer}>
          {appFeatures.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Our Team</Text>
        <View style={styles.teamContainer}>
          {teamMembers.map((member, index) => (
            <View key={index} style={styles.teamMember}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitials}>{member.image}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Legal</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionRow, styles.lastOption]}
            onPress={openPrivacyPolicy}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="shield-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Privacy Policy</Text>
              <Text style={styles.optionDescription}>Learn how we protect your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionRow, styles.lastOption]}
            onPress={openTermsOfService}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="document-text-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Terms of Service</Text>
              <Text style={styles.optionDescription}>Our terms and conditions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Open Source</Text>
              <Text style={styles.infoText}>
                DreamWeaver is built with open source technologies. View our GitHub repository to see our tech stack.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.copyrightText}>
          © 2025 DreamWeaver. All rights reserved.
        </Text>
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
  appInfoSection: {
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
  appIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
  },
  appVersion: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
    marginBottom: 4,
  },
  buildNumber: {
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  featuresContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#4B5563',
    marginLeft: 12,
  },
  teamContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  memberInitials: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#6B7280',
  },
  optionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
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
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
});

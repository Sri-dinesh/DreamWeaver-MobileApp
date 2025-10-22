import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacySettingsScreen() {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    dreamVisibility: false,
    activityStatus: true,
    analytics: true,
    personalizedAds: false,
    dataCollection: true,
  });

  const toggleSetting = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive' }
      ]
    );
  };

  const privacyOptions = [
    {
      title: 'Profile Visibility',
      description: 'Allow others to see your profile',
      key: 'profileVisibility',
      icon: 'person-outline'
    },
    {
      title: 'Dream Visibility',
      description: 'Make your dreams visible to the community',
      key: 'dreamVisibility',
      icon: 'cloud-outline'
    },
    {
      title: 'Show Activity Status',
      description: 'Display when you were last active',
      key: 'activityStatus',
      icon: 'time-outline'
    }
  ];

  const dataOptions = [
    {
      title: 'Analytics',
      description: 'Help us improve by sharing usage data',
      key: 'analytics',
      icon: 'bar-chart-outline'
    },
    {
      title: 'Personalized Ads',
      description: 'Allow personalized advertising based on your interests',
      key: 'personalizedAds',
      icon: 'megaphone-outline'
    },
    {
      title: 'Data Collection',
      description: 'Collect data to enhance app features',
      key: 'dataCollection',
      icon: 'folder-outline'
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        <View style={styles.optionsContainer}>
          {privacyOptions.map((option, index) => (
            <View key={option.key} style={[styles.optionRow, index === privacyOptions.length - 1 && styles.lastOption]}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={privacySettings[option.key as keyof typeof privacySettings] ? "#7C3AED" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleSetting(option.key as keyof typeof privacySettings)}
                value={privacySettings[option.key as keyof typeof privacySettings]}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Data Collection</Text>
        <View style={styles.optionsContainer}>
          {dataOptions.map((option, index) => (
            <View key={option.key} style={[styles.optionRow, index === dataOptions.length - 1 && styles.lastOption]}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={privacySettings[option.key as keyof typeof privacySettings] ? "#7C3AED" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleSetting(option.key as keyof typeof privacySettings)}
                value={privacySettings[option.key as keyof typeof privacySettings]}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Account Security</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionRow, styles.lastOption]}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Change Password</Text>
              <Text style={styles.optionDescription}>Update your account password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.deleteAccountButton}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
          <Text style={styles.deleteAccountText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Privacy Policy</Text>
              <Text style={styles.infoText}>
                Your privacy is important to us. We never sell your personal data or dream content.
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
  deleteAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
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

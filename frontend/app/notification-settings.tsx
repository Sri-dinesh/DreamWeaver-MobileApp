import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettingsScreen() {
  const [notificationSettings, setNotificationSettings] = useState({
    allNotifications: true,
    dreamReminders: true,
    lucidDreamPrompts: false,
    sleepTracking: true,
    communityActivity: false,
    weeklyReports: true,
    soundEnabled: true,
    vibration: true,
  });

  const toggleSetting = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const notificationOptions = [
    {
      title: 'Dream Reminders',
      description: 'Remind you to log your dreams',
      key: 'dreamReminders',
      icon: 'cloud-outline'
    },
    {
      title: 'Lucid Dream Prompts',
      description: 'Tips to increase lucid dreaming',
      key: 'lucidDreamPrompts',
      icon: 'moon-outline'
    },
    {
      title: 'Sleep Tracking',
      description: 'Sleep analysis and insights',
      key: 'sleepTracking',
      icon: 'bed-outline'
    },
    {
      title: 'Community Activity',
      description: 'Updates from friends and community',
      key: 'communityActivity',
      icon: 'people-outline'
    },
    {
      title: 'Weekly Reports',
      description: 'Dream journal progress reports',
      key: 'weeklyReports',
      icon: 'document-text-outline'
    }
  ];

  const systemOptions = [
    {
      title: 'Sound',
      description: 'Play notification sounds',
      key: 'soundEnabled',
      icon: 'volume-high-outline'
    },
    {
      title: 'Vibration',
      description: 'Vibrate for notifications',
      key: 'vibration',
      icon: 'phone-portrait-outline'
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.toggleAllContainer}>
          <View style={styles.toggleAllContent}>
            <Text style={styles.toggleAllTitle}>All Notifications</Text>
            <Text style={styles.toggleAllDescription}>Enable or disable all notifications</Text>
          </View>
          <Switch
            trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
            thumbColor={notificationSettings.allNotifications ? "#7C3AED" : "#F3F4F6"}
            ios_backgroundColor="#D1D5DB"
            onValueChange={() => toggleSetting('allNotifications')}
            value={notificationSettings.allNotifications}
          />
        </View>

        <Text style={styles.sectionTitle}>Notification Types</Text>
        <View style={styles.optionsContainer}>
          {notificationOptions.map((option, index) => (
            <View key={option.key} style={[styles.optionRow, index === notificationOptions.length - 1 && styles.lastOption]}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={notificationSettings[option.key as keyof typeof notificationSettings] ? "#7C3AED" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleSetting(option.key as keyof typeof notificationSettings)}
                value={notificationSettings[option.key as keyof typeof notificationSettings]}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>System Settings</Text>
        <View style={styles.optionsContainer}>
          {systemOptions.map((option, index) => (
            <View key={option.key} style={[styles.optionRow, index === systemOptions.length - 1 && styles.lastOption]}>
              <View style={styles.optionIconContainer}>
                <Ionicons name={option.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                trackColor={{ false: "#D1D5DB", true: "#C4B5FD" }}
                thumbColor={notificationSettings[option.key as keyof typeof notificationSettings] ? "#7C3AED" : "#F3F4F6"}
                ios_backgroundColor="#D1D5DB"
                onValueChange={() => toggleSetting(option.key as keyof typeof notificationSettings)}
                value={notificationSettings[option.key as keyof typeof notificationSettings]}
              />
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quiet Hours</Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={[styles.optionRow, styles.lastOption]}
            // onPress={() => router.push('')}
          >
            <View style={styles.optionIconContainer}>
              <Ionicons name="time-outline" size={20} color="#7C3AED" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Set Quiet Hours</Text>
              <Text style={styles.optionDescription}>Schedule do not disturb periods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Notification Preferences</Text>
              <Text style={styles.infoText}>
                Customize when and how you receive notifications to enhance your dream journaling experience.
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
  toggleAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleAllContent: {
    flex: 1,
  },
  toggleAllTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  toggleAllDescription: {
    fontSize: 14,
    color: '#6B7280',
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

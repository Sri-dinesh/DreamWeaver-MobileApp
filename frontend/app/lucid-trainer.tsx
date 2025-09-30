import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LucidTrainerScreen() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [frequency, setFrequency] = useState('30');
  const [showTechniquesModal, setShowTechniquesModal] = useState(false);
  
  const mockStats = {
    totalDreams: 47,
    lucidDreams: 12,
    lucidRatio: '25.5%',
  };

  const handleSaveSettings = () => {
    Alert.alert('Settings Saved', 'Reality check notification settings have been saved successfully.');
  };

  const handleTestNotification = () => {
    Alert.alert('Test Notification', 'This is how your reality check notification will appear. Remember to check your hands!');
  };

  const renderNotificationsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reality Check Notifications</Text>
      
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#D1D5DB', true: '#A855F7' }}
            thumbColor={notificationsEnabled ? '#7C3AED' : '#9CA3AF'}
          />
        </View>
        <Text style={styles.settingDescription}>
          {notificationsEnabled 
            ? `Scheduled every ${frequency} minutes` 
            : 'Notifications disabled'
          }
        </Text>
      </View>
      
      {notificationsEnabled && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frequency (minutes)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="30"
            value={frequency}
            onChangeText={setFrequency}
            keyboardType="numeric"
          />
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveSettings}
        >
          <Text style={styles.primaryButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleTestNotification}
        >
          <Ionicons name="notifications-outline" size={18} color="#7C3AED" />
          <Text style={styles.secondaryButtonText}>Test Notification</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderTechniquesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reality Check Techniques</Text>
      
      <View style={styles.techniquesList}>
        <View style={styles.techniqueItem}>
          <Text style={styles.techniqueName}>**Finger Through Palm:**</Text>
          <Text style={styles.techniqueDescription}>
            Push a finger into your opposite palm. In a dream, it might go through.
          </Text>
        </View>
        
        <View style={styles.techniqueItem}>
          <Text style={styles.techniqueName}>**Nose Pinch:**</Text>
          <Text style={styles.techniqueDescription}>
            Pinch your nose and try to breathe. In a dream, you might still be able to.
          </Text>
        </View>
        
        <View style={styles.techniqueItem}>
          <Text style={styles.techniqueName}>**Hands Check:**</Text>
          <Text style={styles.techniqueDescription}>
            Look closely at your hands. Are there too many/few fingers? Do they look distorted?
          </Text>
        </View>
        
        <View style={styles.techniqueItem}>
          <Text style={styles.techniqueName}>**Time/Text Check:**</Text>
          <Text style={styles.techniqueDescription}>
            Look at a clock or text, look away, then look back. Does it change?
          </Text>
        </View>
        
        <View style={styles.techniqueItem}>
          <Text style={styles.techniqueName}>**Light Switch:**</Text>
          <Text style={styles.techniqueDescription}>
            Try to turn a light on/off. In dreams, they often don't work or act strangely.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderStatsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Lucid Dream Statistics</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={24} color="#7C3AED" />
          <Text style={styles.statNumber}>{mockStats.totalDreams}</Text>
          <Text style={styles.statLabel}>Total Dreams Logged</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flash-outline" size={24} color="#10B981" />
          <Text style={styles.statNumber}>{mockStats.lucidDreams}</Text>
          <Text style={styles.statLabel}>Lucid Dreams Recorded</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
          <Text style={styles.statNumber}>{mockStats.lucidRatio}</Text>
          <Text style={styles.statLabel}>Lucid Dream Ratio</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderGuidedTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Guided Techniques</Text>
      
      <Text style={styles.guidedDescription}>
        Explore various techniques to induce and stabilize lucid dreams.
      </Text>
      
      <View style={styles.techniquesList}>
        <Text style={styles.techniqueName}>MILD (Mnemonic Induction of Lucid Dreams)</Text>
        <Text style={styles.techniqueName}>WILD (Wake Initiated Lucid Dreams)</Text>
        <Text style={styles.techniqueName}>DOTS (Dreaming on The Spot)</Text>
      </View>
      
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => setShowTechniquesModal(true)}
      >
        <Text style={styles.exploreButtonText}>Explore Techniques</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTechniquesModal = () => (
    <Modal
      visible={showTechniquesModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Lucid Dreaming Techniques</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowTechniquesModal(false)}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>MILD (Mnemonic Induction of Lucid Dreams)</Text>
            <Text style={styles.modalDescription}>
              This technique involves repeatedly telling yourself that you will remember to recognize you're dreaming while falling asleep, combined with vivid visualization of becoming lucid in a dream.
            </Text>
            <Text style={styles.modalStepsTitle}>Steps:</Text>
            <Text style={styles.modalSteps}>
              1. Before bed, set an intention to remember your dreams.{'\n'}
              2. Wake up after 4-6 hours of sleep (e.g., using an alarm).{'\n'}
              3. Recall your most recent dream. If you can't, think about anything.{'\n'}
              4. As you fall back asleep, repeatedly tell yourself: "Next time I'm dreaming, I will remember that I'm dreaming."{'\n'}
              5. Visualize yourself becoming lucid in the dream you just woke from. Imagine performing a reality check and realizing you're dreaming.{'\n'}
              6. Continue until you fall asleep.
            </Text>
          </View>
          
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>WILD (Wake Initiated Lucid Dreams)</Text>
            <Text style={styles.modalDescription}>
              WILD involves going directly from a waking state into a dream without losing consciousness. This often involves experiencing hypnagogic imagery and sensations.
            </Text>
            <Text style={styles.modalStepsTitle}>Steps:</Text>
            <Text style={styles.modalSteps}>
              1. Lie still in bed, focusing on your breath or a simple image.{'\n'}
              2. Relax your body completely. Avoid moving.{'\n'}
              3. Pay attention to hypnagogic imagery (visuals or sounds) that arise.{'\n'}
              4. Let yourself drift, but maintain a sliver of awareness. The goal is to transition directly into a dream.{'\n'}
              5. If successful, you will enter a dream fully aware.
            </Text>
          </View>
          
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>DOTS (Dreaming on The Spot)</Text>
            <Text style={styles.modalDescription}>
              A straightforward technique where you simply decide to have a lucid dream just before falling asleep, and then focus on that intention as you drift off.
            </Text>
            <Text style={styles.modalStepsTitle}>Steps:</Text>
            <Text style={styles.modalSteps}>
              1. Lie down comfortably.{'\n'}
              2. Close your eyes and affirm: "I will have a lucid dream tonight."{'\n'}
              3. Concentrate purely on the intention of becoming lucid, without trying too hard or straining.{'\n'}
              4. Allow yourself to fall asleep naturally while holding this intention.
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  const tabs = [
    { id: 'notifications', name: 'Notifications' },
    { id: 'techniques', name: 'Techniques' },
    { id: 'stats', name: 'Statistics' },
    { id: 'guided', name: 'Guided' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucid Trainer</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'techniques' && renderTechniquesTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'guided' && renderGuidedTab()}
      </View>
      
      {renderTechniquesModal()}
    </View>
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
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  activeTab: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#7C3AED',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  techniquesList: {
    gap: 16,
  },
  techniqueItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  techniqueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  guidedDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSteps: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
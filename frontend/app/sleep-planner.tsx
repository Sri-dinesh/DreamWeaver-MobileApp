import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SleepPlannerScreen() {
  const [activeTab, setActiveTab] = useState('today');
  
  // Today's sleep plan states
  const [sleepGoal, setSleepGoal] = useState('');
  const [targetBedtime, setTargetBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  
  const [pastPlans] = useState([
    {
      id: '1',
      goal: 'Get 8 hours of quality sleep for lucid dreaming',
      bedtime: '22:30',
      wakeTime: '06:30',
      date: '2024-01-15',
    },
    {
      id: '2',
      goal: 'Practice WILD technique tonight',
      bedtime: '23:00',
      wakeTime: '07:00',
      date: '2024-01-14',
    },
  ]);

  const handleSavePlan = () => {
    if (!sleepGoal.trim() || !targetBedtime || !wakeTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert('Success', 'Sleep plan saved successfully!', [
      { text: 'OK', onPress: () => {
        setSleepGoal('');
        setTargetBedtime('');
        setWakeTime('');
      }}
    ]);
  };

  const handleGenerateRitual = () => {
    if (!sleepGoal.trim()) {
      Alert.alert('Error', 'Please enter your sleep goal first');
      return;
    }
    
    Alert.alert(
      'AI Generated Ritual',
      'Based on your goal, here\'s a personalized sleep ritual:\n\n1. Dim lights 1 hour before bedtime\n2. Practice 10 minutes of meditation\n3. Write in your dream journal\n4. Set lucid dreaming intention\n5. Use progressive muscle relaxation',
      [{ text: 'OK' }]
    );
  };

  const renderTodayTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Set Today's Sleep Plan</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What's your sleep goal for tonight?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="I want to have a lucid dream and practice flying..."
          multiline
          value={sleepGoal}
          onChangeText={setSleepGoal}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Target Bedtime</Text>
          <TextInput
            style={styles.textInput}
            placeholder="22:30"
            value={targetBedtime}
            onChangeText={setTargetBedtime}
          />
        </View>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Wake Time</Text>
          <TextInput
            style={styles.textInput}
            placeholder="06:30"
            value={wakeTime}
            onChangeText={setWakeTime}
          />
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, (!sleepGoal.trim() || !targetBedtime || !wakeTime) && styles.buttonDisabled]}
          onPress={handleSavePlan}
          disabled={!sleepGoal.trim() || !targetBedtime || !wakeTime}
        >
          <Text style={styles.primaryButtonText}>Save Plan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, !sleepGoal.trim() && styles.buttonDisabled]}
          onPress={handleGenerateRitual}
          disabled={!sleepGoal.trim()}
        >
          <Ionicons name="sparkles" size={18} color={sleepGoal.trim() ? "#7C3AED" : "#9CA3AF"} />
          <Text style={[styles.secondaryButtonText, !sleepGoal.trim() && styles.buttonTextDisabled]}>
            Generate Ritual with AI
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPastPlansTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Past Sleep Plans</Text>
      
      {pastPlans.map((plan) => (
        <View key={plan.id} style={styles.planCard}>
          <View style={styles.planHeader}>
            <Text style={styles.planDate}>{plan.date}</Text>
          </View>
          <Text style={styles.planGoal}>{plan.goal}</Text>
          <View style={styles.planTimes}>
            <View style={styles.timeItem}>
              <Ionicons name="moon" size={16} color="#6B7280" />
              <Text style={styles.timeText}>Bedtime: {plan.bedtime}</Text>
            </View>
            <View style={styles.timeItem}>
              <Ionicons name="sunny" size={16} color="#6B7280" />
              <Text style={styles.timeText}>Wake: {plan.wakeTime}</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const tabs = [
    { id: 'today', name: 'Today\'s Plan' },
    { id: 'past', name: 'Past Plans' },
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
        <Text style={styles.headerTitle}>Sleep Planner</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
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
      </View>

      <View style={styles.content}>
        {activeTab === 'today' ? renderTodayTab() : renderPastPlansTab()}
      </View>
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
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7C3AED',
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
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
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
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    marginBottom: 8,
  },
  planDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  planGoal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 18,
  },
  planTimes: {
    flexDirection: 'row',
    gap: 20,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
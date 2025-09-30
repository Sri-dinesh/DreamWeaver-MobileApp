import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SleepRecorderScreen() {
  const [activeTab, setActiveTab] = useState('record');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [pastRecordings] = useState([
    {
      id: '1',
      title: 'Sleep Recording - Jan 15',
      duration: '7h 32m',
      notes: 'Peaceful night, some snoring detected',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Sleep Recording - Jan 14',
      duration: '8h 15m',
      notes: 'Deep sleep, minimal movement',
      date: '2024-01-14',
    },
  ]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isRecording) {
      setIsRecording(false);
      Alert.alert('Recording Stopped', 'Your sleep recording has been saved successfully.');
      setNotes('');
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      Alert.alert('Recording Started', 'Sleep sound recording has begun.');
    }
  };

  const renderRecordTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Record Your Sleep Sounds</Text>
      
      <View style={styles.recordingArea}>
        <View style={styles.visualizer}>
          {isRecording ? (
            <View style={styles.waveformContainer}>
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, styles.waveBarTall]} />
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, styles.waveBarShort]} />
              <View style={[styles.waveBar, styles.waveBarTall]} />
              <View style={styles.waveBar} />
              <View style={[styles.waveBar, styles.waveBarShort]} />
              <View style={styles.waveBar} />
            </View>
          ) : (
            <View style={styles.microphoneIcon}>
              <Ionicons name="mic" size={48} color="#7C3AED" />
            </View>
          )}
        </View>

        <Text style={styles.timerText}>
          {formatTime(recordingTime)}
        </Text>

        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordButtonActive
          ]}
          onPress={handleStartStop}
        >
          <Ionicons 
            name={isRecording ? "stop" : "radio-button-on"} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>

        <Text style={styles.recordingStatus}>
          {isRecording ? 'Recording sleep sounds...' : 'Tap to start recording'}
        </Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Notes (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add any notes about your sleep environment, mood, etc..."
          multiline
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </View>
    </ScrollView>
  );

  const renderPastRecordingsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Past Sleep Recordings</Text>
      
      {pastRecordings.map((recording) => (
        <View key={recording.id} style={styles.recordingCard}>
          <View style={styles.recordingHeader}>
            <View style={styles.recordingIcon}>
              <Ionicons name="play" size={20} color="#7C3AED" />
            </View>
            <View style={styles.recordingInfo}>
              <Text style={styles.recordingTitle}>{recording.title}</Text>
              <Text style={styles.recordingDuration}>{recording.duration}</Text>
              <Text style={styles.recordingDate}>{recording.date}</Text>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          {recording.notes && (
            <Text style={styles.recordingNotes}>{recording.notes}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const tabs = [
    { id: 'record', name: 'Record' },
    { id: 'past', name: 'Past Recordings' },
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
        <Text style={styles.headerTitle}>Sleep Recorder</Text>
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
        {activeTab === 'record' ? renderRecordTab() : renderPastRecordingsTab()}
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
    marginTop: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  recordingArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  visualizer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  microphoneIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveBar: {
    width: 4,
    height: 20,
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  waveBarTall: {
    height: 40,
  },
  waveBarShort: {
    height: 12,
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordButtonActive: {
    backgroundColor: '#DC2626',
  },
  recordingStatus: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  recordingDuration: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  recordingDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  recordingNotes: {
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  menuButton: {
    padding: 4,
  },
});
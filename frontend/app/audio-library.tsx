import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AudioLibraryScreen() {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Upload states
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const [audioCollection] = useState([
    {
      id: '1',
      title: 'Lucid Dream Affirmation',
      description: 'Generated affirmation for lucid dreaming',
      type: 'Generated',
      category: 'Affirmation',
      duration: '10:00',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Alpha Wave Binaural Beat',
      description: 'Custom binaural beat for relaxation',
      type: 'Generated',
      category: 'Binaural Beat',
      duration: '30:00',
      date: '2024-01-14',
    },
    {
      id: '3',
      title: 'Ocean Waves Sleep Sound',
      description: 'Uploaded ocean waves for better sleep',
      type: 'Uploaded',
      category: 'Nature Sound',
      duration: '60:00',
      date: '2024-01-13',
    },
  ]);

  const sampleAudios = [
    {
      id: 'sample1',
      title: 'Guided Meditation - Lucid Dreams',
      description: 'A gentle guided meditation to prepare for lucid dreaming',
      duration: '15:00',
      category: 'Meditation',
    },
    {
      id: 'sample2',
      title: 'Theta Wave Binaural Beat',
      description: 'Theta frequency for deep relaxation and dream enhancement',
      duration: '45:00',
      category: 'Binaural Beat',
    },
    {
      id: 'sample3',
      title: 'Rain Forest Ambience',
      description: 'Natural rain forest sounds for peaceful sleep',
      duration: '120:00',
      category: 'Nature Sound',
    },
  ];

  const handleFileSelect = () => {
    // Mock file selection
    setSelectedFile('example-audio.mp3');
    Alert.alert('Audio Selected', 'Audio file selected successfully');
  };

  const handleUploadAudio = () => {
    if (!selectedFile || !title.trim()) {
      Alert.alert('Error', 'Please select an audio file and enter a title');
      return;
    }
    
    Alert.alert('Success', 'Audio uploaded successfully!', [
      { text: 'OK', onPress: () => {
        setSelectedFile(null);
        setTitle('');
        setDescription('');
      }}
    ]);
  };

  const handleAddSampleAudio = (audio: any) => {
    Alert.alert('Sample Added', `"${audio.title}" has been added to your audio collection!`);
  };

  const renderUploadTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Upload Your Own Audio</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Audio File (MP3, WAV, OGG)</Text>
        <TouchableOpacity
          style={styles.fileSelector}
          onPress={handleFileSelect}
        >
          <Ionicons name="musical-notes-outline" size={24} color="#7C3AED" />
          <Text style={styles.fileSelectorText}>
            {selectedFile ? selectedFile : 'Choose Audio File'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter audio title..."
          value={title}
          onChangeText={setTitle}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your audio..."
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, (!selectedFile || !title.trim()) && styles.buttonDisabled]}
        onPress={handleUploadAudio}
        disabled={!selectedFile || !title.trim()}
      >
        <Text style={styles.primaryButtonText}>Upload Audio</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCollectionTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Audio Collection</Text>
      
      <View style={styles.audioGrid}>
        {audioCollection.map((audio) => (
          <View key={audio.id} style={styles.audioCard}>
            <View style={styles.audioHeader}>
              <View style={styles.audioIcon}>
                <Ionicons 
                  name={audio.type === 'Generated' ? 'sparkles' : 'musical-notes'} 
                  size={20} 
                  color="#7C3AED" 
                />
              </View>
              <View style={styles.audioMeta}>
                <Text style={styles.audioType}>{audio.type}</Text>
                <Text style={styles.audioDuration}>{audio.duration}</Text>
              </View>
            </View>
            <Text style={styles.audioTitle}>{audio.title}</Text>
            <Text style={styles.audioDescription} numberOfLines={2}>{audio.description}</Text>
            <View style={styles.audioFooter}>
              <Text style={styles.audioCategory}>{audio.category}</Text>
              <Text style={styles.audioDate}>{audio.date}</Text>
            </View>
            <View style={styles.audioActions}>
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="download-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.sampleSection}>
        <Text style={styles.sectionTitle}>Sample Audio Library</Text>
        <Text style={styles.sampleDescription}>
          Add these sample audios to your collection
        </Text>
        
        {sampleAudios.map((audio) => (
          <View key={audio.id} style={styles.sampleCard}>
            <View style={styles.sampleInfo}>
              <Text style={styles.sampleTitle}>{audio.title}</Text>
              <Text style={styles.sampleDescription}>{audio.description}</Text>
              <View style={styles.sampleMeta}>
                <Text style={styles.sampleCategory}>{audio.category}</Text>
                <Text style={styles.sampleDuration}>{audio.duration}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.addSampleButton}
              onPress={() => handleAddSampleAudio(audio)}
            >
              <Ionicons name="add" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'upload', name: 'Upload Audio' },
    { id: 'collection', name: 'Collection' },
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
        <Text style={styles.headerTitle}>Audio Library</Text>
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
        {activeTab === 'upload' ? renderUploadTab() : renderCollectionTab()}
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
  fileSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 20,
    justifyContent: 'center',
    gap: 12,
  },
  fileSelectorText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7C3AED',
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  audioGrid: {
    gap: 16,
    marginBottom: 32,
  },
  audioCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioMeta: {
    alignItems: 'flex-end',
  },
  audioType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 2,
  },
  audioDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  audioDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  audioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  audioCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  audioDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  audioActions: {
    flexDirection: 'row',
    gap: 12,
  },
  playButton: {
    backgroundColor: '#7C3AED',
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sampleSection: {
    marginTop: 32,
  },
  sampleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  sampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sampleInfo: {
    flex: 1,
  },
  sampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sampleMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sampleCategory: {
    fontSize: 12,
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sampleDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  addSampleButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
});
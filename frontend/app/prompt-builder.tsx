import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const promptTypes = [
  { id: 'creative', name: 'Creative writing prompt' },
  { id: 'reflection', name: 'Self-reflection prompt' },
  { id: 'incubation', name: 'Dream Incubation Prompt' },
];

const maskingSounds = [
  { id: 'white', name: 'White Noise' },
  { id: 'ambient', name: 'Ambient Tone (Low Frequency)' },
];

export default function PromptBuilderScreen() {
  const [activeTab, setActiveTab] = useState('affirmation');
  
  // Affirmation states
  const [affirmationText, setAffirmationText] = useState('');
  
  // Prompt states
  const [selectedPromptType, setSelectedPromptType] = useState('creative');
  const [themeKeyword, setThemeKeyword] = useState('');
  
  // Binaural Beat states
  const [carrierFreq, setCarrierFreq] = useState('');
  const [beatFreq, setBeatFreq] = useState('');
  const [duration, setDuration] = useState('');
  const [volume, setVolume] = useState('');
  
  // Subliminal Audio states
  const [subliminalText, setSubliminalText] = useState('');
  const [maskingSound, setMaskingSound] = useState('white');
  const [subliminalDuration, setSubliminalDuration] = useState('');
  const [subliminalVolume, setSubliminalVolume] = useState('');
  const [maskingVolume, setMaskingVolume] = useState('');
  
  const [pastPrompts] = useState([
    {
      id: '1',
      type: 'Affirmation',
      content: 'I am aware in my dreams and can control them',
      date: '2024-01-15',
    },
    {
      id: '2',
      type: 'Creative Prompt',
      content: 'Write about a dream where you can fly through different dimensions',
      date: '2024-01-14',
    },
  ]);
  
  const [generatedAudio] = useState([
    {
      id: '1',
      title: 'Lucid Dream Affirmation',
      type: 'Affirmation',
      duration: '10 min',
      date: '2024-01-15',
    },
    {
      id: '2',
      title: 'Alpha Wave Binaural Beat',
      type: 'Binaural Beat',
      duration: '30 min',
      date: '2024-01-14',
    },
  ]);

  const handleGenerateAffirmation = () => {
    if (!affirmationText.trim()) {
      Alert.alert('Error', 'Please enter affirmation text');
      return;
    }
    
    Alert.alert('Affirmation Generated', 'Your personalized affirmation audio has been generated and added to your audio library!');
    setAffirmationText('');
  };

  const handleGeneratePrompt = () => {
    if (!themeKeyword.trim()) {
      Alert.alert('Error', 'Please enter a theme or keyword');
      return;
    }
    
    const prompts = {
      creative: `Write a story about ${themeKeyword} in a dream world where the laws of physics don't apply. What adventures unfold?`,
      reflection: `Reflect on how ${themeKeyword} appears in your dreams. What might this symbolize in your waking life?`,
      incubation: `Tonight, as you fall asleep, focus on ${themeKeyword}. Set the intention to dream about this theme and remember the details.`
    };
    
    Alert.alert('Prompt Generated', prompts[selectedPromptType as keyof typeof prompts]);
    setThemeKeyword('');
  };

  const handleGenerateBinauralBeat = () => {
    if (!carrierFreq || !beatFreq || !duration || !volume) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    Alert.alert('Binaural Beat Generated', 'Your custom binaural beat has been generated and saved to your audio library!');
    setCarrierFreq('');
    setBeatFreq('');
    setDuration('');
    setVolume('');
  };

  const handleGenerateSubliminal = () => {
    if (!subliminalText.trim() || !subliminalDuration || !subliminalVolume || !maskingVolume) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    Alert.alert('Subliminal Audio Generated', 'Your subliminal audio has been generated and added to your audio library!');
    setSubliminalText('');
    setSubliminalDuration('');
    setSubliminalVolume('');
    setMaskingVolume('');
  };

  const renderAffirmationTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Generate Affirmation for Audio</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>What affirmation would you like for sleep/lucid dreaming?</Text>
        <TextInput
          style={styles.textArea}
          placeholder="I am aware in my dreams and can control them..."
          multiline
          value={affirmationText}
          onChangeText={setAffirmationText}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, !affirmationText.trim() && styles.buttonDisabled]}
        onPress={handleGenerateAffirmation}
        disabled={!affirmationText.trim()}
      >
        <Text style={styles.primaryButtonText}>Generate Affirmation</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderPromptTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Generate Creative & Reflection Prompts</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prompt Type</Text>
        <View style={styles.multiChoiceContainer}>
          {promptTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.choiceButton,
                selectedPromptType === type.id && styles.choiceButtonActive
              ]}
              onPress={() => setSelectedPromptType(type.id)}
            >
              <Text style={[
                styles.choiceButtonText,
                selectedPromptType === type.id && styles.choiceButtonTextActive
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Theme/Keyword</Text>
        <TextInput
          style={styles.textInput}
          placeholder="flying, water, childhood, etc."
          value={themeKeyword}
          onChangeText={setThemeKeyword}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, !themeKeyword.trim() && styles.buttonDisabled]}
        onPress={handleGeneratePrompt}
        disabled={!themeKeyword.trim()}
      >
        <Text style={styles.primaryButtonText}>Generate Prompt</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderBinauralTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Binaural Beat Generator</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Carrier Frequency (Hz)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="440"
          value={carrierFreq}
          onChangeText={setCarrierFreq}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Beat Frequency (Hz)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="10"
          value={beatFreq}
          onChangeText={setBeatFreq}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="30"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Volume (dBFS)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="-20"
          value={volume}
          onChangeText={setVolume}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, (!carrierFreq || !beatFreq || !duration || !volume) && styles.buttonDisabled]}
        onPress={handleGenerateBinauralBeat}
        disabled={!carrierFreq || !beatFreq || !duration || !volume}
      >
        <Text style={styles.primaryButtonText}>Generate Binaural Beat</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSubliminalTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Subliminal Audio Generator</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Affirmation Text</Text>
        <TextInput
          style={styles.textArea}
          placeholder="I will have lucid dreams tonight..."
          multiline
          value={subliminalText}
          onChangeText={setSubliminalText}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Masking Sound</Text>
        <View style={styles.multiChoiceContainer}>
          {maskingSounds.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.choiceButton,
                maskingSound === sound.id && styles.choiceButtonActive
              ]}
              onPress={() => setMaskingSound(sound.id)}
            >
              <Text style={[
                styles.choiceButtonText,
                maskingSound === sound.id && styles.choiceButtonTextActive
              ]}>
                {sound.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Duration (minutes)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="20"
          value={subliminalDuration}
          onChangeText={setSubliminalDuration}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Subliminal Volume (dBFS)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="-40"
          value={subliminalVolume}
          onChangeText={setSubliminalVolume}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Masking Volume (dBFS)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="-20"
          value={maskingVolume}
          onChangeText={setMaskingVolume}
          keyboardType="numeric"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, (!subliminalText.trim() || !subliminalDuration || !subliminalVolume || !maskingVolume) && styles.buttonDisabled]}
        onPress={handleGenerateSubliminal}
        disabled={!subliminalText.trim() || !subliminalDuration || !subliminalVolume || !maskingVolume}
      >
        <Text style={styles.primaryButtonText}>Generate Subliminal Audio</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Past Prompts & Generated Audio</Text>
      
      <View style={styles.historySection}>
        <Text style={styles.subsectionTitle}>Past Prompts</Text>
        {pastPrompts.map((prompt) => (
          <View key={prompt.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyType}>{prompt.type}</Text>
              <Text style={styles.historyDate}>{prompt.date}</Text>
            </View>
            <Text style={styles.historyContent}>{prompt.content}</Text>
          </View>
        ))}
      </View>
      
      <View style={styles.historySection}>
        <Text style={styles.subsectionTitle}>Generated Audio</Text>
        {generatedAudio.map((audio) => (
          <View key={audio.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>{audio.title}</Text>
              <Text style={styles.historyDate}>{audio.date}</Text>
            </View>
            <View style={styles.audioMeta}>
              <Text style={styles.historyType}>{audio.type}</Text>
              <Text style={styles.audioDuration}>{audio.duration}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'affirmation', name: 'Affirmation' },
    { id: 'prompt', name: 'Prompts' },
    { id: 'binaural', name: 'Binaural' },
    { id: 'subliminal', name: 'Subliminal' },
    { id: 'history', name: 'History' },
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
        <Text style={styles.headerTitle}>Prompt Builder</Text>
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
        {activeTab === 'affirmation' && renderAffirmationTab()}
        {activeTab === 'prompt' && renderPromptTab()}
        {activeTab === 'binaural' && renderBinauralTab()}
        {activeTab === 'subliminal' && renderSubliminalTab()}
        {activeTab === 'history' && renderHistoryTab()}
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
    paddingVertical: 8,
    borderRadius: 8,
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
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
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
  multiChoiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  choiceButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  choiceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  choiceButtonTextActive: {
    color: 'white',
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
  historySection: {
    marginBottom: 24,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  historyContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
  },
  audioMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  audioDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
});
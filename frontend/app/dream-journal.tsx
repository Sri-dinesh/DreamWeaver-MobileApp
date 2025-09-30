import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const emotions = [
  { id: 'happy', name: 'Happy' },
  { id: 'sad', name: 'Sad' },
  { id: 'anxious', name: 'Anxious' },
  { id: 'neutral', name: 'Neutral' },
  { id: 'calm', name: 'Calm' },
  { id: 'excited', name: 'Excited' },
  { id: 'others', name: 'Others' },
];

const visibilityOptions = [
  { id: 'private', name: 'Private (only Me)' },
  { id: 'friends', name: 'Friends only' },
  { id: 'public', name: 'Public' },
];

const lucidOptions = [
  { id: 'all', name: 'All' },
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
];

export default function DreamJournalScreen() {
  const [activeTab, setActiveTab] = useState('record');
  
  // Record dream states
  const [dreamContent, setDreamContent] = useState('');
  const [primaryEmotion, setPrimaryEmotion] = useState('neutral');
  const [tags, setTags] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [visibility, setVisibility] = useState('private');
  
  // Search & filter states
  const [searchContent, setSearchContent] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lucidFilter, setLucidFilter] = useState('all');
  
  const [mockDreams] = useState([
    {
      id: '1',
      content: 'I was flying over a beautiful landscape with mountains and rivers...',
      emotion: 'excited',
      tags: 'flying, landscape, mountains',
      lucid: true,
      visibility: 'public',
      date: '2024-01-15',
    },
    {
      id: '2',
      content: 'Walking through a mysterious forest with glowing trees...',
      emotion: 'calm',
      tags: 'forest, mystery, nature',
      lucid: false,
      visibility: 'friends',
      date: '2024-01-14',
    },
  ]);

  const handleSaveDream = () => {
    if (!dreamContent.trim()) {
      Alert.alert('Error', 'Please enter dream content');
      return;
    }
    
    Alert.alert('Success', 'Dream saved successfully!', [
      { text: 'OK', onPress: () => {
        setDreamContent('');
        setTags('');
        setIsLucid(false);
        setPrimaryEmotion('neutral');
        setVisibility('private');
      }}
    ]);
  };

  const handleAnalyzeWithAI = () => {
    if (!dreamContent.trim()) {
      Alert.alert('Error', 'Please enter dream content first');
      return;
    }
    
    Alert.alert(
      'AI Analysis',
      'Your dream suggests themes of freedom and exploration. The flying symbolizes your desire to overcome limitations. Consider practicing reality checks to increase lucid awareness.',
      [{ text: 'OK' }]
    );
  };

  const handleApplyFilters = () => {
    Alert.alert('Filters Applied', 'Search and filter results updated');
  };

  const renderRecordTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Record New Dream</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Dream Content</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your dream in detail..."
          multiline
          value={dreamContent}
          onChangeText={setDreamContent}
          textAlignVertical="top"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Primary Emotion</Text>
        <View style={styles.multiChoiceContainer}>
          {emotions.map((emotion) => (
            <TouchableOpacity
              key={emotion.id}
              style={[
                styles.choiceButton,
                primaryEmotion === emotion.id && styles.choiceButtonActive
              ]}
              onPress={() => setPrimaryEmotion(emotion.id)}
            >
              <Text style={[
                styles.choiceButtonText,
                primaryEmotion === emotion.id && styles.choiceButtonTextActive
              ]}>
                {emotion.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tags</Text>
        <TextInput
          style={styles.textInput}
          placeholder="flying, water, people (comma separated)"
          value={tags}
          onChangeText={setTags}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lucid Dream?</Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsLucid(!isLucid)}
        >
          <View style={[styles.checkbox, isLucid && styles.checkboxActive]}>
            {isLucid && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, this was a lucid dream</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Visibility</Text>
        <View style={styles.multiChoiceContainer}>
          {visibilityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.choiceButton,
                visibility === option.id && styles.choiceButtonActive
              ]}
              onPress={() => setVisibility(option.id)}
            >
              <Text style={[
                styles.choiceButtonText,
                visibility === option.id && styles.choiceButtonTextActive
              ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.primaryButton, !dreamContent.trim() && styles.buttonDisabled]}
          onPress={handleSaveDream}
          disabled={!dreamContent.trim()}
        >
          <Text style={styles.primaryButtonText}>Save Dream</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, !dreamContent.trim() && styles.buttonDisabled]}
          onPress={handleAnalyzeWithAI}
          disabled={!dreamContent.trim()}
        >
          <Ionicons name="sparkles" size={18} color={dreamContent.trim() ? "#7C3AED" : "#9CA3AF"} />
          <Text style={[styles.secondaryButtonText, !dreamContent.trim() && styles.buttonTextDisabled]}>
            Analyze with AI
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderSearchTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Search & Filter Dreams</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Search Dream Content</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Search dream content..."
          value={searchContent}
          onChangeText={setSearchContent}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Filter by Tags</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Filter by tags..."
          value={filterTags}
          onChangeText={setFilterTags}
        />
      </View>
      
      <View style={styles.dateContainer}>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>From Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={fromDate}
            onChangeText={setFromDate}
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>To Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            value={toDate}
            onChangeText={setToDate}
          />
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lucid Dream</Text>
        <View style={styles.multiChoiceContainer}>
          {lucidOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.choiceButton,
                lucidFilter === option.id && styles.choiceButtonActive
              ]}
              onPress={() => setLucidFilter(option.id)}
            >
              <Text style={[
                styles.choiceButtonText,
                lucidFilter === option.id && styles.choiceButtonTextActive
              ]}>
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleApplyFilters}
      >
        <Text style={styles.primaryButtonText}>Apply Filters</Text>
      </TouchableOpacity>
      
      <View style={styles.resultsSection}>
        <Text style={styles.subsectionTitle}>Search Results</Text>
        {mockDreams.map((dream) => (
          <View key={dream.id} style={styles.dreamCard}>
            <View style={styles.dreamHeader}>
              <Text style={styles.dreamDate}>{dream.date}</Text>
              {dream.lucid && (
                <View style={styles.lucidBadge}>
                  <Text style={styles.lucidBadgeText}>Lucid</Text>
                </View>
              )}
            </View>
            <Text style={styles.dreamContent} numberOfLines={2}>
              {dream.content}
            </Text>
            <View style={styles.dreamMeta}>
              <Text style={styles.dreamEmotion}>Emotion: {dream.emotion}</Text>
              <Text style={styles.dreamTags}>Tags: {dream.tags}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'record', name: 'Record Dream' },
    { id: 'search', name: 'Search & Filter' },
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
        <Text style={styles.headerTitle}>Dream Journal</Text>
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
        {activeTab === 'record' ? renderRecordTab() : renderSearchTab()}
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
    minHeight: 120,
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
    borderRadius: 16,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
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
  resultsSection: {
    marginTop: 24,
  },
  dreamCard: {
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
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dreamDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  lucidBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  lucidBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  dreamContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  dreamMeta: {
    gap: 4,
  },
  dreamEmotion: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  dreamTags: {
    fontSize: 12,
    color: '#6B7280',
  },
});
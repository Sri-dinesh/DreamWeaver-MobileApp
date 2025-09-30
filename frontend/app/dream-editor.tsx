import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const emotions = [
  { id: 'happy', name: 'Happy', color: '#10B981', icon: 'happy-outline' },
  { id: 'sad', name: 'Sad', color: '#6B7280', icon: 'sad-outline' },
  { id: 'anxious', name: 'Anxious', color: '#F59E0B', icon: 'alert-circle-outline' },
  { id: 'neutral', name: 'Neutral', color: '#8B5CF6', icon: 'remove-outline' },
  { id: 'calm', name: 'Calm', color: '#3B82F6', icon: 'leaf-outline' },
  { id: 'excited', name: 'Excited', color: '#EF4444', icon: 'flash-outline' },
  { id: 'others', name: 'Others', color: '#6B7280', icon: 'ellipsis-horizontal' },
];

const visibilityOptions = [
  { id: 'private', name: 'Private (Only Me)', icon: 'lock-closed-outline', description: 'Only you can see this dream' },
  { id: 'friends', name: 'Friends Only', icon: 'people-outline', description: 'Visible to your friends' },
  { id: 'public', name: 'Public', icon: 'globe-outline', description: 'Everyone can see this dream' },
];

export default function DreamEditorScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('neutral');
  const [tags, setTags] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please add a title and describe your dream');
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      Alert.alert('Dream Saved! ✨', 'Your dream has been added to your journal', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save dream. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!content.trim()) {
      Alert.alert('No Dream Content', 'Please describe your dream first');
      return;
    }
    
    Alert.alert(
      'AI Dream Analysis 🔮',
      'Your dream reveals themes of transformation and growth. The symbols suggest you\'re processing changes in your life. Consider practicing reality checks to increase lucid awareness.',
      [{ text: 'Fascinating!' }]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4C1D95" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Dream Entry</Text>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Title</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Give your dream a memorable title..."
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Description</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.contentInput}
              placeholder="Describe your dream in vivid detail... What did you see, feel, and experience?"
              placeholderTextColor="#9CA3AF"
              multiline
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Emotions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary Emotion</Text>
          <View style={styles.emotionsGrid}>
            {emotions.map((emotion) => (
              <TouchableOpacity
                key={emotion.id}
                style={[
                  styles.emotionCard,
                  selectedEmotion === emotion.id && styles.emotionCardSelected,
                  { borderColor: selectedEmotion === emotion.id ? emotion.color : '#E5E7EB' }
                ]}
                onPress={() => setSelectedEmotion(emotion.id)}
              >
                <View style={[styles.emotionIcon, { backgroundColor: `${emotion.color}20` }]}>
                  <Ionicons name={emotion.icon as any} size={20} color={emotion.color} />
                </View>
                <Text style={[
                  styles.emotionText,
                  selectedEmotion === emotion.id && { color: emotion.color }
                ]}>
                  {emotion.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="flying, water, family, adventure..."
              placeholderTextColor="#9CA3AF"
              value={tags}
              onChangeText={setTags}
            />
          </View>
          <Text style={styles.helperText}>Separate tags with commas</Text>
        </View>

        {/* Lucid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lucid Dream</Text>
          <TouchableOpacity
            style={styles.lucidContainer}
            onPress={() => setIsLucid(!isLucid)}
          >
            <View style={[styles.checkbox, isLucid && styles.checkboxActive]}>
              {isLucid && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <View style={styles.lucidContent}>
              <Text style={styles.lucidTitle}>This was a lucid dream</Text>
              <Text style={styles.lucidDescription}>I was aware I was dreaming</Text>
            </View>
            {isLucid && (
              <View style={styles.lucidBadge}>
                <Ionicons name="flash" size={16} color="#10B981" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Visibility */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visibility</Text>
          <View style={styles.visibilityOptions}>
            {visibilityOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.visibilityCard,
                  visibility === option.id && styles.visibilityCardSelected
                ]}
                onPress={() => setVisibility(option.id)}
              >
                <View style={styles.visibilityIcon}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={visibility === option.id ? '#7C3AED' : '#6B7280'} 
                  />
                </View>
                <View style={styles.visibilityContent}>
                  <Text style={[
                    styles.visibilityTitle,
                    visibility === option.id && styles.visibilityTitleSelected
                  ]}>
                    {option.name}
                  </Text>
                  <Text style={styles.visibilityDescription}>{option.description}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  visibility === option.id && styles.radioButtonSelected
                ]}>
                  {visibility === option.id && (
                    <View style={styles.radioButtonInner} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Button */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.aiButton} onPress={handleAnalyzeWithAI}>
            <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.aiButtonGradient}>
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.aiButtonText}>Analyze with AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
  headerGradient: { paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#4C1D95' },
  saveButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 16, paddingVertical: 24 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  titleInput: { fontSize: 18, fontWeight: '600', color: '#1F2937', padding: 20, minHeight: 60 },
  contentInput: { fontSize: 16, color: '#1F2937', padding: 20, minHeight: 150, lineHeight: 24 },
  textInput: { fontSize: 16, color: '#1F2937', padding: 20, minHeight: 60 },
  helperText: { fontSize: 14, color: '#6B7280', marginTop: 8, marginLeft: 4 },
  emotionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emotionCard: {
    width: '30%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emotionCardSelected: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emotionIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  emotionText: { fontSize: 14, fontWeight: '600', color: '#4B5563', textAlign: 'center' },
  lucidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checkboxActive: { borderColor: '#10B981', backgroundColor: '#10B981' },
  lucidContent: { flex: 1 },
  lucidTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  lucidDescription: { fontSize: 14, color: '#6B7280' },
  lucidBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityOptions: { gap: 12 },
  visibilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    padding: 12,
  },
  visibilityCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.02)',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  visibilityIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  visibilityContent: { flex: 1 },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  visibilityTitleSelected: { color: '#7C3AED' },
  visibilityDescription: { fontSize: 14, color: '#6B7280' },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: { borderColor: '#7C3AED' },
  radioButtonInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7C3AED' },
  actionButtons: { marginTop: 16 },
  aiButton: {
    borderRadius: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingVertical: 12,
    gap: 10,
  },
  aiButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
  bottomPadding: { height: 40 },
});

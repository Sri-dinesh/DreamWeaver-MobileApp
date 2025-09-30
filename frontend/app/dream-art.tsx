import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DreamArtScreen() {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // AI generation states
  const [aiPrompt, setAiPrompt] = useState('');
  
  const [artCollection] = useState([
    {
      id: '1',
      title: 'Flying Dream Landscape',
      description: 'A surreal landscape from my flying dream',
      type: 'Uploaded',
      date: '2024-01-15',
      imageUrl: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    {
      id: '2',
      title: 'Underwater City',
      description: 'AI generated underwater cityscape',
      type: 'Generated',
      date: '2024-01-14',
      imageUrl: 'https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
    {
      id: '3',
      title: 'Mystical Forest',
      description: 'Dream-inspired forest scene',
      type: 'Uploaded',
      date: '2024-01-13',
      imageUrl: 'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=300',
    },
  ]);

  const handleImageSelect = () => {
    // Mock image selection
    setSelectedImage('example-image.jpg');
    Alert.alert('Image Selected', 'Image file selected successfully');
  };

  const handleUploadArt = () => {
    if (!selectedImage || !title.trim()) {
      Alert.alert('Error', 'Please select an image and enter a title');
      return;
    }
    
    Alert.alert('Success', 'Dream art uploaded successfully!', [
      { text: 'OK', onPress: () => {
        setSelectedImage(null);
        setTitle('');
        setDescription('');
      }}
    ]);
  };

  const handleGenerateImage = () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt for AI image generation');
      return;
    }
    
    Alert.alert('Image Generated', 'Your AI dream image has been generated and added to your collection!', [
      { text: 'OK', onPress: () => setAiPrompt('') }
    ]);
  };

  const renderUploadTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Upload Your Own Dream Art</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Image File (PNG, JPG, GIF, WEBP)</Text>
        <TouchableOpacity
          style={styles.fileSelector}
          onPress={handleImageSelect}
        >
          <Ionicons name="image-outline" size={24} color="#7C3AED" />
          <Text style={styles.fileSelectorText}>
            {selectedImage ? selectedImage : 'Choose Image File'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Title (e.g., My Flying Dream)</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter artwork title..."
          value={title}
          onChangeText={setTitle}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your dream art..."
          multiline
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, (!selectedImage || !title.trim()) && styles.buttonDisabled]}
        onPress={handleUploadArt}
        disabled={!selectedImage || !title.trim()}
      >
        <Text style={styles.primaryButtonText}>Upload Artwork</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderGenerateTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Generate AI Dream Image (Placeholder)</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prompt for AI Image</Text>
        <TextInput
          style={styles.textArea}
          placeholder="A floating castle in the clouds surrounded by glowing butterflies..."
          multiline
          value={aiPrompt}
          onChangeText={setAiPrompt}
          textAlignVertical="top"
        />
      </View>
      
      <TouchableOpacity
        style={[styles.primaryButton, !aiPrompt.trim() && styles.buttonDisabled]}
        onPress={handleGenerateImage}
        disabled={!aiPrompt.trim()}
      >
        <Ionicons name="sparkles" size={18} color={aiPrompt.trim() ? "white" : "#9CA3AF"} style={styles.buttonIcon} />
        <Text style={styles.primaryButtonText}>Generate Image</Text>
      </TouchableOpacity>
      
      <View style={styles.placeholderNote}>
        <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
        <Text style={styles.placeholderText}>
          AI image generation is currently a placeholder feature. This will generate mock results for demonstration.
        </Text>
      </View>
    </ScrollView>
  );

  const renderCollectionTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Your Dream Art Collection</Text>
      
      <View style={styles.artGrid}>
        {artCollection.map((art) => (
          <View key={art.id} style={styles.artCard}>
            <Image source={{ uri: art.imageUrl }} style={styles.artImage} />
            <View style={styles.artInfo}>
              <Text style={styles.artTitle}>{art.title}</Text>
              <Text style={styles.artDescription} numberOfLines={2}>{art.description}</Text>
              <View style={styles.artMeta}>
                <Text style={styles.artType}>{art.type}</Text>
                <Text style={styles.artDate}>{art.date}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'upload', name: 'Upload Art' },
    { id: 'generate', name: 'Generate AI' },
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
        <Text style={styles.headerTitle}>Dream Art</Text>
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
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'collection' && renderCollectionTab()}
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
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: -8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  placeholderNote: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    gap: 12,
  },
  placeholderText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  artGrid: {
    gap: 16,
  },
  artCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  artImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  artInfo: {
    padding: 16,
  },
  artTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  artDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  artMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  artDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
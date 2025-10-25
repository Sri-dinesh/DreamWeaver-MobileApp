import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioLibraryService } from '@/services/audioLibraryService';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface AudioUploadTabProps {
  onUploadSuccess: () => void;
}

export default function AudioUploadTab({ onUploadSuccess }: AudioUploadTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('meditation');
  const [visibility, setVisibility] = useState('private');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const categories = [
    { value: 'meditation', label: 'Meditation' },
    { value: 'binaural', label: 'Binaural Beats' },
    { value: 'nature', label: 'Nature Sounds' },
    { value: 'guidance', label: 'Guided Sessions' },
    { value: 'other', label: 'Other' },
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' },
  ];

 const pickAudioFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',  // This correctly filters for audio files only
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const file = result.assets[0];
      
      // Check file size (50MB limit)
      if (file.size && file.size > 50 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select a file smaller than 50MB');
        return;
      }
      
      setSelectedFile(file);
    }
  } catch (error) {
    console.error('Error picking file:', error);
    Alert.alert('Error', 'Failed to pick audio file');
  }
};
  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No file selected', 'Please select an audio file to upload');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your audio file');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Create FormData
      const formData = new FormData();
      
      // Read file as base64 string and send to backend
      // Handle platform differences (web vs mobile)
      let base64Data: string;
      
      if (Platform.OS === 'web') {
        // For web, we need to fetch the file and convert to base64
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            // Remove the data URL prefix (e.g., "data:audio/mp3;base64,")
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // For mobile, use expo-file-system
        base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64
        });
      }
      
      // Send metadata and base64 data
      formData.append('fileName', selectedFile.name || `audio_${Date.now()}.mp3`);
      formData.append('mimeType', selectedFile.mimeType || selectedFile.type || 'audio/mpeg');
      formData.append('data', base64Data);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('visibility', visibility);
      
      // Debug logs
      // console.log('Uploading file:', {
      //   name: selectedFile.name,
      //   uri: selectedFile.uri,
      //   mimeType: selectedFile.mimeType || selectedFile.type,
      //   size: selectedFile.size,
      // });
      // console.log('Sending base64 data to backend');

      await audioLibraryService.uploadAudio(formData);
      
      Alert.alert('Success', 'Audio file uploaded successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      
      // Notify parent of success
      onUploadSuccess();
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Provide more user-friendly error messages
      let errorMessage = error.message || 'Failed to upload audio file';
      
      // Check if it's a network error
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout') || error.message.includes('Network Error') || error.message.includes('No response')) {
        errorMessage = 'Upload timed out. Please check your internet connection and try again. For large files, this may take a minute.';
      } 
      // Check if it's a server error
      else if (error.response?.status === 413 || errorMessage.includes('413')) {
        errorMessage = 'File too large. Please select a smaller audio file (max 50MB).';
      }
      // Check if it's a file type error
      else if (error.response?.status === 400 && errorMessage.includes('Only audio files')) {
        errorMessage = 'Invalid file type. Please select an audio file.';
      }
      // Check for other network issues
      else if (!error.response) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      }
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Upload Audio File</Text>
        
        <TouchableOpacity style={styles.filePicker} onPress={pickAudioFile}>
          <Ionicons name="musical-note" size={24} color="#7C3AED" />
          <Text style={styles.filePickerText}>
            {selectedFile ? selectedFile.name : 'Select Audio File'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#7C3AED" />
        </TouchableOpacity>
        
        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{selectedFile.name}</Text>
            <Text style={styles.fileSize}>
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
        )}
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter a title for your audio file"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your audio file (optional)"
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.optionsContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.option,
                  category === cat.value && styles.selectedOption,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    category === cat.value && styles.selectedOptionText,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* <View style={styles.inputGroup}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.optionsContainer}>
            {visibilityOptions.map((vis) => (
              <TouchableOpacity
                key={vis.value}
                style={[
                  styles.option,
                  visibility === vis.value && styles.selectedOption,
                ]}
                onPress={() => setVisibility(vis.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    visibility === vis.value && styles.selectedOptionText,
                  ]}
                >
                  {vis.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}
        
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.uploadButtonText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
              <Text style={styles.uploadButtonText}>Upload Audio</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>
            🎵 Explore our Public Audio Library in the Collections tab to discover pre-uploaded meditation music and affirmations!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  filePickerText: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 12,
  },
  fileInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  fileSize: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  inputGroup: {
    marginTop: 10
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  selectedOption: {
    backgroundColor: '#7C3AED',
  },
  optionText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  hintContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

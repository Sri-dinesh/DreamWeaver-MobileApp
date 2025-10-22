import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { audioLibraryService } from '@/services/audioLibraryService';

interface AudioCollectionsTabProps {
  audioFiles: any[];
  publicAudioFiles: any[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteSuccess: () => void;
}

interface PublicAudioFile {
  id: string;
  title: string;
  description: string;
  category: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  duration_seconds: number;
  visibility: string;
  created_at: string;
  is_public: boolean;
}

export default function AudioCollectionsTab({
  audioFiles,
  publicAudioFiles = [],
  loading,
  onRefresh,
  onDeleteSuccess,
}: AudioCollectionsTabProps) {
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayingId, setCurrentPlayingId] = useState<number | string | null>(null);

  // Clean up sound when component unmounts
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleDelete = (id: number, title: string) => {
    Alert.alert(
      'Delete Audio File',
      `Are you sure you want to delete "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAudioFile(id),
        },
      ]
    );
  };

  // Play audio file
  const playAudio = async (fileUrl: string, fileId: number | string) => {
    try {
      // If there's already a sound playing, stop it
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      
      // If clicking the same file that's already playing, pause it
      if (currentPlayingId === fileId && isPlaying) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        return;
      }
      
      console.log('Loading audio from:', fileUrl);
      
      // Load and play the audio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(fileId);
      
      // Play the sound
      await newSound.playAsync();
      
      // Set up listener for when sound finishes
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
          newSound.unloadAsync();
          setSound(null);
        }
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio file');
      setIsPlaying(false);
      setCurrentPlayingId(null);
      setSound(null);
    }
  };

  // Stop currently playing audio
  const stopAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
      } catch (error) {
        console.error('Error stopping audio:', error);
      } finally {
        setSound(null);
        setIsPlaying(false);
        setCurrentPlayingId(null);
      }
    }
  };

  const deleteAudioFile = async (id: number) => {
    try {
      // Stop playback if this is the currently playing file
      if (currentPlayingId === id && sound) {
        await stopAudio();
      }
      
      setDeletingFileId(id);
      await audioLibraryService.deleteAudio(id);
      Alert.alert('Success', 'Audio file deleted successfully');
      onDeleteSuccess();
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete audio file');
    } finally {
      setDeletingFileId(null);
    }
  };

  const formatDuration = (seconds: number) => {
    // If duration is 0 or not available, show "Unknown"
    if (!seconds || seconds <= 0) {
      return 'Unknown';
    }
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const renderAudioItem = ({ item }: { item: any }) => {
    const isCurrentlyPlaying = currentPlayingId === item.id && isPlaying;
    const isDeleting = deletingFileId === item.id;
    const isPublicFile = item.is_public === true;
    
    return (
      <View style={[styles.audioCard, isCurrentlyPlaying && styles.audioCardPlaying]}>
        <View style={styles.audioInfo}>
          <View style={styles.audioHeader}>
            <Ionicons name="musical-note" size={20} color="#7C3AED" />
            <Text style={[styles.audioTitle, isCurrentlyPlaying && styles.audioTitlePlaying]} numberOfLines={1}>
              {item.title}
              {isPublicFile && (
                <Text style={{ fontSize: 12, color: '#6B7280' }}> (Public)</Text>
              )}
              {isCurrentlyPlaying && (
                <Text style={{ fontSize: 12, color: '#7C3AED' }}> • Playing</Text>
              )}
            </Text>
          </View>
          
          <Text style={styles.audioDescription} numberOfLines={2}>
            {item.description || 'No description provided'}
          </Text>
          
          <View style={styles.audioMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="folder" size={14} color="#6B7280" />
              <Text style={styles.metaText}>{item.category}</Text>
            </View>
            {/* Only show duration if it's available and greater than 0 */}
            {(item.duration_seconds > 0) && (
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color="#6B7280" />
                <Text style={styles.metaText}>
                  {formatDuration(item.duration_seconds)}
                </Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Ionicons name="document" size={14} color="#6B7280" />
              <Text style={styles.metaText}>
                {formatFileSize(item.file_size)}
              </Text>
            </View>
            {isPublicFile && (
              <View style={styles.metaItem}>
                <Ionicons name="globe" size={14} color="#6B7280" />
                <Text style={styles.metaText}>Public</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.audioActions}>
          <TouchableOpacity
            style={[styles.actionButton, currentPlayingId === item.id && isPlaying && styles.actionButtonPlaying]}
            onPress={() => playAudio(item.storage_url, item.id)}
          >
            <Ionicons 
              name={currentPlayingId === item.id && isPlaying ? "pause" : "play"} 
              size={20} 
              color="#7C3AED" 
            />
          </TouchableOpacity>
          
          {/* Only show delete button for user's private files */}
          {!isPublicFile && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id, item.title)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash" size={20} color="#EF4444" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading audio files...</Text>
      </View>
    );
  }

  // Combine user's private audios and public audios
  const allAudioFiles = [...audioFiles, ...publicAudioFiles];
  
  // Separate into sections for better organization
  const hasUserFiles = audioFiles.length > 0;
  const hasPublicFiles = publicAudioFiles.length > 0;
  
  if (!hasUserFiles && !hasPublicFiles) {
    return (
      <View style={styles.centerContent}>
        <Ionicons name="musical-note" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No audio files yet</Text>
        <Text style={styles.emptyText}>
          Upload your first audio file or explore public audio content
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    >
      {hasUserFiles && (
        <>
          <Text style={styles.sectionTitle}>Your Audio Files</Text>
          {audioFiles.map((item, index) => (
            <React.Fragment key={`user-${item.id || index}`}>
              {renderAudioItem({ item })}
            </React.Fragment>
          ))}
        </>
      )}
      
      {hasPublicFiles && (
        <>
          <Text style={[styles.sectionTitle, hasUserFiles && styles.sectionTitleWithMargin]}>Public Audio Library</Text>
          {publicAudioFiles.map((item, index) => (
            <React.Fragment key={`public-${item.id || index}`}>
              {renderAudioItem({ item })}
            </React.Fragment>
          ))}
        </>
      )}
      
      {!hasUserFiles && !hasPublicFiles && (
        <View style={styles.centerContent}>
          <Ionicons name="musical-note" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No audio files available</Text>
          <Text style={styles.emptyText}>
            Check back later for new public audio content
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 300,
  },
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitleWithMargin: {
    marginTop: 32,
  },
  listContainer: {
    paddingBottom: 20,
  },
  audioCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
  },
  audioInfo: {
    flex: 1,
    marginRight: 12,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  audioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  audioDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  audioMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  audioActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  audioCardPlaying: {
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  audioTitlePlaying: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  actionButtonPlaying: {
    backgroundColor: '#EDE9FE',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
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

  const playAudio = async (fileUrl: string, fileId: number | string) => {
    try {
      // If there's already a sound playing, stop/unload it
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      // If clicking the same file that's already playing, pause/stop it
      if (currentPlayingId === fileId && isPlaying) {
        setIsPlaying(false);
        setCurrentPlayingId(null);
        return;
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fileUrl },
        { shouldPlay: true }
      );

      setSound(newSound);
      setIsPlaying(true);
      setCurrentPlayingId(fileId);

      await newSound.playAsync();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          setCurrentPlayingId(null);
          newSound.unloadAsync().catch(() => {});
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
    if (!seconds || seconds <= 0) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const renderAudioItem = ({ item }: { item: any }) => {
    const isCurrentlyPlaying = currentPlayingId === item.id && isPlaying;
    const isDeleting = deletingFileId === item.id;
    const isPublicFile = item.is_public === true;

    return (
      <View style={[styles.audioCard, isCurrentlyPlaying && styles.audioCardPlaying]}>
        <View style={styles.audioInfo}>
          <View style={styles.audioHeader}>
            <Ionicons name="musical-note" size={18} color="#7C3AED" />
            <Text style={[styles.audioTitle, isCurrentlyPlaying && styles.audioTitlePlaying]} numberOfLines={1}>
              {item.title}
            </Text>
          </View>

          <Text style={styles.audioDescription} numberOfLines={2}>
            {item.description || 'No description provided'}
          </Text>

          <View style={styles.audioMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="folder" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{item.category || 'General'}</Text>
            </View>

            {item.duration_seconds > 0 && (
              <View style={styles.metaItem}>
                <Ionicons name="time" size={12} color="#6B7280" />
                <Text style={styles.metaText}>{formatDuration(item.duration_seconds)}</Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <Ionicons name="document" size={12} color="#6B7280" />
              <Text style={styles.metaText}>{formatFileSize(item.file_size)}</Text>
            </View>

            {isPublicFile && (
              <View style={styles.metaItem}>
                <Ionicons name="globe" size={12} color="#6B7280" />
                <Text style={styles.metaText}>Public</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.audioActions}>
          <TouchableOpacity
            style={[styles.actionButton, isCurrentlyPlaying && styles.actionButtonPlaying]}
            onPress={() => playAudio(item.storage_url, item.id)}
          >
            <Ionicons name={isCurrentlyPlaying ? 'pause' : 'play'} size={18} color="#7C3AED" />
          </TouchableOpacity>

          {!isPublicFile && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item.id, item.title)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="trash" size={16} color="#EF4444" />
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

  const sections = [
    { title: 'Your Audio Files', data: audioFiles || [] },
    { title: 'Public Audio Library', data: publicAudioFiles || [] },
  ].filter(s => s.data && s.data.length > 0);

  if (sections.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Ionicons name="musical-note" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No audio files yet</Text>
        <Text style={styles.emptyText}>Upload your first audio file or explore public audio content</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item: any, index) => (item.id ? String(item.id) : String(index))}
      renderItem={({ item }) => renderAudioItem({ item })}
      renderSectionHeader={({ section: { title } }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
      )}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
    />
  );
}

const styles = StyleSheet.create({
  // container-level
  contentContainer: {
    paddingVertical: 10,
    paddingBottom: 28,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 28,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 320,
  },

  // section header
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 8,
    marginTop: 12,
  },

  // audio card
  audioCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF2FF', // subtle border to separate cards
    alignItems: 'flex-start',
  },
  audioCardPlaying: {
    borderColor: '#7C3AED',
  },
  audioInfo: {
    flex: 1,
    marginRight: 8,
  },
  audioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  audioTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  audioTitlePlaying: {
    color: '#7C3AED',
  },
  audioDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  audioMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },

  // actions
  audioActions: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionButtonPlaying: {
    backgroundColor: '#EDE9FE',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/context/AuthContext';
import { audioLibraryService } from '@/services/audioLibraryService';
import AudioUploadTab from '@/components/audio-library/AudioUploadTab';
import AudioCollectionsTab from '@/components/audio-library/AudioCollectionsTab';

const { width } = Dimensions.get('window');

export default function AudioLibraryScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'collections'>('upload');
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [publicAudioFiles, setPublicAudioFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (activeTab === 'collections') {
      fetchAudioFiles();
      fetchPublicAudioFiles();
    }
  }, [activeTab]);

  const fetchAudioFiles = async () => {
    try {
      setLoading(true);
      const files = await audioLibraryService.getUserAudio();
      setAudioFiles(files);
    } catch (error) {
      console.error('Error fetching audio files:', error);
      Alert.alert('Error', 'Failed to load audio files');
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicAudioFiles = async () => {
    try {
      const files = await audioLibraryService.getPublicAudioFiles();
      setPublicAudioFiles(files);
    } catch (error) {
      console.error('Error fetching public audio files:', error);
      // Don't show alert for public files as they're optional
    }
  };

  useEffect(() => {
    if (activeTab === 'collections') {
      fetchAudioFiles();
      fetchPublicAudioFiles();
    }
  }, [activeTab]);

  const handleRefresh = async () => {
    if (activeTab === 'collections') {
      setRefreshing(true);
      await fetchAudioFiles();
      await fetchPublicAudioFiles();
      setRefreshing(false);
    }
  };

  const handleUploadSuccess = () => {
    // Switch to collections tab after successful upload
    setActiveTab('collections');
    // Refresh the collections
    fetchAudioFiles();
    fetchPublicAudioFiles();
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Audio Library</Text>
          <Text style={styles.headerSubtitle}>
            Upload and manage your audio files
          </Text>
        </View>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            Upload
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
          onPress={() => setActiveTab('collections')}
        >
          <Text style={[styles.tabText, activeTab === 'collections' && styles.activeTabText]}>
            Collections
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {activeTab === 'upload' ? (
          <AudioUploadTab onUploadSuccess={handleUploadSuccess} />
        ) : (
          <AudioCollectionsTab 
            audioFiles={audioFiles}
            publicAudioFiles={publicAudioFiles}
            loading={loading} 
            onRefresh={handleRefresh}
            onDeleteSuccess={fetchAudioFiles}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  headerGradient: {
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

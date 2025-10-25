import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { palette } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import { audioLibraryService } from '@/services/audioLibraryService';
import AudioUploadTab from '@/components/audio-library/AudioUploadTab';
import AudioCollectionsTab from '@/components/audio-library/AudioCollectionsTab';

export default function AudioLibraryScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'collections'>('upload');
  const [audioFiles, setAudioFiles] = useState<any[]>([]);
  const [publicAudioFiles, setPublicAudioFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

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
    }
  };

  const handleRefresh = async () => {
    if (activeTab === 'collections') {
      setRefreshing(true);
      await fetchAudioFiles();
      await fetchPublicAudioFiles();
      setRefreshing(false);
    }
  };

  const handleUploadSuccess = () => {
    setActiveTab('collections');
    fetchAudioFiles();
    fetchPublicAudioFiles();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Audio Library</Text>
        <View style={styles.rightAction} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={18}
            color={activeTab === 'upload' ? '#FFFFFF' : '#7C3AED'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'upload' && styles.activeTabText,
            ]}
          >
            Upload
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
          onPress={() => setActiveTab('collections')}
        >
          <Ionicons
            name="albums-outline"
            size={18}
            color={activeTab === 'collections' ? '#FFFFFF' : '#7C3AED'}
            style={styles.tabIcon}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'collections' && styles.activeTabText,
            ]}
          >
            Collections
          </Text>
        </TouchableOpacity>
      </View>

      {/* <ScrollView
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
      </ScrollView> */}
      {activeTab === 'upload' ? (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <AudioUploadTab onUploadSuccess={handleUploadSuccess} />
        </ScrollView>
      ) : (
        <View style={styles.content}>
          <AudioCollectionsTab
            audioFiles={audioFiles}
            publicAudioFiles={publicAudioFiles}
            loading={loading}
            onRefresh={handleRefresh}
            onDeleteSuccess={fetchAudioFiles}
          />
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  rightAction: {
    padding: 6,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    marginTop: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#7C3AED',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C3AED',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 16,
  },
});

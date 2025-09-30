import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AudioFile } from '@/types';

const mockAudioFiles: AudioFile[] = [
  {
    id: '1',
    title: 'Deep Sleep Meditation',
    description: 'A guided meditation to help you fall into deep, restful sleep',
    duration: 900, // 15 minutes in seconds
    url: 'https://example.com/audio1.mp3',
    category: 'meditation',
  },
  {
    id: '2',
    title: 'Lucid Dream Binaural Beats',
    description: 'Theta wave frequencies to enhance lucid dreaming',
    duration: 1800, // 30 minutes
    url: 'https://example.com/audio2.mp3',
    category: 'binaural',
  },
  {
    id: '3',
    title: 'Ocean Waves',
    description: 'Gentle ocean sounds for peaceful sleep',
    duration: 3600, // 60 minutes
    url: 'https://example.com/audio3.mp3',
    category: 'nature',
  },
  {
    id: '4',
    title: 'Dream Incubation Guide',
    description: 'Guided instructions for dream incubation techniques',
    duration: 1200, // 20 minutes
    url: 'https://example.com/audio4.mp3',
    category: 'guidance',
  },
];

const categories = [
  { id: 'all', name: 'All', icon: 'library-outline' as const },
  { id: 'meditation', name: 'Meditation', icon: 'leaf-outline' as const },
  { id: 'binaural', name: 'Binaural', icon: 'pulse-outline' as const },
  { id: 'nature', name: 'Nature', icon: 'water-outline' as const },
  { id: 'guidance', name: 'Guidance', icon: 'compass-outline' as const },
];

export default function AudioScreen() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredAudio = mockAudioFiles.filter(audio => {
    const matchesCategory = selectedCategory === 'all' || audio.category === selectedCategory;
    const matchesSearch = audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         audio.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (audioId: string) => {
    if (currentlyPlaying === audioId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(audioId);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      meditation: '#10B981',
      binaural: '#8B5CF6',
      nature: '#3B82F6',
      guidance: '#F59E0B',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Audio Library</Text>
            <Text style={styles.headerSubtitle}>Sounds for better sleep & dreams</Text>
          </View>
          <TouchableOpacity 
            style={styles.libraryButton}
            onPress={() => router.push('/audio-library')}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={styles.libraryButtonGradient}
            >
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search audio files..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={18} 
                color={selectedCategory === category.id ? 'white' : '#6B7280'} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView 
          style={styles.audioList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredAudio.map((audio) => (
            <TouchableOpacity key={audio.id} style={styles.audioCard}>
              <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.audioCardGradient}>
              <View style={styles.audioInfo}>
                <View style={styles.audioHeader}>
                  <Text style={styles.audioTitle}>{audio.title}</Text>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: `${getCategoryColor(audio.category)}20` }
                  ]}>
                    <Text style={[
                      styles.categoryBadgeText,
                      { color: getCategoryColor(audio.category) }
                    ]}>
                      {audio.category}
                    </Text>
                  </View>
                </View>
                <Text style={styles.audioDescription} numberOfLines={2}>
                  {audio.description}
                </Text>
                <Text style={styles.audioDuration}>
                  {formatDuration(audio.duration)}
                </Text>
              </View>
              
              <View style={styles.audioControls}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={() => handlePlayPause(audio.id)}
                >
                  <Ionicons 
                    name={currentlyPlaying === audio.id ? "pause" : "play"} 
                    size={20} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/prompt-builder')}
          >
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
            <Text style={styles.quickActionText}>Generate Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/audio-library')}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#7C3AED" />
            <Text style={styles.quickActionText}>Upload Audio</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  headerContent: {
    flex: 1,
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
  libraryButton: {
    borderRadius: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  libraryButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesContent: {
    paddingRight: 24,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  audioList: {
    flex: 1,
    marginBottom: 20,
  },
  audioCard: {
    marginBottom: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  audioCardGradient: {
    flexDirection: 'row',
    borderRadius: 6,
    padding: 20,
  },
  audioInfo: {
    flex: 1,
    marginRight: 16,
  },
  audioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  audioTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  audioDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  audioDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  audioControls: {
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    backgroundColor: '#7C3AED',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
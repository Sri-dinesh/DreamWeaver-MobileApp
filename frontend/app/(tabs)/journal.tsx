import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { DreamEntry } from '@/types';

const mockDreams: DreamEntry[] = [
  {
    id: '1',
    title: 'Flying Over Mountains',
    content: 'I was soaring above snow-capped mountains, feeling completely free...',
    tags: ['flying', 'mountains', 'freedom'],
    emotions: ['joy', 'excitement'],
    lucid: true,
    date: '2024-01-15',
    userId: '1',
  },
  {
    id: '2',
    title: 'Lost in a Library',
    content: 'Endless shelves of books, searching for something important...',
    tags: ['library', 'searching', 'books'],
    emotions: ['curiosity', 'confusion'],
    lucid: false,
    date: '2024-01-14',
    userId: '1',
  },
];

export default function JournalScreen() {
  const [dreams, setDreams] = useState<DreamEntry[]>(mockDreams);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredDreams = dreams.filter(dream =>
    dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dream.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Dream Journal</Text>
            <Text style={styles.headerSubtitle}>Capture your nocturnal adventures</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/dream-editor')}
          >
            <LinearGradient
              colors={['#7C3AED', '#A855F7']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add" size={24} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search dreams, tags, emotions..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/export-journal')}
          >
            <Ionicons name="download-outline" size={18} color="#7C3AED" />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.dreamsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredDreams.map((dream) => (
            <TouchableOpacity
              key={dream.id}
              style={styles.dreamCard}
              onPress={() => router.push(`/dream-detail/${dream.id}` as any)}
            >
              <LinearGradient
                colors={dream.lucid ? ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)'] : ['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 1)']}
                style={styles.dreamCardGradient}
              >
                <View style={styles.dreamHeader}>
                  <View style={styles.dreamTitleContainer}>
                    <Text style={styles.dreamTitle}>{dream.title}</Text>
                    {dream.lucid && (
                      <View style={styles.lucidBadge}>
                        <Ionicons name="flash" size={12} color="white" />
                        <Text style={styles.lucidBadgeText}>Lucid</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dreamDate}>
                    {new Date(dream.date).toLocaleDateString()}
                  </Text>
                </View>
                
                <Text style={styles.dreamContent} numberOfLines={2}>
                  {dream.content}
                </Text>
                
                <View style={styles.dreamFooter}>
                  <View style={styles.dreamTags}>
                    {dream.tags.slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>#{tag}</Text>
                      </View>
                    ))}
                    {dream.tags.length > 3 && (
                      <Text style={styles.moreTagsText}>+{dream.tags.length - 3}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
          
          {filteredDreams.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="moon-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No dreams found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search terms' : 'Start by recording your first dream'}
              </Text>
            </View>
          )}
        </ScrollView>
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
  addButton: {
    borderRadius: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 16,
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
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  actionButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  dreamsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  dreamCard: {
    marginBottom: 16,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dreamCardGradient: {
    borderRadius: 6,
    padding: 24,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dreamTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  dreamTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 12,
    lineHeight: 26,
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  lucidBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  dreamDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  dreamContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  dreamFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
  moreTagsText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});
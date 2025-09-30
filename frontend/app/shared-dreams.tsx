import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SharedDreamsScreen() {
  const [activeTab, setActiveTab] = useState('friends');
  
  const [friendsDreams] = useState([
    {
      id: '1',
      title: 'Flying Through Clouds',
      content: 'I was soaring above fluffy white clouds, feeling completely free and weightless...',
      author: 'Alice Dream',
      likes: 15,
      comments: 4,
      date: '2024-01-15',
      tags: ['flying', 'freedom', 'clouds'],
    },
    {
      id: '2',
      title: 'Mystical Forest Journey',
      content: 'Walking through an enchanted forest with glowing mushrooms and talking animals...',
      author: 'Bob Explorer',
      likes: 12,
      comments: 7,
      date: '2024-01-14',
      tags: ['forest', 'mystical', 'animals'],
    },
  ]);
  
  const [publicDreams] = useState([
    {
      id: '3',
      title: 'Underwater City Adventure',
      content: 'Swimming through a magnificent underwater city with bioluminescent buildings...',
      author: 'Charlie Dreamer',
      likes: 28,
      comments: 12,
      date: '2024-01-15',
      tags: ['underwater', 'city', 'adventure'],
    },
    {
      id: '4',
      title: 'Time Travel Experience',
      content: 'Found myself in ancient Rome, walking through the bustling marketplace...',
      author: 'Diana Vision',
      likes: 22,
      comments: 9,
      date: '2024-01-14',
      tags: ['time-travel', 'history', 'rome'],
    },
    {
      id: '5',
      title: 'Space Station Dream',
      content: 'Floating in zero gravity aboard a futuristic space station, looking down at Earth...',
      author: 'Eve Lucid',
      likes: 35,
      comments: 15,
      date: '2024-01-13',
      tags: ['space', 'zero-gravity', 'earth'],
    },
  ]);

  const renderDreamCard = (dream: any) => (
    <View key={dream.id} style={styles.dreamCard}>
      <View style={styles.dreamHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{dream.author.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.authorName}>{dream.author}</Text>
            <Text style={styles.dreamDate}>{dream.date}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.dreamTitle}>{dream.title}</Text>
      <Text style={styles.dreamContent} numberOfLines={3}>{dream.content}</Text>
      
      <View style={styles.dreamTags}>
        {dream.tags.slice(0, 3).map((tag: string, index: number) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>#{tag}</Text>
          </View>
        ))}
        {dream.tags.length > 3 && (
          <Text style={styles.moreTagsText}>+{dream.tags.length - 3}</Text>
        )}
      </View>
      
      <View style={styles.dreamActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={18} color="#6B7280" />
          <Text style={styles.actionText}>{dream.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          <Text style={styles.actionText}>{dream.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Dreams From Friends</Text>
      <Text style={styles.sectionDescription}>
        Dreams shared with "friends only" visibility
      </Text>
      
      {friendsDreams.map(renderDreamCard)}
    </ScrollView>
  );

  const renderPublicTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Public Dreams</Text>
      <Text style={styles.sectionDescription}>
        Dreams shared with "public" visibility
      </Text>
      
      {publicDreams.map(renderDreamCard)}
    </ScrollView>
  );

  const tabs = [
    { id: 'friends', name: 'Dreams From Friends' },
    { id: 'public', name: 'Public Dreams' },
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
        <Text style={styles.headerTitle}>Shared Dreams</Text>
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
        {activeTab === 'friends' ? renderFriendsTab() : renderPublicTab()}
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  dreamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  dreamDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuButton: {
    padding: 4,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dreamContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  dreamTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dreamActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
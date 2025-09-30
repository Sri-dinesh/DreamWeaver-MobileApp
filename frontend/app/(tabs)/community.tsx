import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SharedDream, User } from '@/types';

const mockUser: User = {
  id: '2',
  name: 'Alice Dream',
  email: 'alice@example.com',
  username: 'alicedream',
  bio: 'Exploring the unconscious mind',
  createdAt: '2024-01-01',
};

const mockSharedDreams: SharedDream[] = [
  {
    id: '1',
    title: 'Flying Through Galaxies',
    content: 'Last night I found myself soaring through star-filled galaxies, each one more beautiful than the last. The sensation of weightlessness was incredible...',
    author: mockUser,
    likes: 24,
    comments: 8,
    isPublic: true,
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'Underwater City Adventure',
    content: 'I was swimming through an underwater city with bioluminescent buildings. Fish swam alongside me like guide animals...',
    author: { ...mockUser, name: 'Bob Explorer', username: 'bobexplorer' },
    likes: 18,
    comments: 5,
    isPublic: true,
    createdAt: '2024-01-14T22:15:00Z',
  },
];

const tabs = [
  { id: 'feed', name: 'Dream Feed', icon: 'newspaper-outline' as const },
  { id: 'friends', name: 'Friends', icon: 'people-outline' as const },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredDreams = mockSharedDreams.filter(dream =>
    dream.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dream.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dream.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderFeed = () => (
    <ScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dreams and dreamers..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={styles.shareButton}
        onPress={() => router.push('/share-dream')}
      >
        <Ionicons name="add-circle-outline" size={20} color="#7C3AED" />
        <Text style={styles.shareButtonText}>Share Your Dream</Text>
      </TouchableOpacity>

      {filteredDreams.map((dream) => (
        <TouchableOpacity 
          key={dream.id} 
          style={styles.dreamCard}
          onPress={() => router.push(`/dream-detail/${dream.id}` as any)}
        >
          <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.dreamCardGradient}>
          <View style={styles.dreamHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{dream.author.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.authorName}>{dream.author.name}</Text>
                <Text style={styles.dreamTime}>{formatTimeAgo(dream.createdAt)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.menuButton}>
              <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.dreamTitle}>{dream.title}</Text>
          <Text style={styles.dreamContent} numberOfLines={3}>
            {dream.content}
          </Text>

          <View style={styles.dreamActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
              <Text style={styles.actionText}>{dream.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
              <Text style={styles.actionText}>{dream.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderFriends = () => (
    <ScrollView 
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.friendsHeader}>
        <TouchableOpacity
          style={styles.findFriendsButton}
          onPress={() => router.push('/find-friends')}
        >
          <Ionicons name="person-add-outline" size={20} color="#7C3AED" />
          <Text style={styles.findFriendsText}>Find Friends</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Dream Circle</Text>
      
      <TouchableOpacity style={styles.friendCard}>
        <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.friendCardGradient}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>Alice Dream</Text>
          <Text style={styles.friendStatus}>Shared 3 dreams this week</Text>
        </View>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#7C3AED" />
        </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.friendCard}>
        <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={styles.friendCardGradient}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>B</Text>
        </View>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>Bob Explorer</Text>
          <Text style={styles.friendStatus}>Last dream: 2 days ago</Text>
        </View>
        <TouchableOpacity style={styles.messageButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#7C3AED" />
        </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Community</Text>
            <Text style={styles.headerSubtitle}>Connect with fellow dreamers</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <Ionicons name="person-circle-outline" size={28} color="#7C3AED" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={18} 
              color={activeTab === tab.id ? 'white' : '#6B7280'} 
            />
            <Text style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'feed' ? renderFeed() : renderFriends()}
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
  profileButton: {
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: 'white',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
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
    marginBottom: 16,
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
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
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
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    borderRadius: 6,
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
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  dreamTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuButton: {
    padding: 4,
  },
  dreamTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  dreamContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  dreamActions: {
    flexDirection: 'row',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  friendsHeader: {
    marginBottom: 24,
  },
  findFriendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  findFriendsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  friendCard: {
    marginBottom: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  friendCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    padding: 20,
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
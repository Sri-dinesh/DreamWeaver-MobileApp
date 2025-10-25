import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { gradients, palette, radii, shadows, spacing, typography } from '@/theme';
import { SharedDream, User } from '@/types';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface UserWithRequestStatus extends User {
  friendStatus?: {
    status: 'none' | 'pending' | 'accepted';
    isOutgoing?: boolean;
  };
}

const tabs = [
  { id: 'feed', name: 'Dream Feed', icon: 'newspaper-outline' as const },
  { id: 'friends', name: 'Friends', icon: 'people-outline' as const },
];

export default function CommunityScreen() {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sharedDreams, setSharedDreams] = useState<SharedDream[]>([]);
  const [allUsers, setAllUsers] = useState<UserWithRequestStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [requestingUserId, setRequestingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const getToken = async () => {
    try {
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      console.log('🔗 Fetching all data...');

      // Fetch all data in parallel
      const [dreamsRes, usersRes, requestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/shared`, { headers }),
        axios.get(`${API_URL}/api/users/discover`, { headers }),
        axios.get(`${API_URL}/api/friends/requests/received`, { headers }),
      ]);

      console.log('✅ Dreams fetched:', dreamsRes.data.length);
      console.log('✅ Users fetched:', usersRes.data.length);
      console.log('✅ Requests fetched:', requestsRes.data.data?.length);

      setSharedDreams(dreamsRes.data || []);
      setReceivedRequests(requestsRes.data.data || []);

      // Fetch friend status for each user
      const usersWithStatus = await Promise.all(
        usersRes.data.map(async (user: User) => {
          try {
            const statusResponse = await axios.get(
              `${API_URL}/api/friends/status/${user.id}`,
              { headers }
            );
            return {
              ...user,
              friendStatus: {
                status: statusResponse.data.status,
                isOutgoing: statusResponse.data.isOutgoing,
              },
            };
          } catch (err) {
            console.error(`Error fetching status for ${user.id}:`, err);
            return {
              ...user,
              friendStatus: { status: 'none' },
            };
          }
        })
      );

      setAllUsers(usersWithStatus);
    } catch (error: any) {
      console.error('❌ Error fetching data:', error);
      setError(
        error?.response?.data?.message || 'Failed to load community data'
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAllData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  const handleSendFriendRequest = async (userId: string, userName: string) => {
    setRequestingUserId(userId);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('📤 Sending friend request to:', userId);

      await axios.post(
        `${API_URL}/api/friends/request/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Friend request sent');

      // Update local state
      setAllUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                friendStatus: {
                  status: 'pending',
                  isOutgoing: true,
                },
              }
            : user
        )
      );

      Alert.alert('Success', `Friend request sent to ${userName}!`, [
        { text: 'OK' },
      ]);
    } catch (error: any) {
      console.error('❌ Error sending friend request:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to send friend request'
      );
    } finally {
      setRequestingUserId(null);
    }
  };

  // Filter dreams based on search
  const filteredDreams = sharedDreams.filter(
    (dream) =>
      dream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dream.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users based on search
  const filteredUsers = allUsers.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getFriendButtonState = (user: UserWithRequestStatus) => {
    const status = user.friendStatus?.status;

    if (status === 'accepted') {
      return {
        icon: 'checkmark-circle' as const,
        label: 'Friends',
        disabled: true,
        color: '#10B981',
      };
    }

    if (status === 'pending') {
      if (user.friendStatus?.isOutgoing) {
        return {
          icon: 'hourglass' as const,
          label: 'Pending',
          disabled: true,
          color: '#F59E0B',
        };
      } else {
        return {
          icon: 'checkmark-circle' as const,
          label: 'Respond',
          disabled: false,
          color: '#7C3AED',
        };
      }
    }

    return {
      icon: 'person-add-outline' as const,
      label: 'Add',
      disabled: false,
      color: '#7C3AED',
    };
  };

  const renderDreamCard = (dream: SharedDream) => (
    <TouchableOpacity
      key={dream.id}
      style={styles.dreamCard}
      onPress={() => router.push(`/dream-detail/${dream.id}`)}
    >
      <LinearGradient
        colors={['#FFFFFF', '#F8FAFC']}
        style={styles.dreamCardGradient}
      >
        <View style={styles.dreamHeader}>
          <View style={styles.authorInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {dream.author?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.authorDetails}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>
                  {dream.author?.name || 'Anonymous'}
                </Text>
                {dream.visibility === 'friends' && (
                  <View style={styles.friendsOnlyBadge}>
                    <Ionicons name="people" size={12} color="white" />
                    <Text style={styles.friendsOnlyText}>Friends Only</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dreamTime}>
                {formatTimeAgo(dream.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {dream.lucid && (
          <View style={styles.lucidBadge}>
            <Ionicons name="moon" size={12} color="white" />
            <Text style={styles.lucidBadgeText}>Lucid Dream</Text>
          </View>
        )}

        {/* <Text style={styles.dreamTitle}>{dream.title || 'Untitled Dream'}</Text> */}
        <Text style={styles.dreamContent} numberOfLines={3}>
          {dream.content}
        </Text>

        {dream.tags && dream.tags.length > 0 && (
          <View style={styles.tagsList}>
            {dream.tags.map((tag) => (
              <View key={tag.id} style={styles.tag}>
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderFeed = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search dreams and dreamers..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading dreams...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAllData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredDreams.length > 0 ? (
        <>
          <Text style={styles.dreamsCountText}>
            {filteredDreams.length} dream
            {filteredDreams.length !== 1 ? 's' : ''}
          </Text>
          {filteredDreams.map((dream) => renderDreamCard(dream))}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="newspaper-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No dreams available</Text>
          <Text style={styles.emptySubtitle}>
            {sharedDreams.length === 0
              ? 'No dreams shared yet. Add friends to see their dreams!'
              : 'No dreams match your search'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderFriends = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <Text style={styles.sectionTitle}>Discover Dreamers</Text>

      {allUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>
            Check back later to discover more dreamers
          </Text>
        </View>
      ) : filteredUsers.length > 0 ? (
        filteredUsers.map((user) => {
          const buttonState = getFriendButtonState(user);
          const isLoading = requestingUserId === user.id;

          return (
            <View key={user.id} style={styles.friendCard}>
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.friendCardGradient}
              >
                <TouchableOpacity
                  style={styles.userInfoContainer}
                  // onPress={() => {
                  //   router.push({
                  //     pathname: '/user-profile/[id]',
                  //     params: { id: user.id },
                  //   });
                  // }}
                >
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.username?.charAt(0) || '?'}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{user.username}</Text>
                    <Text style={styles.friendStatus} numberOfLines={1}>
                      {user.bio || 'No bio yet'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.messageButton,
                    {
                      opacity: buttonState.disabled ? 0.6 : 1,
                    },
                  ]}
                  onPress={() =>
                    handleSendFriendRequest(user.id, user.username)
                  }
                  disabled={
                    buttonState.disabled ||
                    isLoading ||
                    user.friendStatus?.status === 'accepted'
                  }
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={buttonState.color} />
                  ) : (
                    <>
                      <Ionicons
                        name={buttonState.icon}
                        size={18}
                        color={buttonState.color}
                      />
                      <Text
                        style={[
                          styles.buttonLabel,
                          { color: buttonState.color },
                        ]}
                      >
                        {buttonState.label}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </LinearGradient>
            </View>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No users found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      )}
    </ScrollView>
  );

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>Community</Text>
        <TouchableOpacity
          style={styles.rightAction}
          onPress={() => router.push('/friend-requests')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color="#7C3AED" />
          {receivedRequests.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeCount}>{receivedRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

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
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
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
    backgroundColor: palette.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '500',
    color: palette.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  rightAction: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: -spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    right: -4,
    top: -4,
    backgroundColor: '#EF4444',
    borderRadius: radii.pill,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCount: {
    color: 'white',
    ...typography.caption,
    fontWeight: '700',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: palette.backgroundPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    marginHorizontal: spacing.xs,
    ...shadows.subtle,
    gap: spacing.xs,
  },
  activeTab: {
    backgroundColor: palette.primary,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: spacing.lg,
    elevation: 6,
  },
  tabText: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.bodySecondary,
    color: palette.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.subheading,
    color: palette.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.soft,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 52,
    ...typography.body,
    color: palette.textPrimary,
  },
  dreamsCountText: {
    ...typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.lg,
  },
  dreamCard: {
    marginBottom: spacing.lg,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  dreamCardGradient: {
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  avatarText: {
    ...typography.body,
    fontWeight: '600',
    color: 'white',
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  authorName: {
    ...typography.body,
    fontWeight: '700',
    color: palette.textPrimary,
  },
  friendsOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
    gap: spacing.xxs,
  },
  friendsOnlyText: {
    ...typography.caption,
    fontWeight: '600',
    color: 'white',
  },
  dreamTime: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  menuButton: {
    padding: spacing.xs,
  },
  dreamTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.md,
    lineHeight: 26,
  },
  dreamContent: {
    ...typography.body,
    color: palette.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  dreamActions: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.body,
    fontWeight: '600',
    color: palette.textSecondary,
  },
  sectionTitle: {
    ...typography.heading,
    color: palette.textPrimary,
    marginBottom: spacing.lg,
  },
  friendCard: {
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    ...shadows.soft,
  },
  friendCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.lg,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.xs,
  },
  friendStatus: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: `${palette.primary}15`,
    justifyContent: 'center',
  },
  buttonLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.xxs,
  },
  lucidBadgeText: {
    color: 'white',
    ...typography.caption,
    fontWeight: '600',
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: palette.backgroundSecondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.xs,
  },
  tagText: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  errorContainer: {
    padding: spacing.xxxl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.subheading,
    color: palette.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  errorMessage: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    ...shadows.soft,
  },
  retryButtonText: {
    ...typography.body,
    color: 'white',
  },
});

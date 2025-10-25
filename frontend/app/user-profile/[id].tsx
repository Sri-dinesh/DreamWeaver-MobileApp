import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface UserProfile {
  id: string;
  username: string;
  bio?: string;
  profilePicture?: string;
  stats: {
    followers: number;
    following: number;
    publicDreams: number;
  };
  isFriend: boolean;
  isFollowing: boolean;
  isOwnProfile: boolean;
  recentDreams: Array<{
    id: string;
    title?: string;
    content: string;
    createdAt: string;
    emotion?: string;
    lucid: boolean;
  }>;
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const getToken = async () => {
    try {
      const token = await getItem('userToken');
      // console.log(
      //   '📱 Token retrieved:',
      //   token ? `${token.substring(0, 20)}...` : 'null'
      // );
      return token;
    } catch (error) {
      console.error('❌ Error getting token:', error);
      return null;
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();

      if (!token) {
        // console.log('❌ No token found, redirecting to login');
        Alert.alert(
          'Authentication Required',
          'Please login to view profiles',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
        return;
      }

      if (!id || typeof id !== 'string') {
        console.error('❌ Invalid user ID:', id);
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      const url = `${API_URL}/api/users/${id}`;
      // console.log('🔗 Fetching user profile from:', url);
      // console.log('📨 Sending request with token');

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // console.log('✅ User profile response received:', response.data);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing);
    } catch (error: any) {
      console.error('❌ Error fetching user profile:', error);

      if (error.response) {
        // console.error('Response status:', error.response.status);
        // console.error('Response data:', error.response.data);

        if (error.response.status === 401) {
          Alert.alert(
            'Session Expired',
            'Your session has expired. Please login again.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/auth/login'),
              },
            ]
          );
          return;
        }

        setError(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error('❌ No response received:', error.request);
        setError('Network error - no response from server');
      } else {
        console.error('❌ Error message:', error.message);
        setError(error.message || 'Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      // TODO: Implement follow/unfollow API endpoint
      setIsFollowing(!isFollowing);
      Alert.alert(
        'Success',
        isFollowing ? 'Unfollowed user' : 'Following user'
      );
    } catch (error) {
      console.error('Error toggling follow:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Unable to load profile</Text>
        <Text style={styles.errorMessage}>{error || 'User not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#7C3AED" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 28 }} />
        </View>
      </LinearGradient>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>
            {profile.username?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>

        <Text style={styles.username}>{profile.username}</Text>
        {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.publicDreams}</Text>
            <Text style={styles.statLabel}>Dreams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{profile.stats.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!profile.isOwnProfile && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing && styles.followingButton,
              ]}
              onPress={handleFollowToggle}
            >
              <Ionicons
                name={isFollowing ? 'person-remove' : 'person-add'}
                size={20}
                color={isFollowing ? '#7C3AED' : 'white'}
              />
              <Text
                style={[
                  styles.followButtonText,
                  isFollowing && styles.followingButtonText,
                ]}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#7C3AED" />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Recent Dreams */}
      <View style={styles.dreamsSection}>
        <Text style={styles.sectionTitle}>Recent Dreams</Text>

        {profile.recentDreams.length > 0 ? (
          profile.recentDreams.map((dream) => (
            <TouchableOpacity
              key={dream.id}
              style={styles.dreamCard}
              onPress={() => {
                // console.log('Navigating to dream:', dream.id);
                router.push({
                  pathname: '/dream-detail/[id]',
                  params: { id: dream.id },
                });
              }}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.dreamCardGradient}
              >
                <View>
                  <Text style={styles.dreamTitle}>
                    {dream.title || 'Untitled Dream'}
                  </Text>
                  <Text style={styles.dreamContent} numberOfLines={2}>
                    {dream.content}
                  </Text>
                </View>

                <View style={styles.dreamMeta}>
                  {dream.emotion && (
                    <Text style={styles.dreamEmotion}>{dream.emotion}</Text>
                  )}
                  {dream.lucid && (
                    <View style={styles.lucidBadge}>
                      <Ionicons name="moon" size={12} color="white" />
                      <Text style={styles.lucidText}>Lucid</Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="moon-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No public dreams</Text>
            <Text style={styles.emptySubtitle}>
              This user hasn't shared any dreams yet
            </Text>
          </View>
        )}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4C1D95',
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarLargeText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    marginHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 12,
  },
  followingButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  followingButtonText: {
    color: '#7C3AED',
  },
  messageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 12,
  },
  messageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  dreamsSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  dreamCard: {
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dreamCardGradient: {
    padding: 16,
    borderRadius: 8,
  },
  dreamTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  dreamContent: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  dreamMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dreamEmotion: {
    fontSize: 12,
    backgroundColor: '#EEE',
    color: '#6B7280',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  lucidText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  backButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  spacer: {
    height: 40,
  },
});

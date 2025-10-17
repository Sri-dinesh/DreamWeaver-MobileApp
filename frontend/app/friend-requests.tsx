import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface FriendRequest {
  id: number;
  sender?: {
    id: string;
    username: string;
    profile_picture_url?: string;
    bio?: string;
  };
  receiver?: {
    id: string;
    username: string;
    profile_picture_url?: string;
    bio?: string;
  };
  timestamp: string;
}

const tabs = [
  { id: 'received', name: 'Received', icon: 'arrow-back-outline' as const },
  { id: 'sent', name: 'Sent', icon: 'arrow-forward-outline' as const },
];

export default function FriendRequestsScreen() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchFriendRequests();
  }, []);

  const getToken = async () => {
    try {
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchFriendRequests = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch both received and sent requests
      const [receivedRes, sentRes] = await Promise.all([
        axios.get(`${API_URL}/api/friends/requests/received`, { headers }),
        axios.get(`${API_URL}/api/friends/requests/sent`, { headers }),
      ]);

      setReceivedRequests(receivedRes.data.data || []);
      setSentRequests(sentRes.data.data || []);
    } catch (error: any) {
      console.error('Error fetching friend requests:', error);
      Alert.alert('Error', 'Failed to load friend requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    setActionLoading(requestId);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      await axios.post(
        `${API_URL}/api/friends/accept/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Friend request accepted!');
      fetchFriendRequests();
    } catch (error: any) {
      console.error('Error accepting request:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to accept friend request'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this friend request?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Reject',
          onPress: async () => {
            setActionLoading(requestId);
            try {
              const token = await getToken();
              if (!token) {
                router.replace('/auth/login');
                return;
              }

              await axios.post(
                `${API_URL}/api/friends/reject/${requestId}`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              Alert.alert('Success', 'Friend request rejected');
              fetchFriendRequests();
            } catch (error: any) {
              console.error('Error rejecting request:', error);
              Alert.alert(
                'Error',
                error?.response?.data?.message || 'Failed to reject friend request'
              );
            } finally {
              setActionLoading(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleCancelRequest = async (requestId: number) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this friend request?',
      [
        { text: 'No', onPress: () => {}, style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setActionLoading(requestId);
            try {
              const token = await getToken();
              if (!token) {
                router.replace('/auth/login');
                return;
              }

              await axios.delete(
                `${API_URL}/api/friends/request/${requestId}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              Alert.alert('Success', 'Friend request cancelled');
              fetchFriendRequests();
            } catch (error: any) {
              console.error('Error cancelling request:', error);
              Alert.alert(
                'Error',
                error?.response?.data?.message || 'Failed to cancel friend request'
              );
            } finally {
              setActionLoading(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderReceivedRequests = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchFriendRequests} />
      }
    >
      {receivedRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-open-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptySubtitle}>
            When someone sends you a friend request, it will appear here
          </Text>
        </View>
      ) : (
        receivedRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.cardGradient}
            >
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => {
                  router.push({
                    pathname: '/user-profile/[id]',
                    params: { id: request.sender?.id || '' },
                  });
                }}
              >
                <View style={styles.avatar}>
                  {request.sender?.profile_picture_url ? (
                    <Image
                      source={{
                        uri: request.sender.profile_picture_url,
                      }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {request.sender?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{request.sender?.username}</Text>
                  <Text style={styles.userBio} numberOfLines={1}>
                    {request.sender?.bio || 'No bio yet'}
                  </Text>
                  <Text style={styles.timestamp}>
                    {formatDate(request.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(request.id)}
                  disabled={actionLoading === request.id}
                >
                  {actionLoading === request.id ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="white" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(request.id)}
                  disabled={actionLoading === request.id}
                >
                  {actionLoading === request.id ? (
                    <ActivityIndicator color="#EF4444" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close" size={18} color="#EF4444" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderSentRequests = () => (
    <ScrollView
      style={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchFriendRequests} />
      }
    >
      {sentRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="send-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No pending requests</Text>
          <Text style={styles.emptySubtitle}>
            Start by sending friend requests to dreamers you'd like to connect with
          </Text>
        </View>
      ) : (
        sentRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.cardGradient}
            >
              <TouchableOpacity
                style={styles.userInfo}
                onPress={() => {
                  router.push({
                    pathname: '/user-profile/[id]',
                    params: { id: request.receiver?.id || '' },
                  });
                }}
              >
                <View style={styles.avatar}>
                  {request.receiver?.profile_picture_url ? (
                    <Image
                      source={{
                        uri: request.receiver.profile_picture_url,
                      }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>
                      {request.receiver?.username?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  )}
                </View>
                <View style={styles.userDetails}>
                  <Text style={styles.username}>{request.receiver?.username}</Text>
                  <Text style={styles.userBio} numberOfLines={1}>
                    {request.receiver?.bio || 'No bio yet'}
                  </Text>
                  <Text style={styles.timestamp}>
                    Sent {formatDate(request.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancelRequest(request.id)}
                  disabled={actionLoading === request.id}
                >
                  {actionLoading === request.id ? (
                    <ActivityIndicator color="#6B7280" size="small" />
                  ) : (
                    <>
                      <Ionicons name="close" size={18} color="#6B7280" />
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))
      )}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading friend requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124, 58, 237, 0.1)', 'rgba(168, 85, 247, 0.05)']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Friend Requests</Text>
            <Text style={styles.headerSubtitle}>
              Manage your friend requests
            </Text>
          </View>
          <View style={styles.placeholder} />
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
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.name}
            </Text>
            {tab.id === 'received' && receivedRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{receivedRequests.length}</Text>
              </View>
            )}
            {tab.id === 'sent' && sentRequests.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{sentRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'received'
        ? renderReceivedRequests()
        : renderSentRequests()}
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
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'white',
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
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  badge: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  requestCard: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Tag {
  id: string;
  name: string;
}

interface Dream {
  id: string;
  title?: string;
  content: string;
  emotion?: string;
  tags?: Tag[];
  lucid: boolean;
  createdAt: string;
  updatedAt?: string;
  date?: string;
  visibility: 'private' | 'public' | 'friends';
  likes: number;
  comments: number;
  ai_analysis?: string | null;
  isLiked?: boolean;
  isSaved?: boolean;
}

const EMOTION_NAMES: Record<string, string> = {
  happy: 'Happy',
  sad: 'Sad',
  anxious: 'Anxious',
  neutral: 'Neutral',
  calm: 'Calm',
  excited: 'Excited',
  others: 'Others',
};

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [dream, setDream] = useState<Dream | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDreamDetail();
    }
  }, [id]);

  // const getToken = async () => {
  //   try {
  //     return localStorage.getItem('userToken');
  //   } catch (error) {
  //     console.error('Error getting token:', error);
  //     return null;
  //   }
  // };

  const getToken = async () => {
    try {
      // Use your storage utility instead of direct localStorage
      // return await storage.getItem('userToken');
      // Or if using the new secureStorage.ts:
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchDreamDetail = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }
      
      try {
        // First try to fetch from personal dreams
        const response = await axios.get(`${API_URL}/api/dreams/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDream(response.data);
      } catch (personalError: any) {
        // If personal fetch fails, try shared dreams endpoint
        if (personalError?.response?.status === 403 || personalError?.response?.status === 404) {
          try {
            const sharedResponse = await axios.get(`${API_URL}/api/shared/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setDream(sharedResponse.data);
          } catch (sharedError) {
            console.error('Error fetching dream from shared:', sharedError);
            Alert.alert('Error', 'Failed to fetch dream details. Please try again.');
          }
        } else {
          console.error('Error fetching dream:', personalError);
          Alert.alert('Error', 'Failed to fetch dream details. Please try again.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push('/dream-editor');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Dream',
      'Are you sure you want to delete this dream? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Dream Deleted',
              'Your dream has been removed from your journal.',
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Dream', 'Dream shared successfully!');
  };

  const handleAnalyze = () => {
    if (dream?.ai_analysis) {
      setShowAiAnalysis(true);
    } else {
      Alert.alert(
        'AI Dream Analysis',
        'No analysis available for this dream yet.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isShareable = (visibility: string) =>
    visibility === 'public' || visibility === 'friends';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!dream) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Dream not found</Text>
      </View>
    );
  }

  async function handleGenerateAnalysis(
    event: GestureResponderEvent
  ): Promise<void> {
    event?.stopPropagation?.();

    if (!id) {
      Alert.alert('Error', 'No dream ID available.');
      return;
    }

    if (!dream) {
      Alert.alert('Error', 'Dream not loaded yet.');
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/dreams/${id}/analyze`,
        { content: dream.content },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const ai_analysis =
        response.data?.ai_analysis ?? response.data?.analysis ?? null;

      if (!ai_analysis) {
        Alert.alert('No Analysis', 'The AI did not return an analysis.');
        return;
      }

      setDream((prev) => (prev ? { ...prev, ai_analysis } : prev));
      Alert.alert(
        'AI Analysis Generated',
        'A new AI analysis has been added to this dream.'
      );
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      Alert.alert('Error', 'Failed to generate AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  let displayEmotion = '';
  if (typeof dream.emotion === 'string') {
    displayEmotion = EMOTION_NAMES[dream.emotion] || dream.emotion;
  } else if (
    Array.isArray(dream.emotion) &&
    (dream.emotion as unknown[]).length > 0 &&
    typeof (dream.emotion as unknown[])[0] === 'string'
  ) {
    const firstEmotion = (dream.emotion as string[])[0];
    displayEmotion = EMOTION_NAMES[firstEmotion] || firstEmotion;
  }

  const tagsToDisplay = Array.isArray(dream.tags) ? dream.tags : [];

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
            <Ionicons name="arrow-back" size={24} color="#4C1D95" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Dream Details</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Ionicons name="create-outline" size={24} color="#4C1D95" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dreamCard}>
          <View style={styles.dreamHeader}>
            <View style={styles.titleSection}>
              <View style={styles.dateContainer}>
                <Text style={styles.dreamDate}>
                  {formatDate(
                    dream.date ||
                      dream.createdAt ||
                      dream.updatedAt ||
                      new Date().toISOString()
                  )}
                </Text>

                <View
                  style={[
                    styles.visibilityBadge,
                    {
                      backgroundColor:
                        dream.visibility === 'private'
                          ? '#6B7280'
                          : dream.visibility === 'friends'
                          ? '#3B82F6'
                          : '#10B981',
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      dream.visibility === 'private'
                        ? 'lock-closed'
                        : dream.visibility === 'friends'
                        ? 'people'
                        : 'globe'
                    }
                    size={12}
                    color="white"
                  />
                  <Text style={styles.visibilityText}>
                    {dream.visibility.charAt(0).toUpperCase() +
                      dream.visibility.slice(1)}
                  </Text>
                </View>
              </View>
              {dream.lucid && (
                <View style={styles.lucidBadge}>
                  <Ionicons name="flash" size={16} color="white" />
                  <Text style={styles.lucidBadgeText}>Lucid</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.dreamContent}>{dream.content}</Text>

          <View style={styles.metaSection}>
            <View style={styles.emotionsSection}>
              <Text style={styles.metaTitle}>Emotions</Text>
              <View style={styles.emotionsList}>
                {displayEmotion ? (
                  <View key="primary-emotion" style={styles.emotionTag}>
                    <Text style={styles.emotionText}>{displayEmotion}</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>-</Text>
                )}
              </View>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.metaTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {tagsToDisplay.length > 0 ? (
                  tagsToDisplay.map((tag) => (
                    <View key={tag.id} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag.name}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>-</Text>
                )}
              </View>
            </View>
          </View>


          <View style={styles.aiSection}>
            <TouchableOpacity
              style={styles.aiButton}
              onPress={
                dream.ai_analysis ? handleAnalyze : handleGenerateAnalysis
              }
            >
              <Text style={styles.aiButtonText}>
                {dream.ai_analysis
                  ? 'View AI Analysis'
                  : 'Generate AI Analysis'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Show AI analysis only when user clicks "View AI Analysis" */}
          {dream.ai_analysis && showAiAnalysis && (
            <View style={styles.analysisContainer}>
              <Text style={styles.analysisHeader}>AI Dream Analysis</Text>
              <Text style={styles.analysisContent}>{dream.ai_analysis}</Text>
            </View>
          )}

          <View style={styles.dangerZone}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete Dream</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFBFC' },
  headerGradient: { paddingTop: 50 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#4C1D95' },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { flex: 1, padding: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#EF4444' },
  dreamCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleSection: { flex: 1, marginRight: 16 },
  dreamTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  dreamDate: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  lucidBadgeText: { color: 'white', fontSize: 12, fontWeight: '700' },
  dreamContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 24,
  },
  metaSection: { marginBottom: 24 },
  emotionsSection: { marginBottom: 20 },
  metaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emotionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  emotionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  emotionText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  tagsSection: {},
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  analysisContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  analysisHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  analysisContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  analysisButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  analysisButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButtonActive: { backgroundColor: '#F3F4F6' },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  actionButtonTextActive: { color: '#1F2937' },
  aiSection: { marginBottom: 24 },
  aiButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  dangerZone: { marginBottom: 24 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 8,
  },
  deleteButtonText: { fontSize: 14, fontWeight: '600', color: '#EF4444' },
  bottomPadding: { height: 40 },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  visibilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

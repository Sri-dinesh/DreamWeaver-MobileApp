import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Mock dream data - in a real app, this would come from your database
const mockDream = {
  id: '1',
  title: 'Flying Over Mountains',
  content: 'I was soaring above snow-capped mountains, feeling completely free and weightless. The wind carried me higher and higher, and I could see the entire world spread out below me like a beautiful tapestry. The sensation of flight was so vivid and real - I could feel the cool mountain air against my skin and the exhilarating rush of moving through the clouds. As I flew, I encountered other dreamers who were also exploring this aerial realm, and we danced together in the sky, creating patterns of light and color that painted the heavens.',
  tags: ['flying', 'mountains', 'freedom', 'adventure'],
  emotions: ['joy', 'excitement', 'wonder'],
  lucid: true,
  date: '2024-01-15',
  visibility: 'public',
  likes: 24,
  comments: 8,
};

const emotionColors = {
  joy: '#10B981',
  excitement: '#EF4444',
  wonder: '#8B5CF6',
  fear: '#F59E0B',
  sadness: '#6B7280',
  curiosity: '#3B82F6',
};

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams();
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
            Alert.alert('Dream Deleted', 'Your dream has been removed from your journal.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Share Dream', 'Dream shared successfully!');
  };

  const handleAnalyze = () => {
    Alert.alert(
      'AI Dream Analysis 🔮',
      'This dream reveals themes of liberation and transcendence. Flying often represents a desire to break free from limitations and gain a new perspective on life. The mountain setting suggests you\'re overcoming challenges and reaching new heights in your personal growth.',
      [{ text: 'Fascinating!' }]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

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
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
          >
            <Ionicons name="create-outline" size={24} color="#4C1D95" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dreamCard}>
          <View style={styles.dreamHeader}>
            <View style={styles.titleSection}>
              <Text style={styles.dreamTitle}>{mockDream.title}</Text>
              <Text style={styles.dreamDate}>{formatDate(mockDream.date)}</Text>
            </View>
            {mockDream.lucid && (
              <View style={styles.lucidBadge}>
                <Ionicons name="flash" size={16} color="white" />
                <Text style={styles.lucidBadgeText}>Lucid</Text>
              </View>
            )}
          </View>

          <Text style={styles.dreamContent}>{mockDream.content}</Text>

          <View style={styles.metaSection}>
            <View style={styles.emotionsSection}>
              <Text style={styles.metaTitle}>Emotions</Text>
              <View style={styles.emotionsList}>
                {mockDream.emotions.map((emotion, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.emotionTag, 
                      { backgroundColor: `${emotionColors[emotion as keyof typeof emotionColors] || '#6B7280'}20` }
                    ]}
                  >
                    <Text style={[
                      styles.emotionText,
                      { color: emotionColors[emotion as keyof typeof emotionColors] || '#6B7280' }
                    ]}>
                      {emotion}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.tagsSection}>
              <Text style={styles.metaTitle}>Tags</Text>
              <View style={styles.tagsList}>
                {mockDream.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.statsSection}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.statText}>{mockDream.likes} likes</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={20} color="#3B82F6" />
              <Text style={styles.statText}>{mockDream.comments} comments</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye" size={20} color="#6B7280" />
              <Text style={styles.statText}>{mockDream.visibility}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, isLiked && styles.actionButtonActive]}
            onPress={() => setIsLiked(!isLiked)}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? "#EF4444" : "#6B7280"} 
            />
            <Text style={[styles.actionButtonText, isLiked && styles.actionButtonTextActive]}>
              {isLiked ? 'Liked' : 'Like'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, isBookmarked && styles.actionButtonActive]}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Ionicons 
              name={isBookmarked ? "bookmark" : "bookmark-outline"} 
              size={20} 
              color={isBookmarked ? "#F59E0B" : "#6B7280"} 
            />
            <Text style={[styles.actionButtonText, isBookmarked && styles.actionButtonTextActive]}>
              {isBookmarked ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#6B7280" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.aiSection}>
          <TouchableOpacity style={styles.aiButton} onPress={handleAnalyze}>
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.aiButtonText}>Get AI Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Delete Dream</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
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
    padding: 24,
    paddingTop: 10,
  },
  backButton: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4C1D95',
  },
  editButton: {
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
  content: {
    flex: 1,
    padding: 24,
  },
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
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  dreamTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 32,
  },
  dreamDate: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  lucidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  lucidBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  dreamContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 24,
  },
  metaSection: {
    marginBottom: 24,
  },
  emotionsSection: {
    marginBottom: 20,
  },
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
  },
  emotionTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  emotionText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tagsSection: {},
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  actionButtonActive: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  actionButtonTextActive: {
    color: '#1F2937',
  },
  aiSection: {
    marginBottom: 24,
  },
  aiButton: {
    borderRadius: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  aiButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 8,
    gap: 10,
  },
  aiButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  dangerZone: {
    marginBottom: 24,
  },
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
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 40,
  },
});
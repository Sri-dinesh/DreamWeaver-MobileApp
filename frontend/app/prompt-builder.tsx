import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const { width, height } = Dimensions.get('window');

const promptTypes = [
  { id: 'creative', name: 'Creative writing prompt' },
  { id: 'reflection', name: 'Self-reflection prompt' },
  { id: 'incubation', name: 'Dream Incubation Prompt' },
];

interface HistoryItem {
  id: number;
  type: string;
  content: string;
  inputText: string;
  createdAt: string;
}

export default function PromptBuilderScreen() {
  const [activeTab, setActiveTab] = useState('prompt');

  // Prompt states
  const [selectedPromptType, setSelectedPromptType] = useState('creative');
  const [themeKeyword, setThemeKeyword] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Affirmation states
  const [affirmationText, setAffirmationText] = useState('');
  const [affirmationLoading, setAffirmationLoading] = useState(false);
  const [generatedAffirmation, setGeneratedAffirmation] = useState<
    string | null
  >(null);

  // History states
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistoryFilter, setSelectedHistoryFilter] = useState('all');

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const getToken = async () => {
    try {
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('📋 Fetching prompt history...');

      const response = await axios.get(`${API_URL}/api/ai/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ History fetched:', response.data.length, 'items');
      setHistoryItems(response.data);
    } catch (error: any) {
      console.error('❌ Error fetching history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!themeKeyword.trim()) {
      Alert.alert('Error', 'Please enter a theme or keyword');
      return;
    }

    setPromptLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('🤖 Sending prompt generation request...');
      console.log('Type:', selectedPromptType, 'Theme:', themeKeyword);

      const response = await axios.post(
        `${API_URL}/ai/generate-prompt`,
        {
          promptType: selectedPromptType,
          theme: themeKeyword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Prompt generated successfully');
      setGeneratedPrompt(response.data.content);
      fetchHistory();
    } catch (error: any) {
      console.error('❌ Error generating prompt:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to generate prompt';
      Alert.alert('Error', errorMessage);
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerateAffirmation = async () => {
    if (!affirmationText.trim()) {
      Alert.alert('Error', 'Please enter affirmation text');
      return;
    }

    setAffirmationLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('🤖 Sending affirmation generation request...');

      const response = await axios.post(
        `${API_URL}/ai/generate-affirmation`,
        { text: affirmationText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Affirmation generated successfully');
      setGeneratedAffirmation(response.data.affirmation);
      fetchHistory();
    } catch (error: any) {
      console.error('❌ Error generating affirmation:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to generate affirmation';
      Alert.alert('Error', errorMessage);
    } finally {
      setAffirmationLoading(false);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    Alert.alert(
      'Delete Prompt',
      'Are you sure you want to delete this prompt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              if (!token) {
                router.replace('/auth/login');
                return;
              }

              console.log('🗑️  Deleting prompt:', id);

              await axios.delete(`${API_URL}/api/ai/history/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              console.log('✅ Prompt deleted successfully');
              Alert.alert('Success', 'Prompt deleted');
              fetchHistory();
            } catch (error: any) {
              console.error('❌ Error deleting prompt:', error);
              const errorMessage =
                error?.response?.data?.message || 'Failed to delete prompt';
              Alert.alert('Error', errorMessage);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      creative: '#3B82F6',
      reflection: '#8B5CF6',
      incubation: '#EC4899',
      affirmation: '#10B981',
    };
    return colors[type] || '#7C3AED';
  };

  const GeneratedContent = ({
    content,
    type,
  }: {
    content: string;
    type: 'prompt' | 'affirmation';
  }) => (
    <View style={styles.generatedContainer}>
      <View style={styles.generatedHeader}>
        <Text style={styles.generatedTitle}>
          {type === 'prompt' ? 'Generated Prompt' : 'Generated Affirmation'}
        </Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => {
            Alert.alert(
              'Copied',
              `${
                type === 'prompt' ? 'Prompt' : 'Affirmation'
              } copied to clipboard`
            );
          }}
        >
          <Ionicons name="copy-outline" size={16} color="#7C3AED" />
          <Text style={styles.copyButtonText}>Copy</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.generatedContent}>{content}</Text>
    </View>
  );

  const renderPromptTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Generate Dream Prompt</Text>
      <Text style={styles.sectionDescription}>
        Create a personalized prompt to inspire your dreams and enhance your
        dream recall.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prompt Type</Text>
        <View style={styles.multiChoiceContainer}>
          {promptTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.choiceButton,
                selectedPromptType === type.id && styles.choiceButtonActive,
              ]}
              onPress={() => setSelectedPromptType(type.id)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  selectedPromptType === type.id &&
                    styles.choiceButtonTextActive,
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Theme or Keyword</Text>
        <Text style={styles.inputDescription}>
          Enter a word or concept you'd like to explore in your dreams
        </Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., flying, water, childhood, transformation..."
          value={themeKeyword}
          onChangeText={setThemeKeyword}
          editable={!promptLoading}
        />
      </View>

      {generatedPrompt && (
        <GeneratedContent content={generatedPrompt} type="prompt" />
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!themeKeyword.trim() || promptLoading) && styles.buttonDisabled,
        ]}
        onPress={handleGeneratePrompt}
        disabled={!themeKeyword.trim() || promptLoading}
      >
        {promptLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons
              name="sparkles"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryButtonText}>Generate Prompt</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          AI will generate a unique prompt based on your theme. Use it as a
          focus point before sleep.
        </Text>
      </View>
    </ScrollView>
  );

  const renderAffirmationTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Generate Affirmation</Text>
      <Text style={styles.sectionDescription}>
        Create a powerful affirmation to enhance lucid dreaming and sleep
        quality.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Your Idea</Text>
        <Text style={styles.inputDescription}>
          Describe what you want to affirm or achieve in your dreams
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g., I am aware in my dreams, I can control my dreams, I remember my dreams..."
          multiline
          numberOfLines={5}
          value={affirmationText}
          onChangeText={setAffirmationText}
          editable={!affirmationLoading}
          textAlignVertical="top"
        />
      </View>

      {generatedAffirmation && (
        <GeneratedContent content={generatedAffirmation} type="affirmation" />
      )}

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!affirmationText.trim() || affirmationLoading) &&
            styles.buttonDisabled,
        ]}
        onPress={handleGenerateAffirmation}
        disabled={!affirmationText.trim() || affirmationLoading}
      >
        {affirmationLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons
              name="sparkles"
              size={20}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.primaryButtonText}>Generate Affirmation</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#10B981" />
        <Text style={styles.infoText}>
          AI will refine your idea into a powerful, memorable affirmation for
          sleep and lucid dreaming.
        </Text>
      </View>
    </ScrollView>
  );

  const renderBinauralTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Binaural Beats Generator</Text>
      <Text style={styles.sectionDescription}>
        Generate custom binaural beats to enhance sleep and lucid dreaming.
      </Text>

      <View style={styles.comingSoonContainer}>
        <Ionicons name="musical-notes" size={64} color="#A78BFA" />
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonSubtitle}>
          Binaural beats generation feature is under development
        </Text>
      </View>
    </ScrollView>
  );

  const renderSubliminalTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Subliminal Audio Generator</Text>
      <Text style={styles.sectionDescription}>
        Create custom subliminal messages for better dream recall and lucidity.
      </Text>

      <View style={styles.comingSoonContainer}>
        <Ionicons name="volume-mute" size={64} color="#A78BFA" />
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonSubtitle}>
          Subliminal audio generation feature is under development
        </Text>
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <View style={styles.historyTabContent}>
      <Text style={styles.sectionTitle}>History</Text>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedHistoryFilter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedHistoryFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedHistoryFilter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedHistoryFilter === 'affirmation' &&
              styles.filterButtonActive,
          ]}
          onPress={() => setSelectedHistoryFilter('affirmation')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedHistoryFilter === 'affirmation' &&
                styles.filterButtonTextActive,
            ]}
          >
            Affirmations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            selectedHistoryFilter === 'prompt' && styles.filterButtonActive,
          ]}
          onPress={() => setSelectedHistoryFilter('prompt')}
        >
          <Text
            style={[
              styles.filterButtonText,
              selectedHistoryFilter === 'prompt' &&
                styles.filterButtonTextActive,
            ]}
          >
            Prompts
          </Text>
        </TouchableOpacity>
      </View>

      {historyLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : historyItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first prompt or affirmation to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={historyItems.filter(
            (item) =>
              selectedHistoryFilter === 'all' ||
              (selectedHistoryFilter === 'affirmation' &&
                item.type === 'affirmation') ||
              (selectedHistoryFilter === 'prompt' &&
                item.type !== 'affirmation')
          )}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          renderItem={({ item }) => (
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.historyCard}
            >
              <View style={styles.historyHeader}>
                <View style={styles.historyTitleSection}>
                  <View
                    style={[
                      styles.typeBadge,
                      { backgroundColor: getTypeColor(item.type) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeBadgeText,
                        { color: getTypeColor(item.type) },
                      ]}
                    >
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeletePrompt(item.id)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>

              {item.inputText && (
                <View style={styles.historyInputSection}>
                  <Text style={styles.historyLabel}>Input:</Text>
                  <Text style={styles.historyInputText}>{item.inputText}</Text>
                </View>
              )}

              <View style={styles.historyContentSection}>
                <Text style={styles.historyLabel}>Generated:</Text>
                <Text style={styles.historyContent}>{item.content}</Text>
              </View>

              <TouchableOpacity style={styles.copyButton}>
                <Ionicons name="copy" size={16} color="#7C3AED" />
                <Text style={styles.copyButtonText}>Copy</Text>
              </TouchableOpacity>
            </LinearGradient>
          )}
          contentContainerStyle={styles.historyList}
          scrollIndicatorInsets={{ right: 1 }}
        />
      )}
    </View>
  );

  const tabs = [
    { id: 'prompt', name: 'Prompts', icon: 'sparkles-outline' as const },
    { id: 'affirmation', name: 'Affirmation', icon: 'heart-outline' as const },
    {
      id: 'binaural',
      name: 'Binaural',
      icon: 'musical-notes-outline' as const,
    },
    {
      id: 'subliminal',
      name: 'Subliminal',
      icon: 'volume-mute-outline' as const,
    },
    { id: 'history', name: 'History', icon: 'time-outline' as const },
  ];

  return (
    <SafeAreaView style={styles.container}>
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
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Prompt Builder</Text>
            <Text style={styles.headerSubtitle}>AI-Powered Dream Tools</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? '#7C3AED' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.id && styles.tabButtonTextActive,
              ]}
            >
              {tab.name}
            </Text>
            {activeTab === tab.id && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'prompt' && renderPromptTab()}
      {activeTab === 'affirmation' && renderAffirmationTab()}
      {activeTab === 'binaural' && renderBinauralTab()}
      {activeTab === 'subliminal' && renderSubliminalTab()}
      {activeTab === 'history' && renderHistoryTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  headerGradient: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4C1D95',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  placeholder: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderBottomColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#7C3AED',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  tabButtonTextActive: {
    color: '#7C3AED',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  historyTabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  inputDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  multiChoiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  choiceButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  choiceButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  choiceButtonTextActive: {
    color: 'white',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  comingSoonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  filterButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
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
  },
  historyList: {
    paddingBottom: 20,
  },
  historyCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  historyDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 6,
  },
  historyInputSection: {
    marginBottom: 12,
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  historyInputText: {
    fontSize: 13,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  historyContentSection: {
    marginBottom: 12,
  },
  historyContent: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  generatedContainer: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  generatedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  generatedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  generatedContent: {
    fontSize: 15,
    color: '#1E40AF',
    lineHeight: 22,
  },
});

import { getItem } from '@/utils/secureStorage';
import { gradients, palette, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const emotions = [
  { id: 'happy', name: 'Happy' },
  { id: 'sad', name: 'Sad' },
  { id: 'anxious', name: 'Anxious' },
  { id: 'neutral', name: 'Neutral' },
  { id: 'calm', name: 'Calm' },
  { id: 'excited', name: 'Excited' },
  { id: 'others', name: 'Others' },
];

const visibilityOptions = [
  { id: 'private', name: 'Private (only Me)' },
  { id: 'friends', name: 'Friends only' },
  { id: 'public', name: 'Public' },
];

const lucidOptions = [
  { id: 'all', name: 'All' },
  { id: 'yes', name: 'Yes' },
  { id: 'no', name: 'No' },
];

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface Dream {
  id: string;
  content: string;
  emotion?: string;
  is_lucid?: boolean;
  visibility?: string;
  tags?: { name: string }[];
  timestamp: string;
  ai_analysis?: string | null;
}

export default function DreamJournalScreen() {
  const [activeTab, setActiveTab] = useState('record');

  // Record dream states
  const [dreamContent, setDreamContent] = useState('');
  const [primaryEmotion, setPrimaryEmotion] = useState('neutral');
  const [tags, setTags] = useState('');
  const [isLucid, setIsLucid] = useState(false);
  const [visibility, setVisibility] = useState('private');

  // Search & filter states
  const [searchContent, setSearchContent] = useState('');
  const [filterTags, setFilterTags] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [lucidFilter, setLucidFilter] = useState('all');

  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingDream, setSavingDream] = useState(false);
  const [analyzingDream, setAnalyzingDream] = useState(false);

  // Analysis states
  const [dreamAnalysis, setDreamAnalysis] = useState<string | null>(null);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [analysisModalVisible, setAnalysisModalVisible] = useState(false);

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/dreams`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDreams(response.data);
    } catch (error) {
      console.error('Error fetching dreams:', error);
      Alert.alert('Error', 'Failed to fetch dreams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSaveDream = async () => {
    if (!dreamContent.trim()) {
      Alert.alert('Error', 'Please enter dream content');
      return;
    }

    setSavingDream(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const dreamData = {
        content: dreamContent,
        emotion: primaryEmotion,
        is_lucid: isLucid,
        visibility: visibility,
        tags: tagsArray,
      };

      await axios.post(`${API_URL}/api/dreams`, dreamData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setDreamContent('');
      setTags('');
      setIsLucid(false);
      setPrimaryEmotion('neutral');
      setVisibility('private');

      Alert.alert('Success', 'Dream saved successfully!');
      fetchDreams();
    } catch (error) {
      console.error('Error saving dream:', error);
      Alert.alert('Error', 'Failed to save dream. Please try again.');
    } finally {
      setSavingDream(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!dreamContent.trim()) {
      Alert.alert('Error', 'Please enter dream content first');
      return;
    }

    setAnalyzingDream(true);
    setDreamAnalysis(null); // Clear any previous analysis

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const dreamData = {
        content: dreamContent,
        emotion: primaryEmotion,
        is_lucid: isLucid,
        visibility: visibility,
        tags: tagsArray,
      };

      console.log('Saving dream with data:', dreamData);

      const saveResponse = await axios.post(
        `${API_URL}/api/dreams`,
        dreamData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Save response:', saveResponse.data);

      const dreamId = saveResponse.data.id;

      if (!dreamId) {
        console.error('No dream ID returned from save operation');
        Alert.alert('Error', 'Could not analyze dream - missing dream ID');
        return;
      }

      console.log(`Analyzing dream with ID: ${dreamId}`);

      const analysisResponse = await axios.post(
        `${API_URL}/api/dreams/${dreamId}/analyze`,
        {}, // Empty object as body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Analysis response:', analysisResponse.data);

      if (analysisResponse.data && analysisResponse.data.analysis) {
        setDreamAnalysis(analysisResponse.data.analysis);

        setDreamContent('');
        setTags('');
        setIsLucid(false);
        setPrimaryEmotion('neutral');
        setVisibility('private');

        fetchDreams();
      } else {
        setDreamAnalysis('No analysis available. Please try again.');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);

      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);

        let errorMessage = 'Server error';
        if (
          typeof error.response.data === 'string' &&
          error.response.data.includes('<pre>')
        ) {
          const matches = error.response.data.match(/<pre>(.*?)<\/pre>/s);
          if (matches && matches[1]) {
            errorMessage = matches[1].split('<br>')[0];
          }
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }

        setDreamAnalysis(`Analysis failed: ${errorMessage}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setDreamAnalysis('Network error. Could not connect to the server.');
      } else {
        setDreamAnalysis(`Analysis failed: ${error.message}`);
      }
    } finally {
      setAnalyzingDream(false);
    }
  };

  const handleViewAnalysis = (dream: Dream) => {
    setSelectedDream(dream);

    if (dream.ai_analysis) {
      setDreamAnalysis(dream.ai_analysis);
      setAnalysisModalVisible(true);
    } else {
      generateAnalysisForDream(dream);
    }
  };

  const generateAnalysisForDream = async (dream: Dream) => {
    setAnalyzingDream(true);
    setDreamAnalysis(null);

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log(`Generating analysis for dream ID: ${dream.id}`);

      const analysisResponse = await axios.post(
        `${API_URL}/api/dreams/${dream.id}/analyze`,
        {}, // Empty object as body
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (analysisResponse.data && analysisResponse.data.analysis) {
        setDreamAnalysis(analysisResponse.data.analysis);
        setAnalysisModalVisible(true);

        fetchDreams();
      } else {
        Alert.alert('Error', 'Failed to generate analysis.');
      }
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      Alert.alert('Error', 'Failed to generate analysis. Please try again.');
    } finally {
      setAnalyzingDream(false);
    }
  };

  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      const tagsArray = filterTags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const searchData = {
        content: searchContent || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        isLucid:
          lucidFilter === 'yes'
            ? true
            : lucidFilter === 'no'
            ? false
            : undefined,
      };

      const response = await axios.post(
        `${API_URL}/api/dreams/search`,
        searchData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setDreams(response.data);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search dreams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  interface FormatDateOptions {
    year: 'numeric';
    month: 'short';
    day: 'numeric';
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    } as FormatDateOptions);
  };

  const renderAnalysisModal = () => (
    <Modal
      visible={analysisModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setAnalysisModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Dream Analysis</Text>
            <TouchableOpacity
              onPress={() => setAnalysisModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {selectedDream && (
            <View style={styles.modalDreamSummary}>
              <Text style={styles.modalDreamDate}>
                {formatDate(selectedDream.timestamp)}
              </Text>
              <Text style={styles.modalDreamContent} numberOfLines={2}>
                {selectedDream.content}
              </Text>
            </View>
          )}

          <ScrollView style={styles.modalAnalysisContainer}>
            {dreamAnalysis ? (
              <Text style={styles.modalAnalysisText}>{dreamAnalysis}</Text>
            ) : (
              <ActivityIndicator color="#7C3AED" size="large" />
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderRecordTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Record New Dream</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Dream Content</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your dream in detail..."
          placeholderTextColor="#9CA3AF"
          multiline
          value={dreamContent}
          onChangeText={setDreamContent}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Primary Emotion</Text>
        <View style={styles.multiChoiceContainer}>
          {emotions.map((emotion) => (
            <TouchableOpacity
              key={emotion.id}
              style={[
                styles.choiceButton,
                primaryEmotion === emotion.id && styles.choiceButtonActive,
              ]}
              onPress={() => setPrimaryEmotion(emotion.id)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  primaryEmotion === emotion.id &&
                    styles.choiceButtonTextActive,
                ]}
              >
                {emotion.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Tags</Text>
        <TextInput
          style={styles.textInput}
          placeholder="flying, water, people (comma separated)"
          placeholderTextColor="#9CA3AF"
          value={tags}
          onChangeText={setTags}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lucid Dream?</Text>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsLucid(!isLucid)}
        >
          <View style={[styles.checkbox, isLucid && styles.checkboxActive]}>
            {isLucid && <Ionicons name="checkmark" size={16} color="white" />}
          </View>
          <Text style={styles.checkboxLabel}>Yes, this was a lucid dream</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Visibility</Text>
        <View style={styles.multiChoiceContainer}>
          {visibilityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.choiceButton,
                visibility === option.id && styles.choiceButtonActive,
              ]}
              onPress={() => setVisibility(option.id)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  visibility === option.id && styles.choiceButtonTextActive,
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!dreamContent.trim() || savingDream) && styles.buttonDisabled,
          ]}
          onPress={handleSaveDream}
          disabled={!dreamContent.trim() || savingDream}
        >
          {savingDream ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Dream</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            (!dreamContent.trim() || analyzingDream) && styles.buttonDisabled,
          ]}
          onPress={handleAnalyzeWithAI}
          disabled={!dreamContent.trim() || analyzingDream}
        >
          {analyzingDream ? (
            <ActivityIndicator color="#7C3AED" size="small" />
          ) : (
            <>
              <Ionicons
                name="sparkles"
                size={18}
                color={dreamContent.trim() ? '#7C3AED' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  !dreamContent.trim() && styles.buttonTextDisabled,
                ]}
              >
                Analyze with AI
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {dreamAnalysis !== null && !analysisModalVisible && (
        <View style={styles.analysisContainer}>
          <View style={styles.analysisHeader}>
            <Ionicons name="sparkles" size={20} color="#7C3AED" />
            <Text style={styles.analysisTitle}>AI Dream Analysis</Text>
          </View>
          <Text style={styles.analysisContent}>{dreamAnalysis}</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              setDreamAnalysis(null);
              setDreamContent('');
              setTags('');
              setIsLucid(false);
              setPrimaryEmotion('neutral');
              setVisibility('private');
            }}
          >
            <Text style={styles.clearButtonText}>Clear & Start New</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderSearchTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Search & Filter Dreams</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Search Dream Content</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Search dream content..."
          placeholderTextColor="#9CA3AF"
          value={searchContent}
          onChangeText={setSearchContent}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Filter by Tags</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Filter by tags..."
          placeholderTextColor="#9CA3AF"
          value={filterTags}
          onChangeText={setFilterTags}
        />
      </View>
      <View style={styles.dateContainer}>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>From Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={fromDate}
            onChangeText={setFromDate}
          />
        </View>
        <View style={styles.dateInput}>
          <Text style={styles.inputLabel}>To Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
            value={toDate}
            onChangeText={setToDate}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Lucid Dream</Text>
        <View style={styles.multiChoiceContainer}>
          {lucidOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.choiceButton,
                lucidFilter === option.id && styles.choiceButtonActive,
              ]}
              onPress={() => setLucidFilter(option.id)}
            >
              <Text
                style={[
                  styles.choiceButtonText,
                  lucidFilter === option.id && styles.choiceButtonTextActive,
                ]}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleApplyFilters}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>Apply Filters</Text>
        )}
      </TouchableOpacity>
      <View style={styles.resultsSection}>
        <Text style={styles.subsectionTitle}>Search Results</Text>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#7C3AED" size="large" />
            <Text style={styles.loadingText}>Loading dreams...</Text>
          </View>
        ) : dreams.length > 0 ? (
          dreams.map((dream) => (
            <TouchableOpacity
              key={dream.id}
              style={styles.dreamCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/dream-detail/${dream.id}`)}
            >
              <View style={styles.dreamHeader}>
                <Text style={styles.dreamDate}>
                  {formatDate(dream.timestamp)}
                </Text>
                {dream.is_lucid && (
                  <View style={styles.lucidBadge}>
                    <Text style={styles.lucidBadgeText}>Lucid</Text>
                  </View>
                )}
              </View>
              <Text style={styles.dreamContent} numberOfLines={2}>
                {dream.content}
              </Text>
              <View style={styles.dreamMeta}>
                <Text style={styles.dreamEmotion}>
                  Emotion: {dream.emotion || 'Not specified'}
                </Text>
                <Text style={styles.dreamTags}>
                  Tags:{' '}
                  {dream.tags?.map((tag) => tag.name).join(', ') || 'None'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.analysisButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleViewAnalysis(dream);
                }}
                disabled={analyzingDream}
              >
                {analyzingDream && selectedDream?.id === dream.id ? (
                  <ActivityIndicator size="small" color="#7C3AED" />
                ) : (
                  <>
                    <Ionicons
                      name="sparkles-outline"
                      size={16}
                      color="#7C3AED"
                    />
                    <Text style={styles.analysisButtonText}>
                      {dream.ai_analysis
                        ? 'View Analysis'
                        : 'Generate Analysis'}{' '}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateText}>No dreams found</Text>
            <Text style={styles.emptyStateSubtext}>
              Record your dreams or adjust your search criteria
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const tabs = [
    { id: 'record', name: 'Record Dream' },
    { id: 'search', name: 'Search & Filter' },
  ];

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.backButton} />
        <Text style={styles.headerTitle}>Dream Journal</Text>
        <View style={styles.rightAction} />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
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

      <View style={styles.content}>
        {activeTab === 'record' ? renderRecordTab() : renderSearchTab()}
      </View>

      {/* Analysis Modal */}
      {renderAnalysisModal()}
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
    width: 44,
    height: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: palette.primary,
  },
  tabText: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
  },
  activeTabText: {
    color: palette.primary,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: spacing.xl,
  },
  sectionTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
    marginBottom: spacing.lg,
  },
  subsectionTitle: {
    ...typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.xxs,
  },
  textInput: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: palette.textPrimary,
  },
  textArea: {
    backgroundColor: palette.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.divider,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: palette.textPrimary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  multiChoiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  choiceButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: palette.divider,
    backgroundColor: palette.surface,
  },
  choiceButtonActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  choiceButtonText: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  choiceButtonTextActive: {
    color: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.xs,
    borderWidth: 2,
    borderColor: palette.divider,
    backgroundColor: palette.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: palette.primary,
    backgroundColor: palette.primary,
  },
  checkboxLabel: {
    ...typography.body,
    color: palette.textPrimary,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dateInput: {
    flex: 1,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  primaryButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  primaryButtonText: {
    ...typography.body,
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: palette.primary,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    ...typography.body,
    color: palette.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: palette.textMuted,
  },
  resultsSection: {
    marginTop: spacing.xl,
  },
  dreamCard: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  dreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  dreamDate: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  lucidBadge: {
    backgroundColor: palette.success,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radii.pill,
  },
  lucidBadgeText: {
    color: 'white',
    ...typography.caption,
    fontWeight: '600',
  },
  dreamContent: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  dreamMeta: {
    gap: spacing.xxs,
    marginBottom: spacing.md,
  },
  dreamEmotion: {
    ...typography.caption,
    color: palette.textSecondary,
    textTransform: 'capitalize',
  },
  dreamTags: {
    ...typography.caption,
    color: palette.textSecondary,
  },
  loadingContainer: {
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: palette.textSecondary,
    ...typography.bodySecondary,
  },
  emptyState: {
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: spacing.md,
    color: palette.textPrimary,
    ...typography.body,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    marginTop: spacing.xs,
    color: palette.textSecondary,
    ...typography.bodySecondary,
    textAlign: 'center',
  },
  analysisContainer: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: `${palette.primary}10`,
    borderWidth: 1,
    borderColor: `${palette.primary}20`,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  analysisTitle: {
    ...typography.body,
    fontWeight: '600',
    color: palette.textPrimary,
    marginLeft: spacing.xs,
  },
  analysisContent: {
    ...typography.bodySecondary,
    color: palette.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  clearButton: {
    backgroundColor: palette.primary,
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.soft,
  },
  clearButtonText: {
    ...typography.body,
    color: 'white',
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${palette.primary}15`,
    borderRadius: radii.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  analysisButtonText: {
    ...typography.caption,
    color: palette.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.subheading,
    color: palette.textPrimary,
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalDreamSummary: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: palette.backgroundSecondary,
    borderRadius: radii.md,
  },
  modalDreamDate: {
    ...typography.caption,
    color: palette.textSecondary,
    marginBottom: spacing.xs,
  },
  modalDreamContent: {
    ...typography.bodySecondary,
    color: palette.textPrimary,
  },
  modalAnalysisContainer: {
    flex: 1,
  },
  modalAnalysisText: {
    ...typography.body,
    color: palette.textSecondary,
    lineHeight: 24,
  },
});

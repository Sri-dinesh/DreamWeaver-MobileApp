import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

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

  const getToken = async () => {
    try {
      return localStorage.getItem('userToken');
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
            <View key={dream.id} style={styles.dreamCard}>
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
                onPress={() => handleViewAnalysis(dream)}
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
            </View>
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dream Journal</Text>
        <View style={styles.placeholder} />
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
    marginBottom: 20,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  choiceButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  choiceButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  choiceButtonTextActive: {
    color: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#7C3AED',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
  resultsSection: {
    marginTop: 24,
  },
  dreamCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 8,
  },
  dreamDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  lucidBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  lucidBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  dreamContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  dreamMeta: {
    gap: 4,
    marginBottom: 12,
  },
  dreamEmotion: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  dreamTags: {
    fontSize: 12,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
  },
  analysisContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  analysisContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  analysisButtonText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDreamSummary: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  modalDreamDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalDreamContent: {
    fontSize: 14,
    color: '#1F2937',
  },
  modalAnalysisContainer: {
    flex: 1,
  },
  modalAnalysisText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});

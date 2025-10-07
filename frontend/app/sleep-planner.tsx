import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import {
  getSleepPlans,
  createOrUpdateSleepPlan,
  generateSleepRitual,
  searchSleepPlans,
  SleepPlanSearchParams,
  SleepPlan,
} from '@/services/sleepService';
import { LinearGradient } from 'expo-linear-gradient';

export default function SleepPlannerScreen() {
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [generatingRitual, setGeneratingRitual] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchParams, setSearchParams] = useState<SleepPlanSearchParams>({});
  const [ritualModalVisible, setRitualModalVisible] = useState(false);
  const [currentRitual, setCurrentRitual] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SleepPlan | null>(null);

  // Animation value for ritual modal
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Today's sleep plan states
  const [sleepGoal, setSleepGoal] = useState('');
  const [targetBedtime, setTargetBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');

  // Past plans state
  const [pastPlans, setPastPlans] = useState<SleepPlan[]>([]);

  // Function to fetch past sleep plans
  const fetchPastPlans = async () => {
    try {
      setLoading(true);
      const plans = await getSleepPlans();
      setPastPlans(plans);
    } catch (error) {
      console.error('Error fetching sleep plans:', error);
      Alert.alert('Error', 'Failed to fetch sleep plans');
    } finally {
      setLoading(false);
    }
  };

  // Check if there's a plan for today when the component mounts
  useEffect(() => {
    const checkTodaysPlan = async () => {
      try {
        setLoading(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        const plans = await getSleepPlans();

        // Find today's plan if it exists
        const todaysPlan = plans.find(
          (plan) => format(new Date(plan.plan_date), 'yyyy-MM-dd') === today
        );

        if (todaysPlan) {
          setSleepGoal(todaysPlan.goal);
          if (todaysPlan.sleep_time) {
            setTargetBedtime(format(new Date(todaysPlan.sleep_time), 'HH:mm'));
          }
          if (todaysPlan.wake_time) {
            setWakeTime(format(new Date(todaysPlan.wake_time), 'HH:mm'));
          }
          // Store the current plan
          setCurrentPlan(todaysPlan);
        }

        setPastPlans(plans);
      } catch (error) {
        console.error("Error checking today's plan:", error);
      } finally {
        setLoading(false);
      }
    };

    checkTodaysPlan();
  }, []);

  // Switch to past plans tab and refresh data
  useEffect(() => {
    if (activeTab === 'past') {
      fetchPastPlans();
    }
  }, [activeTab]);

  // Animation effect for modal
  useEffect(() => {
    if (ritualModalVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [ritualModalVisible, fadeAnim]);

  const handleSavePlan = async () => {
    if (!sleepGoal.trim() || !targetBedtime || !wakeTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      // Create a sleep time Date object (today's date + time)
      const today = new Date();
      const [sleepHours, sleepMinutes] = targetBedtime.split(':').map(Number);
      const sleepTime = new Date(today);
      sleepTime.setHours(sleepHours, sleepMinutes, 0, 0);

      // Create a wake time Date object (today's date + time)
      const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number);
      const wakeTimeDate = new Date(today);
      wakeTimeDate.setHours(wakeHours, wakeMinutes, 0, 0);

      // If wake time is before sleep time, assume it's for the next day
      if (wakeTimeDate <= sleepTime) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }

      // Create the plan object
      const plan: SleepPlan = {
        plan_date: format(today, 'yyyy-MM-dd'),
        goal: sleepGoal,
        sleep_time: sleepTime.toISOString(),
        wake_time: wakeTimeDate.toISOString(),
        ai_ritual_suggestion: currentPlan?.ai_ritual_suggestion,
      };

      // Save the plan
      const savedPlan = await createOrUpdateSleepPlan(plan);
      setCurrentPlan(savedPlan);

      Alert.alert('Success', 'Sleep plan saved successfully!');

      // Refresh past plans
      await fetchPastPlans();
    } catch (error) {
      console.error('Error saving sleep plan:', error);
      Alert.alert('Error', 'Failed to save sleep plan');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRitual = async () => {
    if (!sleepGoal.trim()) {
      Alert.alert('Error', 'Please enter your sleep goal first');
      return;
    }

    try {
      setGeneratingRitual(true);
      const today = format(new Date(), 'yyyy-MM-dd');
      const ritual = await generateSleepRitual(sleepGoal, today);

      // Update current ritual and plan
      setCurrentRitual(ritual);
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, ai_ritual_suggestion: ritual });
      }

      // Show the ritual in modal instead of alert
      setRitualModalVisible(true);
    } catch (error) {
      console.error('Error generating ritual:', error);
      Alert.alert('Error', 'Failed to generate sleep ritual');
    } finally {
      setGeneratingRitual(false);
    }
  };

  const handleViewRitual = async (plan: SleepPlan) => {
    if (plan.ai_ritual_suggestion) {
      // If plan already has a ritual, show it
      setCurrentRitual(plan.ai_ritual_suggestion);
      setCurrentPlan(plan);
      setRitualModalVisible(true);
    } else {
      // If no ritual exists, generate one
      try {
        setGeneratingRitual(true);
        const ritual = await generateSleepRitual(
          plan.goal,
          format(new Date(plan.plan_date), 'yyyy-MM-dd')
        );

        setCurrentRitual(ritual);
        setCurrentPlan({ ...plan, ai_ritual_suggestion: ritual });
        setRitualModalVisible(true);
      } catch (error) {
        console.error('Error generating ritual for plan:', error);
        Alert.alert('Error', 'Failed to generate sleep ritual');
      } finally {
        setGeneratingRitual(false);
      }
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await searchSleepPlans(searchParams);
      setPastPlans(results);
      setSearchVisible(false);
    } catch (error) {
      console.error('Error searching plans:', error);
      Alert.alert('Error', 'Failed to search sleep plans');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = async () => {
    setSearchParams({});
    await fetchPastPlans();
  };

  // Update the ritual modal to center the content better with proper padding
  const renderRitualModal = () => (
    <Modal
      visible={ritualModalVisible}
      transparent
      animationType="none"
      onRequestClose={() => setRitualModalVisible(false)}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.modalDismissArea}
          onPress={() => setRitualModalVisible(false)}
        />
        <View style={styles.modalContainerCentered}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sleep Ritual</Text>
              <TouchableOpacity onPress={() => setRitualModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
            >
              <View style={styles.ritualContentContainer}>
                <Text style={styles.ritualTitle}>
                  Your Personalized Sleep Ritual
                </Text>
                <Text style={styles.ritualSubtitle}>
                  For goal: {currentPlan?.goal}
                </Text>

                {currentRitual ? (
                  <View style={styles.formattedRitualContent}>
                    {formatRitualText(currentRitual).map((paragraph, index) => (
                      <Text
                        key={index}
                        style={[
                          styles.ritualParagraph,
                          paragraph.startsWith('**Step') &&
                            styles.ritualStepHeading,
                          paragraph.startsWith('##') &&
                            styles.ritualMainHeading,
                          paragraph.startsWith('###') &&
                            styles.ritualSubHeading,
                          paragraph.startsWith('•') && styles.ritualListItem,
                        ]}
                      >
                        {paragraph}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No ritual available.</Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setRitualModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );

  // Add this helper function to format the ritual text nicely
  const formatRitualText = (text: string): string[] => {
    if (!text) return [];

    // Split the text into paragraphs
    const paragraphs = text.split('\n').filter((para) => para.trim() !== '');

    // Process each paragraph to ensure proper formatting
    return paragraphs.map((para) => {
      // Clean up any unnecessary markers
      para = para.replace(/---/g, '');
      return para.trim();
    });
  };

  // Update the search modal for better alignment
  const renderSearchModal = () => (
    <Modal
      visible={searchVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setSearchVisible(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.searchModalContainer}
      >
        <View style={styles.searchModalContentCentered}>
          <View style={styles.searchModalHeader}>
            <Text style={styles.searchModalTitle}>Search Plans</Text>
            <TouchableOpacity onPress={() => setSearchVisible(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.searchModalBody}
            contentContainerStyle={styles.searchModalBodyContent}
          >
            <View style={styles.searchFieldContainer}>
              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>Keyword</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by goal..."
                  value={searchParams.query || ''}
                  onChangeText={(text) =>
                    setSearchParams({ ...searchParams, query: text })
                  }
                />
              </View>

              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>Start Date</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="YYYY-MM-DD"
                  value={searchParams.startDate || ''}
                  onChangeText={(text) =>
                    setSearchParams({ ...searchParams, startDate: text })
                  }
                />
              </View>

              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>End Date</Text>
                <TextInput
                  style={styles.searchInput}
                  placeholder="YYYY-MM-DD"
                  value={searchParams.endDate || ''}
                  onChangeText={(text) =>
                    setSearchParams({ ...searchParams, endDate: text })
                  }
                />
              </View>

              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>Sort By</Text>
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      searchParams.sortBy === 'plan_date' &&
                        styles.sortOptionActive,
                    ]}
                    onPress={() =>
                      setSearchParams({
                        ...searchParams,
                        sortBy: 'plan_date',
                        sortOrder: searchParams.sortOrder || 'desc',
                      })
                    }
                  >
                    <Text
                      style={
                        searchParams.sortBy === 'plan_date'
                          ? styles.sortTextActive
                          : styles.sortText
                      }
                    >
                      Date
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      searchParams.sortBy === 'goal' && styles.sortOptionActive,
                    ]}
                    onPress={() =>
                      setSearchParams({
                        ...searchParams,
                        sortBy: 'goal',
                        sortOrder: searchParams.sortOrder || 'asc',
                      })
                    }
                  >
                    <Text
                      style={
                        searchParams.sortBy === 'goal'
                          ? styles.sortTextActive
                          : styles.sortText
                      }
                    >
                      Goal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.searchField}>
                <Text style={styles.searchLabel}>Sort Order</Text>
                <View style={styles.sortOptions}>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      searchParams.sortOrder === 'asc' &&
                        styles.sortOptionActive,
                    ]}
                    onPress={() =>
                      setSearchParams({ ...searchParams, sortOrder: 'asc' })
                    }
                  >
                    <Text
                      style={
                        searchParams.sortOrder === 'asc'
                          ? styles.sortTextActive
                          : styles.sortText
                      }
                    >
                      Ascending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sortOption,
                      searchParams.sortOrder === 'desc' &&
                        styles.sortOptionActive,
                    ]}
                    onPress={() =>
                      setSearchParams({ ...searchParams, sortOrder: 'desc' })
                    }
                  >
                    <Text
                      style={
                        searchParams.sortOrder === 'desc'
                          ? styles.sortTextActive
                          : styles.sortText
                      }
                    >
                      Descending
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.searchButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={clearSearch}
                >
                  <Text style={styles.secondaryButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSearch}
                >
                  <Text style={styles.primaryButtonText}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  const renderTodayTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Set Today's Sleep Plan</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          What's your sleep goal for tonight?
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="I want to have a lucid dream and practice flying..."
          multiline
          value={sleepGoal}
          onChangeText={setSleepGoal}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Target Bedtime</Text>
          <TextInput
            style={styles.textInput}
            placeholder="22:30"
            value={targetBedtime}
            onChangeText={setTargetBedtime}
            keyboardType="numbers-and-punctuation"
          />
        </View>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Wake Time</Text>
          <TextInput
            style={styles.textInput}
            placeholder="06:30"
            value={wakeTime}
            onChangeText={setWakeTime}
            keyboardType="numbers-and-punctuation"
          />
        </View>
      </View>

      {/* Show ritual preview if it exists */}
      {currentPlan?.ai_ritual_suggestion && (
        <TouchableOpacity
          style={styles.ritualPreview}
          onPress={() => {
            setCurrentRitual(currentPlan?.ai_ritual_suggestion ?? null);
            setRitualModalVisible(true);
          }}
        >
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.ritualPreviewGradient}
          >
            <View style={styles.ritualPreviewHeader}>
              <Ionicons name="sparkles-outline" size={20} color="#8B5CF6" />
              <Text style={styles.ritualPreviewTitle}>Your Sleep Ritual</Text>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </View>
            <Text style={styles.ritualPreviewContent} numberOfLines={3}>
              {currentPlan.ai_ritual_suggestion}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            (loading || !sleepGoal.trim() || !targetBedtime || !wakeTime) &&
              styles.buttonDisabled,
          ]}
          onPress={handleSavePlan}
          disabled={loading || !sleepGoal.trim() || !targetBedtime || !wakeTime}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Save Plan</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            (generatingRitual || !sleepGoal.trim()) && styles.buttonDisabled,
          ]}
          onPress={handleGenerateRitual}
          disabled={generatingRitual || !sleepGoal.trim()}
        >
          {generatingRitual ? (
            <ActivityIndicator size="small" color="#7C3AED" />
          ) : (
            <>
              <Ionicons
                name="sparkles"
                size={18}
                color={sleepGoal.trim() ? '#7C3AED' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  !sleepGoal.trim() && styles.buttonTextDisabled,
                ]}
              >
                Generate Ritual with AI
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderPastPlansTab = () => (
    <View style={styles.pastPlansContainer}>
      <View style={styles.pastPlansHeader}>
        <Text style={styles.sectionTitle}>Your Past Sleep Plans</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setSearchVisible(true)}
        >
          <Ionicons name="search" size={20} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      {/* Show applied filters if any */}
      {(searchParams.query ||
        searchParams.startDate ||
        searchParams.endDate) && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filtersLabel}>Filters:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterTags}
          >
            {searchParams.query && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>"{searchParams.query}"</Text>
              </View>
            )}
            {searchParams.startDate && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>
                  From: {searchParams.startDate}
                </Text>
              </View>
            )}
            {searchParams.endDate && (
              <View style={styles.filterTag}>
                <Text style={styles.filterTagText}>
                  To: {searchParams.endDate}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.clearFilters} onPress={clearSearch}>
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView
        style={styles.pastPlansList}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#7C3AED"
            style={styles.loader}
          />
        ) : pastPlans.length === 0 ? (
          <Text style={styles.emptyText}>No sleep plans found</Text>
        ) : (
          pastPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planDate}>
                  {format(new Date(plan.plan_date), 'EEEE, MMMM d, yyyy')}
                </Text>

                {plan.ai_ritual_suggestion ? (
                  <TouchableOpacity
                    style={styles.viewRitualButton}
                    onPress={() => handleViewRitual(plan)}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={16}
                      color="#7C3AED"
                    />
                    <Text style={styles.viewRitualText}>View Ritual</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.viewRitualButton}
                    onPress={() => handleViewRitual(plan)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={16}
                      color="#7C3AED"
                    />
                    <Text style={styles.viewRitualText}>Generate Ritual</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.planGoal}>{plan.goal}</Text>

              <View style={styles.planTimes}>
                {plan.sleep_time && (
                  <View style={styles.timeItem}>
                    <Ionicons name="moon" size={16} color="#6B7280" />
                    <Text style={styles.timeText}>
                      Bedtime: {format(new Date(plan.sleep_time), 'HH:mm')}
                    </Text>
                  </View>
                )}
                {plan.wake_time && (
                  <View style={styles.timeItem}>
                    <Ionicons name="sunny" size={16} color="#6B7280" />
                    <Text style={styles.timeText}>
                      Wake: {format(new Date(plan.wake_time), 'HH:mm')}
                    </Text>
                  </View>
                )}

                {plan.sleep_time && plan.wake_time && (
                  <View style={styles.timeItem}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.timeText}>
                      Duration:{' '}
                      {calculateDuration(plan.sleep_time, plan.wake_time)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );

  const calculateDuration = (sleep: string, wake: string): string => {
    const sleepTime = new Date(sleep);
    const wakeTime = new Date(wake);

    // Calculate duration in hours
    let diffMs = wakeTime.getTime() - sleepTime.getTime();
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add a day if wake time is "earlier"
    }

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  const tabs = [
    { id: 'today', name: "Today's Plan" },
    { id: 'past', name: 'Past Plans' },
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
        <Text style={styles.headerTitle}>Sleep Planner</Text>
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
        {activeTab === 'today' ? renderTodayTab() : renderPastPlansTab()}
      </View>

      {/* Modals */}
      {renderRitualModal()}
      {renderSearchModal()}
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  timeInput: {
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
  planCard: {
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  planGoal: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 18,
  },
  planTimes: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 16,
  },

  // New styles for the search and filter UI
  pastPlansContainer: {
    flex: 1,
    padding: 24,
  },
  pastPlansHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchModalBodyContent: {
    paddingBottom: 20,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: '100%',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  filterTags: {
    flexDirection: 'row',
  },
  filterTag: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterTagText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
  },
  clearFilters: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  clearFiltersText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  pastPlansList: {
    flex: 1,
  },

  // Styles for ritual preview
  ritualPreview: {
    marginBottom: 20,
  },
  ritualPreviewGradient: {
    borderRadius: 12,
    padding: 16,
  },
  ritualPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ritualPreviewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 8,
    flex: 1,
  },
  ritualPreviewContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },

  // Styles for view ritual button
  viewRitualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewRitualText: {
    color: '#7C3AED',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  // Styles for the ritual modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalContainerCentered: {
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalBodyContent: {
    paddingHorizontal: 16,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  ritualSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  ritualContent: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Styles for the search modal
  searchModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  searchModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    maxHeight: '80%',
    padding: 20,
  },
  searchModalContentCentered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -250 }],
    width: 300,
    maxHeight: 500,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  searchModalBody: {
    maxHeight: '90%',
  },
  searchFieldContainer: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  searchField: {
    marginBottom: 16,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sortOptionActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderColor: '#7C3AED',
  },
  sortText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  sortTextActive: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  searchButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  ritualContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  formattedRitualContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ritualParagraph: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'left',
  },
  ritualMainHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  ritualSubHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  ritualStepHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 8,
    marginBottom: 12,
  },
  ritualListItem: {
    paddingLeft: 16,
    marginBottom: 12,
  },
});

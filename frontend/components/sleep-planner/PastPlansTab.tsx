import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SleepPlan, SleepPlanSearchParams } from '@/services/sleepService';

interface PastPlansTabProps {
  pastPlans: SleepPlan[];
  loading: boolean;
  searchParams: SleepPlanSearchParams;
  setSearchParams: (params: SleepPlanSearchParams) => void;
  handleViewRitual: (plan: SleepPlan) => void;
  handleSearch: () => void;
  clearSearch: () => void;
  calculateDuration: (start: string, end: string) => string;
}

export default function PastPlansTab({
  pastPlans,
  loading,
  searchParams,
  setSearchParams,
  handleViewRitual,
  handleSearch,
  clearSearch,
  calculateDuration,
}: PastPlansTabProps) {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <View style={styles.pastPlansContainer}>
      <View style={styles.pastPlansHeader}>
        <Text style={styles.sectionTitle}>Your Past Sleep Plans</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons
            name={showSearch ? 'close' : 'filter'}
            size={20}
            color="#7C3AED"
          />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View style={styles.searchContainer}>
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

            {/* start & end date filters can be added later */}
            {/* <View style={styles.dateContainer}>
              <View style={styles.dateInput}>
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
              <View style={styles.dateInput}>
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
            </View> */}

            <View style={styles.sortContainer}>
              <View style={styles.sortField}>
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
                      style={[
                        styles.sortText,
                        searchParams.sortBy === 'plan_date' &&
                          styles.sortTextActive,
                      ]}
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
                      style={[
                        styles.sortText,
                        searchParams.sortBy === 'goal' && styles.sortTextActive,
                      ]}
                    >
                      Goal
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
}

const styles = StyleSheet.create({
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  searchFieldContainer: {
    marginBottom: 16,
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
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  sortField: {
    flex: 1,
  },
  sortOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  sortOption: {
    flex: 1,
    backgroundColor: 'white',
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
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7C3AED',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '600',
  },
  pastPlansList: {
    flex: 1,
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
});

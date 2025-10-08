import {
  PastPlansTab,
  RitualModal,
  TodayTab,
} from '@/components/sleep-planner';
import {
  createOrUpdateSleepPlan,
  generateSleepRitual,
  getSleepPlans,
  searchSleepPlans,
  SleepPlan,
  SleepPlanSearchParams,
} from '@/services/sleepService';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SleepPlannerScreen() {
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(false);
  const [generatingRitual, setGeneratingRitual] = useState(false);
  const [searchParams, setSearchParams] = useState<SleepPlanSearchParams>({});
  const [ritualModalVisible, setRitualModalVisible] = useState(false);
  const [currentRitual, setCurrentRitual] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<SleepPlan | null>(null);

  const [sleepGoal, setSleepGoal] = useState('');
  const [targetBedtime, setTargetBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [pastPlans, setPastPlans] = useState<SleepPlan[]>([]);

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

  useEffect(() => {
    const checkTodaysPlan = async () => {
      try {
        setLoading(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        const plans = await getSleepPlans();

        const todaysPlan = plans.find(
          (plan) => format(new Date(plan.plan_date), 'yyyy-MM-dd') === today
        );

        if (todaysPlan) {
          setSleepGoal(todaysPlan.goal);
          if (todaysPlan.sleep_time) {
            setTargetBedtime(format(new Date(todaysPlan.sleep_time), 'p'));
          }
          if (todaysPlan.wake_time) {
            setWakeTime(format(new Date(todaysPlan.wake_time), 'p'));
          }
          setCurrentPlan(todaysPlan);
        } else {
          setSleepGoal('');
          setTargetBedtime('');
          setWakeTime('');
          setCurrentPlan(null);
        }

        setPastPlans(plans);
      } catch (error) {
        console.error("Error checking today's plan:", error);

        setSleepGoal('');
        setTargetBedtime('');
        setWakeTime('');
        setCurrentPlan(null);
      } finally {
        setLoading(false);
      }
    };

    checkTodaysPlan();
  }, []);

  useEffect(() => {
    if (activeTab === 'past') {
      fetchPastPlans();
    } else {
      setSleepGoal('');
      setTargetBedtime('');
      setWakeTime('');
      setCurrentPlan(null);
      setCurrentRitual(null);
    }
  }, [activeTab]);

  const convertTo24HourFormat = (time: string) => {
    const [timePart, amPm] = time.split(' ');
    let [hours, minutes] = timePart.split(':');

    if (amPm === 'PM' && hours !== '12') {
      hours = (parseInt(hours, 10) + 12).toString();
    } else if (amPm === 'AM' && hours === '12') {
      hours = '00';
    }

    return `${hours}:${minutes}`;
  };

  const handleSavePlan = async () => {
    if (!sleepGoal.trim() || !targetBedtime || !wakeTime) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);

      const existingPlans = await getSleepPlans();

      const today = new Date();
      const bedtime24 = convertTo24HourFormat(targetBedtime);
      const wakeTime24 = convertTo24HourFormat(wakeTime);

      const [sleepHours, sleepMinutes] = bedtime24.split(':').map(Number);
      const sleepTime = new Date(today);
      sleepTime.setHours(sleepHours, sleepMinutes, 0, 0);

      const [wakeHours, wakeMinutes] = wakeTime24.split(':').map(Number);
      const wakeTimeDate = new Date(today);
      wakeTimeDate.setHours(wakeHours, wakeMinutes, 0, 0);

      if (wakeTimeDate <= sleepTime) {
        wakeTimeDate.setDate(wakeTimeDate.getDate() + 1);
      }

      const plan: SleepPlan = {
        plan_date: format(today, 'yyyy-MM-dd'),
        goal: sleepGoal,
        sleep_time: sleepTime.toISOString(),
        wake_time: wakeTimeDate.toISOString(),
        ai_ritual_suggestion: currentPlan?.ai_ritual_suggestion,
      };

      const savedPlan = await createOrUpdateSleepPlan(plan);

      const updatedPlans = [...existingPlans, savedPlan];
      setPastPlans(updatedPlans);

      Alert.alert('Success', 'Sleep plan saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSleepGoal('');
            setTargetBedtime('');
            setWakeTime('');
            setCurrentPlan(savedPlan);
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving sleep plan:', error);
      Alert.alert('Error', 'Failed to save sleep plan');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setSleepGoal('');
    setTargetBedtime('');
    setWakeTime('');
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

      setCurrentRitual(ritual);
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, ai_ritual_suggestion: ritual });
      } else {
        const newPlan: SleepPlan = {
          plan_date: format(new Date(), 'yyyy-MM-dd'),
          goal: sleepGoal,
          ai_ritual_suggestion: ritual,
        };
        setCurrentPlan(newPlan);
      }

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
      setCurrentRitual(plan.ai_ritual_suggestion);
      setCurrentPlan(plan);
      setRitualModalVisible(true);
    } else {
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

  const calculateDuration = (sleep: string, wake: string): string => {
    const sleepTime = new Date(sleep);
    const wakeTime = new Date(wake);

    let diffMs = wakeTime.getTime() - sleepTime.getTime();
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000;
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
        {activeTab === 'today' ? (
          <TodayTab
            sleepGoal={sleepGoal}
            setSleepGoal={setSleepGoal}
            targetBedtime={targetBedtime}
            setTargetBedtime={setTargetBedtime}
            wakeTime={wakeTime}
            setWakeTime={setWakeTime}
            handleSavePlan={handleSavePlan}
            handleClearForm={handleClearForm}
            handleGenerateRitual={handleGenerateRitual}
            loading={loading}
            generatingRitual={generatingRitual}
            currentPlan={currentPlan}
            setCurrentRitual={setCurrentRitual}
            setRitualModalVisible={setRitualModalVisible}
          />
        ) : (
          <PastPlansTab
            pastPlans={pastPlans}
            loading={loading}
            searchParams={searchParams}
            setSearchParams={setSearchParams}
            handleViewRitual={handleViewRitual}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            calculateDuration={calculateDuration}
          />
        )}
      </View>

      <RitualModal
        ritualModalVisible={ritualModalVisible}
        setRitualModalVisible={setRitualModalVisible}
        currentRitual={currentRitual}
        currentPlan={currentPlan}
      />
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
});
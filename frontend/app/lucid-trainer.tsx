import useStats from '@/hooks/useStats';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const realityTechniques = {
  fingerPalm: {
    title: 'Finger Through Palm',
    description:
      'Push a finger into your opposite palm. In a dream, it might go through.',
  },
  nosePinch: {
    title: 'Nose Pinch',
    description:
      'Pinch your nose and try to breathe. In a dream, you might still be able to.',
  },
  handsCheck: {
    title: 'Hands Check',
    description:
      'Look closely at your hands. Are there too many/few fingers? Do they look distorted?',
  },
  timeTextCheck: {
    title: 'Time/Text Check',
    description:
      'Look at a clock or text, look away, then look back. Does it change?',
  },
  lightSwitch: {
    title: 'Light Switch',
    description:
      'Try to turn a light on/off. In dreams, they often don’t work or act strangely.',
  },
};

const guidedTechniques = {
  mild: {
    title: 'MILD (Mnemonic Induction of Lucid Dreams)',
    description:
      "This technique involves repeatedly telling yourself you'll remember that you're dreaming, often combined with visualization. It focuses on setting your intention before sleep.",
    steps: [
      'Before bed, set a clear intention to recognize when you are dreaming.',
      'Visualize yourself becoming lucid in a dream.',
      'Repeat a mantra like, "Next time I’m dreaming, I will remember I’m dreaming."',
      'Allow yourself to fall asleep with that intention in mind.',
    ],
  },
  wild: {
    title: 'WILD (Wake Initiated Lucid Dreams)',
    description:
      'WILD involves transitioning directly from wakefulness to a dream while maintaining consciousness.',
    steps: [
      'Lie down comfortably and relax your body completely.',
      'Focus on your breathing and remain still.',
      'Watch for hypnagogic imagery and sensations as you drift off.',
      'Maintain a gentle awareness as you transition into the dream state.',
    ],
  },
  dots: {
    title: 'DOTS (Dreaming on The Spot)',
    description:
      'DOTS is a spontaneous approach where you decide to have a lucid dream as you fall asleep, trusting that the intention will carry over into the dream.',
    steps: [
      'As you lie in bed, firmly decide that you will have a lucid dream tonight.',
      'Focus solely on that intention without overthinking.',
      'Let yourself drift off naturally while keeping the intention in mind.',
    ],
  },
};

export default function LucidTrainerScreen() {
  const [activeTab, setActiveTab] = useState('notifications');

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [frequency, setFrequency] = useState('30');

  // store the scheduled notification id so we can cancel it later
  const [scheduledNotifId, setScheduledNotifId] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);

  const {
    stats,
    loading: statsLoading,
    refresh: refetchStatsData,
  } = useStats();

  useEffect(() => {
    if (!notifEnabled && scheduledNotifId) {
      cancelScheduledNotification(scheduledNotifId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifEnabled]);

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'web') return { granted: false, ios: false };
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return { granted: status === 'granted', ios: status === 'granted' };
    } catch (err) {
      console.error('Permission request error:', err);
      return { granted: false, ios: false };
    }
  };

  const cancelScheduledNotification = async (id: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      setScheduledNotifId(null);
      // setNotifEnabled(false); // Uncomment if you want to turn off the switch when cancelled
    } catch (err) {
      console.error('Failed to cancel scheduled notification:', err);
    }
  };

  const handleTestNotification = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Notifications are not supported on web.');
      return;
    }

    const perm = await requestNotificationPermission();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Please enable notifications in system settings.'
      );
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reality Check',
          body: 'Time to perform a reality check!',
        },
        trigger: null,
      });
      Alert.alert('Sent', 'Test notification scheduled.');
    } catch (error) {
      console.error('Notification error:', error);
      Alert.alert('Error', 'Failed to schedule notification.');
    }
  };

  const handleScheduleRepeating = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not supported', 'Notifications are not supported on web.');
      return;
    }

    const minutes = parseInt(frequency || '0', 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert(
        'Invalid frequency',
        'Please enter a valid number of minutes (greater than 0).'
      );
      return;
    }

    const perm = await requestNotificationPermission();
    if (!perm.granted) {
      Alert.alert(
        'Permission required',
        'Please enable notifications in system settings.'
      );
      return;
    }

    try {
      if (scheduledNotifId) {
        console.log(
          `Cancelling existing notification with ID: ${scheduledNotifId}`
        );
        await Notifications.cancelScheduledNotificationAsync(scheduledNotifId);
        setScheduledNotifId(null);
      }

      const trigger = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: minutes * 60,
        repeats: true,
      } as const;

      console.log(`Scheduling new notification every ${minutes} minutes.`);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Reality Check',
          body: `Perform a reality check (every ${minutes} min).`,
          sound: true,
        },
        trigger,
      });

      setScheduledNotifId(id);
      setNotifEnabled(true);

      Alert.alert(
        'Scheduled',
        `Notifications scheduled every ${minutes} minutes.`
      );
    } catch (error) {
      console.error('Scheduling error:', error);
      Alert.alert('Error', 'Failed to schedule repeating notifications.');
    }
  };

  const renderNotificationsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reality Notification Check</Text>
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingLabel}>Enable Notifications</Text>
          <Switch
            value={notifEnabled}
            onValueChange={(val) => setNotifEnabled(val)}
            trackColor={{ false: '#D1D5DB', true: '#A855F7' }}
            thumbColor={notifEnabled ? '#7C3AED' : '#9CA3AF'}
          />
        </View>
        <Text style={styles.settingDescription}>
          {notifEnabled
            ? scheduledNotifId
              ? `Notifications enabled (every ${frequency} minutes)`
              : 'Notifications enabled (not scheduled yet)'
            : 'Notifications disabled'}
        </Text>
      </View>

      {notifEnabled && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Frequency (minutes)</Text>
          <TextInput
            style={styles.textInput}
            value={frequency}
            onChangeText={setFrequency}
            keyboardType="numeric"
            placeholder="30"
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleTestNotification}
      >
        <Text style={styles.primaryButtonText}>Test Notification</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          { backgroundColor: '#f59e0b', marginTop: 8 },
        ]}
        onPress={handleScheduleRepeating}
      >
        <Text style={styles.primaryButtonText}>Schedule Repeating</Text>
      </TouchableOpacity>

      {scheduledNotifId ? (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: '#ef4444', marginTop: 8 },
          ]}
          onPress={() => cancelScheduledNotification(scheduledNotifId)}
        >
          <Text style={styles.primaryButtonText}>Cancel Scheduled</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );

  const renderTechniquesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Reality Check Techniques</Text>
      <View style={styles.techniquesList}>
        {(
          Object.keys(realityTechniques) as (keyof typeof realityTechniques)[]
        ).map((key) => (
          <View key={key} style={styles.techniqueItem}>
            <Text style={styles.techniqueName}>
              {realityTechniques[key].title}
            </Text>
            <Text style={styles.techniqueDescription}>
              {realityTechniques[key].description}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderGuidedTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>How to Perform Reality Checks</Text>
      <Text style={styles.guidedDescription}>
        Reality checks are essential. Regularly examine your environment by
        checking your hands, pinching your nose, looking at clocks or text, or
        toggling light switches—these are proven methods to become aware in a
        dream.
      </Text>
      <TouchableOpacity
        style={styles.exploreButton}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.exploreButtonText}>View Step-by-Step Guide</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderTechniquesModal = () => (
    <Modal visible={showModal}>
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Reality Check Techniques</Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowModal(false)}
          >
            <Ionicons name="close" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalContent}>
          {(
            Object.keys(guidedTechniques) as (keyof typeof guidedTechniques)[]
          ).map((key) => (
            <View key={key} style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>
                {guidedTechniques[key].title}
              </Text>
              <Text style={styles.modalDescription}>
                {guidedTechniques[key].description}
              </Text>
              <Text style={styles.modalStepsTitle}>Steps:</Text>
              <Text style={styles.modalSteps}>
                {guidedTechniques[key].steps
                  .map((step: string, index: number) => `${index + 1}. ${step}`)
                  .join('\n')}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );

  const renderStatsTab = () => {
    const total = stats?.dreamCount || 0;
    const lucid = stats?.lucidDreamCount || 0;
    const ratio = total > 0 ? ((lucid / total) * 100).toFixed(1) : '0';
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Your Lucid Dream Statistics</Text>
        {statsLoading ? (
          <ActivityIndicator size="large" color="#7C3AED" />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="book-outline" size={24} color="#7C3AED" />
              <Text style={styles.statNumber}>{total}</Text>
              <Text style={styles.statLabel}>Total Dreams Logged</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flash-outline" size={24} color="#10B981" />
              <Text style={styles.statNumber}>{lucid}</Text>
              <Text style={styles.statLabel}>Lucid Dreams Recorded</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up-outline" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>{ratio}%</Text>
              <Text style={styles.statLabel}>Lucid Dream Ratio</Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refetchStatsData}
        >
          <Ionicons name="refresh" size={16} color="#7C3AED" />
          <Text style={styles.refreshButtonText}>Refresh Statistics</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const tabs = [
    { id: 'notifications', name: 'Notifications' },
    { id: 'techniques', name: 'Techniques' },
    { id: 'guided', name: 'Guided' },
    { id: 'stats', name: 'Statistics' },
  ];

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucid Trainer</Text>
        <View style={styles.rightAction} />
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
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
        </ScrollView>
      </View>

      <View style={styles.content}>
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'techniques' && renderTechniquesTab()}
        {activeTab === 'guided' && renderGuidedTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </View>

      {renderTechniquesModal()}
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  rightAction: {
    padding: 4,
  },
  tabsContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  activeTab: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
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
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
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
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  techniquesList: {
    gap: 16,
  },
  techniqueItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  techniqueName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  techniqueDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '47%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  guidedDescription: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    gap: 8,
  },
  refreshButtonText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  modalSection: {
    marginBottom: 32,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  modalSteps: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});

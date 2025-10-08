import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SleepPlan } from '@/services/sleepService';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

interface TodayTabProps {
  sleepGoal: string;
  setSleepGoal: (text: string) => void;
  targetBedtime: string;
  setTargetBedtime: (text: string) => void;
  wakeTime: string;
  setWakeTime: (text: string) => void;
  handleSavePlan: () => void;
  handleClearForm: () => void;
  handleGenerateRitual: () => void;
  loading: boolean;
  generatingRitual: boolean;
  currentPlan: SleepPlan | null;
  setCurrentRitual: (ritual: string | null) => void;
  setRitualModalVisible: (visible: boolean) => void;
}

export default function TodayTab({
  sleepGoal,
  setSleepGoal,
  targetBedtime,
  setTargetBedtime,
  wakeTime,
  setWakeTime,
  handleSavePlan,
  handleClearForm,
  handleGenerateRitual,
  loading,
  generatingRitual,
  currentPlan,
  setCurrentRitual,
  setRitualModalVisible,
}: TodayTabProps) {
  const [showPicker, setShowPicker] = useState<{
    type: 'bedtime' | 'wake' | null;
  }>({ type: null });
  const [pickerTime, setPickerTime] = useState(new Date());

  // handle picker change
  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') setShowPicker({ type: null });
    if (selectedDate) {
      const formattedTime = selectedDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      if (showPicker.type === 'bedtime') setTargetBedtime(formattedTime);
      else if (showPicker.type === 'wake') setWakeTime(formattedTime);
      setPickerTime(selectedDate);
    }
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Set Today's Sleep Plan</Text>
        <TouchableOpacity style={styles.clearButton} onPress={handleClearForm}>
          <Ionicons name="refresh-outline" size={20} color="#6B7280" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          What's your sleep goal for tonight?
        </Text>
        <TextInput
          style={styles.textArea}
          placeholder="I want to have a lucid dream and practice flying..."
          multiline
          placeholderTextColor="#9CA3AF"
          value={sleepGoal}
          onChangeText={setSleepGoal}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.timeContainer}>
        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Target Bedtime</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => {
              setShowPicker({ type: 'bedtime' });
              setPickerTime(new Date());
            }}
          >
            <Text style={styles.timePickerText}>
              {targetBedtime || 'Select Time'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timeInput}>
          <Text style={styles.inputLabel}>Wake Time</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => {
              setShowPicker({ type: 'wake' });
              setPickerTime(new Date());
            }}
          >
            <Text style={styles.timePickerText}>
              {wakeTime || 'Select Time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker.type && (
        <DateTimePicker
          value={pickerTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, padding: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  clearButtonText: { fontSize: 14, color: '#6B7280', marginLeft: 4 },
  inputContainer: { marginBottom: 20 },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
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
  timeContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  timeInput: { flex: 1 },
  timePickerButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  timePickerText: { fontSize: 16, color: '#1F2937' },
  ritualPreview: { marginBottom: 20 },
  ritualPreviewGradient: { borderRadius: 12, padding: 16 },
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
  ritualPreviewContent: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  buttonContainer: { gap: 12, marginTop: 8 },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
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
  secondaryButtonText: { color: '#7C3AED', fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.5 },
  buttonTextDisabled: { color: '#9CA3AF' },
});

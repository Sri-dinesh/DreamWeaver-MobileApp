import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SleepPlan } from '@/services/sleepService';

interface RitualModalProps {
  ritualModalVisible: boolean;
  setRitualModalVisible: (visible: boolean) => void;
  currentRitual: string | null;
  currentPlan: SleepPlan | null;
}

export default function RitualModal({
  ritualModalVisible,
  setRitualModalVisible,
  currentRitual,
  currentPlan,
}: RitualModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const formatRitualText = (text: string): string[] => {
    if (!text) return [];

    const paragraphs = text.split('\n').filter((para) => para.trim() !== '');

    return paragraphs.map((para) => {
      para = para.replace(/---/g, '');
      return para.trim();
    });
  };

  return (
    <Modal
      visible={ritualModalVisible}
      transparent
      animationType="none"
      onRequestClose={() => setRitualModalVisible(false)}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
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
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerCentered: {
    width: '90%',
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
  ritualContentContainer: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 16,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 16,
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
});
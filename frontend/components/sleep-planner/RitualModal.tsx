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
    Animated.timing(fadeAnim, {
      toValue: ritualModalVisible ? 1 : 0,
      duration: ritualModalVisible ? 300 : 200,
      useNativeDriver: true,
    }).start();
  }, [ritualModalVisible]);

  const formatRitualText = (text: string): string[] => {
    if (!text) return [];
    const paragraphs = text.split('\n').filter((para) => para.trim() !== '');
    return paragraphs.map((para) => para.replace(/---/g, '').trim());
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
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sleep Ritual</Text>
            <TouchableOpacity
              onPress={() => setRitualModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={26} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.ritualContentContainer}>
              <Text style={styles.ritualTitle}>Your Personalized Sleep Ritual</Text>
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
                        paragraph.startsWith('##') && styles.ritualMainHeading,
                        paragraph.startsWith('###') && styles.ritualSubHeading,
                        paragraph.startsWith('**Step') && styles.ritualStepHeading,
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

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setRitualModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  modalContainerCentered: {
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalBody: {
    flexGrow: 1,
  },
  modalBodyContent: {
    paddingBottom: 16,
  },
  ritualContentContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  ritualTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 6,
  },
  ritualSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 14,
    fontStyle: 'italic',
  },
  formattedRitualContent: {
    width: '100%',
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  ritualParagraph: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'left',
  },
  ritualMainHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  ritualSubHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 12,
    textAlign: 'center',
  },
  ritualStepHeading: {
    fontSize: 17,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 8,
    marginBottom: 10,
  },
  ritualListItem: {
    paddingLeft: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#6B7280',
    fontSize: 16,
  },
  modalFooter: {
    marginTop: 8,
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

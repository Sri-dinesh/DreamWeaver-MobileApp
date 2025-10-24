import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface BinauralBeatParams {
  carrierFrequency: string;
  beatFrequency: string;
  duration: string;
  volume: string;
}

interface BinauralBeatGeneratorProps {
  onGenerationComplete?: () => void;
}

export default function BinauralBeatGenerator({ onGenerationComplete }: BinauralBeatGeneratorProps) {
  const [params, setParams] = useState<BinauralBeatParams>({
    carrierFrequency: '100',
    beatFrequency: '10',
    duration: '10',
    volume: '-6',
  });
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<any>(null);

  const handleInputChange = (field: keyof BinauralBeatParams, value: string) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const carrier = parseFloat(params.carrierFrequency);
    const beat = parseFloat(params.beatFrequency);
    const duration = parseFloat(params.duration);

    if (isNaN(carrier) || carrier < 20 || carrier > 20000) {
      Alert.alert('Invalid Input', 'Carrier frequency must be between 20-20000 Hz');
      return false;
    }

    if (isNaN(beat) || beat < 0.5 || beat > 40) {
      Alert.alert('Invalid Input', 'Beat frequency must be between 0.5-40 Hz');
      return false;
    }

    if (isNaN(duration) || duration < 1 || duration > 120) {
      Alert.alert('Invalid Input', 'Duration must be between 1-120 minutes');
      return false;
    }

    return true;
  };

  const generateBinauralBeat = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const token = await getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/ai/binaural-beat`,
        {
          carrierFrequency: parseFloat(params.carrierFrequency),
          beatFrequency: parseFloat(params.beatFrequency),
          duration: parseFloat(params.duration),
          volume: parseFloat(params.volume),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGeneratedAudio(response.data);
      Alert.alert('Success', 'Binaural beat generated successfully!');
      if (onGenerationComplete) {
        onGenerationComplete();
      }
    } catch (error: any) {
      console.error('Error generating binaural beat:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to generate binaural beat'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadAudio = async () => {
    if (!generatedAudio) return;

    try {
      const audioUrl = `${API_URL}${generatedAudio.audioUrl}`;
      // In a real app, you would download the file here
      Alert.alert('Download', `Audio URL: ${audioUrl}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to download audio');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎵 Binaural Beat Generator</Text>

        {/* Carrier Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carrier Frequency (Hz)</Text>
          <Text style={styles.hint}>Base frequency (20-20000 Hz)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={params.carrierFrequency}
              onChangeText={(value) => handleInputChange('carrierFrequency', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>Hz</Text>
          </View>
        </View>

        {/* Beat Frequency */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Beat Frequency (Hz)</Text>
          <Text style={styles.hint}>Brainwave target (0.5-40 Hz)</Text>
          <Text style={styles.frequencyGuide}>
            • Theta (4-8 Hz): Deep meditation, sleep
            • Alpha (8-12 Hz): Relaxation, focus
            • Beta (12-30 Hz): Alertness, concentration
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={params.beatFrequency}
              onChangeText={(value) => handleInputChange('beatFrequency', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>Hz</Text>
          </View>
        </View>

        {/* Duration */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <Text style={styles.hint}>1-120 minutes</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="10"
              value={params.duration}
              onChangeText={(value) => handleInputChange('duration', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>min</Text>
          </View>
        </View>

        {/* Volume */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Volume (dBFS)</Text>
          <Text style={styles.hint}>-0 is max, -60 is very quiet</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="-6"
              value={params.volume}
              onChangeText={(value) => handleInputChange('volume', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>dB</Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateBinauralBeat}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="musical-notes" size={20} color="white" />
              <Text style={styles.generateButtonText}>Generate Binaural Beat</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Generated Audio Info */}
        {generatedAudio && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.resultTitle}>Audio Generated!</Text>
            </View>
            <View style={styles.resultDetails}>
              <Text style={styles.resultText}>
                📁 File: {generatedAudio.fileName}
              </Text>
              <Text style={styles.resultText}>
                📊 Size: {(generatedAudio.size / 1024 / 1024).toFixed(2)} MB
              </Text>
              <Text style={styles.resultText}>
                ⏱️ Duration: {generatedAudio.duration} minutes
              </Text>
            </View>
            <TouchableOpacity style={styles.downloadButton} onPress={downloadAudio}>
              <Ionicons name="download" size={18} color="white" />
              <Text style={styles.downloadButtonText}>Download Audio</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  frequencyGuide: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1F2937',
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },
  generateButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  generateButtonDisabled: {
    opacity: 0.6,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  resultDetails: {
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 6,
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

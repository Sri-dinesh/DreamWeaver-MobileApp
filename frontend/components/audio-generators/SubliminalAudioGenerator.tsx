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

interface SubliminalAudioParams {
  affirmationText: string;
  maskingSound: 'white-noise' | 'ambient-tone';
  duration: string;
  subliminalVolume: string;
  maskingVolume: string;
}

interface SubliminalAudioGeneratorProps {
  onGenerationComplete?: () => void;
}

export default function SubliminalAudioGenerator({ onGenerationComplete }: SubliminalAudioGeneratorProps) {
  const [params, setParams] = useState<SubliminalAudioParams>({
    affirmationText: '',
    maskingSound: 'white-noise',
    duration: '10',
    subliminalVolume: '-30',
    maskingVolume: '-10',
  });
  const [loading, setLoading] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<any>(null);

  const handleInputChange = (field: keyof SubliminalAudioParams, value: string) => {
    setParams((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    if (!params.affirmationText.trim()) {
      Alert.alert('Invalid Input', 'Please enter an affirmation text');
      return false;
    }

    if (params.affirmationText.length < 5 || params.affirmationText.length > 500) {
      Alert.alert('Invalid Input', 'Affirmation text must be between 5-500 characters');
      return false;
    }

    const duration = parseFloat(params.duration);
    if (isNaN(duration) || duration < 1 || duration > 120) {
      Alert.alert('Invalid Input', 'Duration must be between 1-120 minutes');
      return false;
    }

    return true;
  };

  const generateSubliminalAudio = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const token = await getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication required');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/ai/subliminal-audio`,
        {
          affirmationText: params.affirmationText,
          maskingSound: params.maskingSound,
          duration: parseFloat(params.duration),
          subliminalVolume: parseFloat(params.subliminalVolume),
          maskingVolume: parseFloat(params.maskingVolume),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setGeneratedAudio(response.data);
      Alert.alert('Success', 'Subliminal audio generated successfully!');
      if (onGenerationComplete) {
        onGenerationComplete();
      }
    } catch (error: any) {
      console.error('Error generating subliminal audio:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to generate subliminal audio'
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
        <Text style={styles.sectionTitle}>🎧 Subliminal Audio Generator</Text>

        {/* Affirmation Text */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Affirmation Text</Text>
          <Text style={styles.hint}>
            This text will be layered subtly under a masking sound
          </Text>
          <TextInput
            style={[styles.textArea, { minHeight: 100 }]}
            placeholder="Enter your affirmation (e.g., 'I am confident and capable')"
            value={params.affirmationText}
            onChangeText={(value) => handleInputChange('affirmationText', value)}
            multiline
            editable={!loading}
            maxLength={500}
          />
          <Text style={styles.charCount}>
            {params.affirmationText.length}/500 characters
          </Text>
        </View>

        {/* Masking Sound */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Masking Sound</Text>
          <Text style={styles.hint}>Select the background sound</Text>
          <View style={styles.maskingOptions}>
            {['white-noise', 'ambient-tone'].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.maskingOption,
                  params.maskingSound === option && styles.maskingOptionActive,
                ]}
                onPress={() => handleInputChange('maskingSound', option as any)}
                disabled={loading}
              >
                <Ionicons
                  name={
                    params.maskingSound === option
                      ? 'radio-button-on'
                      : 'radio-button-off'
                  }
                  size={20}
                  color={
                    params.maskingSound === option ? '#7C3AED' : '#D1D5DB'
                  }
                />
                <View style={styles.maskingOptionContent}>
                  <Text
                    style={[
                      styles.maskingOptionLabel,
                      params.maskingSound === option &&
                        styles.maskingOptionLabelActive,
                    ]}
                  >
                    {option === 'white-noise' ? 'White Noise' : 'Ambient Tone (Low Frequency)'}
                  </Text>
                  <Text style={styles.maskingOptionDesc}>
                    {option === 'white-noise'
                      ? 'Consistent, neutral background'
                      : 'Soothing low-frequency tone'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
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

        {/* Subliminal Volume */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subliminal Volume (dBFS)</Text>
          <Text style={styles.hint}>Very quiet. Typically -20 to -40 dB</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="-30"
              value={params.subliminalVolume}
              onChangeText={(value) => handleInputChange('subliminalVolume', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>dB</Text>
          </View>
        </View>

        {/* Masking Volume */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Masking Volume (dBFS)</Text>
          <Text style={styles.hint}>Main sound level. Typically -5 to -15 dB</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="-10"
              value={params.maskingVolume}
              onChangeText={(value) => handleInputChange('maskingVolume', value)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
            <Text style={styles.unit}>dB</Text>
          </View>
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateButton, loading && styles.generateButtonDisabled]}
          onPress={generateSubliminalAudio}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="volume-mute" size={20} color="white" />
              <Text style={styles.generateButtonText}>Generate Subliminal Audio</Text>
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
              <Text style={styles.resultText}>
                🎙️ Affirmation: {generatedAudio.affirmation}
              </Text>
              <Text style={styles.resultText}>
                🔊 Masking: {generatedAudio.maskingSound === 'white-noise' ? 'White Noise' : 'Ambient Tone'}
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
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'right',
  },
  maskingOptions: {
    gap: 12,
  },
  maskingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    gap: 12,
  },
  maskingOptionActive: {
    backgroundColor: '#EDE9FE',
    borderColor: '#7C3AED',
  },
  maskingOptionContent: {
    flex: 1,
  },
  maskingOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  maskingOptionLabelActive: {
    color: '#7C3AED',
  },
  maskingOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
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

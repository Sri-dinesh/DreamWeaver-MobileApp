import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const exportOptions = [
  {
    id: 'pdf',
    title: 'PDF Export',
    description: 'Complete journal with formatting and images',
    icon: 'document-text-outline',
    color: '#EF4444',
    size: '~2.5 MB',
  },
  {
    id: 'csv',
    title: 'CSV Spreadsheet',
    description: 'Data format for analysis and import',
    icon: 'grid-outline',
    color: '#10B981',
    size: '~0.3 MB',
  },
  {
    id: 'txt',
    title: 'Plain Text',
    description: 'Simple text file with dream entries',
    icon: 'reader-outline',
    color: '#3B82F6',
    size: '~0.1 MB',
  },
  {
    id: 'json',
    title: 'JSON Data',
    description: 'Structured data with all metadata',
    icon: 'code-outline',
    color: '#8B5CF6',
    size: '~0.5 MB',
  },
];

const filterOptions = [
  { id: 'all', label: 'All Dreams' },
  { id: 'lucid', label: 'Lucid Dreams Only' },
  { id: 'recent', label: 'Last 30 Days' },
  { id: 'tagged', label: 'Tagged Dreams' },
];

export default function ExportJournalScreen() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!selectedFormat) {
      Alert.alert('Error', 'Please select an export format');
      return;
    }

    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 3000));
      Alert.alert(
        'Export Complete',
        `Your dream journal has been exported as ${selectedFormat.toUpperCase()}. Check your device's Downloads folder.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Export Journal</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Journal Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>47</Text>
              <Text style={styles.statLabel}>Total Dreams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Lucid Dreams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>156</Text>
              <Text style={styles.statLabel}>Tags Used</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>90</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Export Format</Text>
        <View style={styles.formatOptions}>
          {exportOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.formatCard,
                selectedFormat === option.id && styles.formatCardSelected
              ]}
              onPress={() => setSelectedFormat(option.id)}
            >
              <View style={[styles.formatIcon, { backgroundColor: `${option.color}20` }]}>
                <Ionicons name={option.icon as any} size={24} color={option.color} />
              </View>
              <View style={styles.formatInfo}>
                <Text style={styles.formatTitle}>{option.title}</Text>
                <Text style={styles.formatDescription}>{option.description}</Text>
                <Text style={styles.formatSize}>{option.size}</Text>
              </View>
              <View style={[
                styles.radioButton,
                selectedFormat === option.id && styles.radioButtonSelected
              ]}>
                {selectedFormat === option.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Filter Options</Text>
        <View style={styles.filterOptions}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.filterButton,
                selectedFilter === option.id && styles.filterButtonSelected
              ]}
              onPress={() => setSelectedFilter(option.id)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === option.id && styles.filterButtonTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Export Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Ionicons name="document-outline" size={20} color="#6B7280" />
              <Text style={styles.previewTitle}>dreamweaver_journal_export</Text>
              <Text style={styles.previewExtension}>.{selectedFormat || 'format'}</Text>
            </View>
            <View style={styles.previewContent}>
              <Text style={styles.previewText}>
                {selectedFilter === 'all' ? '47 dream entries' : 
                 selectedFilter === 'lucid' ? '12 lucid dream entries' :
                 selectedFilter === 'recent' ? '15 recent dream entries' :
                 '32 tagged dream entries'} will be included
              </Text>
              <Text style={styles.previewDate}>
                Date range: {selectedFilter === 'recent' ? 'Dec 15, 2024 - Jan 15, 2025' : 'Oct 20, 2024 - Jan 15, 2025'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.exportButton,
            (!selectedFormat || isExporting) && styles.exportButtonDisabled
          ]}
          onPress={handleExport}
          disabled={!selectedFormat || isExporting}
        >
          {isExporting && (
            <Ionicons name="refresh" size={20} color="white" style={styles.loadingIcon} />
          )}
          <Text style={styles.exportButtonText}>
            {isExporting ? 'Exporting...' : 'Export Journal'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Privacy Notice</Text>
              <Text style={styles.infoText}>
                Your exported data stays on your device. We don't store or transmit your personal dream content.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 24,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    width: '50%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  formatOptions: {
    marginBottom: 32,
  },
  formatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formatCardSelected: {
    borderColor: '#7C3AED',
    backgroundColor: 'rgba(124, 58, 237, 0.02)',
  },
  formatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  formatDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  formatSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#7C3AED',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  filterButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextSelected: {
    color: 'white',
  },
  previewSection: {
    marginBottom: 32,
  },
  previewCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  previewExtension: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  previewContent: {},
  previewText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  previewDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.5,
  },
  loadingIcon: {
    marginRight: -8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {},
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
});
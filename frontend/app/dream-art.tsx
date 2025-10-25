import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { gradients, palette, radii, shadows, spacing, typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { getItem } from '@/utils/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

interface DreamArt {
  id: number;
  title: string;
  description?: string;
  type: 'Uploaded' | 'Generated';
  imageUrl: string;
  timestamp: string;
}

export default function DreamArtScreen() {
  const [activeTab, setActiveTab] = useState('upload');

  // Upload states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // AI generation states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiStyle, setAiStyle] = useState('dreamlike');
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');

  // Collection states
  const [artCollection, setArtCollection] = useState<DreamArt[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Image viewer state
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [selectedImageForView, setSelectedImageForView] = useState<string>('');
  const [selectedImageTitle, setSelectedImageTitle] = useState<string>('');

  const styles_data = [
{ id: 'dreamlike', name: '✨ Dreamlike' }, 
  { id: 'vivid', name: '👁️ Vivid' },       
  { id: 'surreal', name: '🌀 Surreal' },   
  { id: 'abstract', name: '🎨 Abstract' }, 
  { id: 'ethereal', name: '☁️ Ethereal' },  
  { id: 'mystical', name: '🔮 Mystical' },
  { id: 'cosmic', name: '🌌 Cosmic' },    
  { id: 'psychedelic', name: '🌈 Psychedelic' }, 
  { id: 'realistic', name: '🖼️ Realistic'}
  ];

  useEffect(() => {
    if (activeTab === 'collection') {
      fetchDreamArt();
    }
  }, [activeTab]);

  const getToken = async () => {
    try {
      return await getItem('userToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const fetchDreamArt = async () => {
    setLoadingCollection(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('📷 Fetching dream art collection...');

      const response = await axios.get(`${API_URL}/api/dreamart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('✅ Fetched', response.data.length, 'artworks');

      const formatted = response.data.map((art: any) => ({
        id: art.id,
        title: art.prompt,
        description: art.description,
        type: art.description?.includes('AI') ? 'Generated' : 'Uploaded',
        imageUrl: art.image_url,
        timestamp: art.timestamp,
      }));

      setArtCollection(formatted);
    } catch (error: any) {
      console.error('❌ Error fetching dream art:', error);
      Alert.alert('Error', 'Failed to load dream art collection');
    } finally {
      setLoadingCollection(false);
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      console.log('🗜️  Compressing image...');

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024, height: 1024 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      console.log('✅ Image compressed successfully');

      // Read and convert to base64
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64 = reader.result as string;
          console.log('📦 Compressed image size:', base64.length, 'bytes');
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error compressing image:', error);
      throw error;
    }
  };

  const handleImageSelect = async () => {
    try {
      console.log('📸 Opening image picker...');

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8, // ✅ Reduce quality from picker
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('✅ Image selected:', asset.fileName);
        console.log('Original size:', asset.width, 'x', asset.height);

        setSelectedImage(asset.uri);

        // ✅ Compress image before storing
        const compressedBase64 = await compressImage(asset.uri);
        setImageBase64(compressedBase64);
        console.log('✅ Image ready for upload');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleUploadArt = async () => {
    if (!imageBase64 || !title.trim()) {
      Alert.alert('Error', 'Please select an image and enter a title');
      return;
    }

    setUploading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('📤 Uploading dream art...');
      console.log('Image size:', imageBase64.length, 'bytes');

      const response = await axios.post(
        `${API_URL}/api/dreamart/upload`,
        {
          title,
          description,
          imageBase64,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 60000, // ✅ 60 second timeout for upload
        }
      );

      console.log('✅ Upload successful');

      Alert.alert('Success', 'Your dream art has been uploaded!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null);
            setImageBase64(null);
            setTitle('');
            setDescription('');
            fetchDreamArt();
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error uploading art:', error);

      let errorMessage = 'Failed to upload dream art';

      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Upload timed out. Image may be too large.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Image is too large. Please select a smaller image.';
      } else if (error.response?.status === 400) {
        errorMessage = error?.response?.data?.message || 'Invalid image format';
      } else if (error.message?.includes('413')) {
        errorMessage = 'Image too large. Maximum size is 50MB.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setGenerating(true);
    setGenerationProgress('Initializing generation...');

    try {
      const token = await getToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }

      console.log('🎨 Generating AI dream art...');
      console.log('Prompt:', aiPrompt);
      console.log('Style:', aiStyle);

      setGenerationProgress('Sending request...');

      const response = await axios.post(
        `${API_URL}/api/dreamart/generate`,
        {
          prompt: aiPrompt,
          style: aiStyle,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 300000, // 5 minute timeout
        }
      );

      console.log('✅ Generation successful');
      setGenerationProgress('');

      Alert.alert('Success', 'Your AI dream art has been generated!', [
        {
          text: 'OK',
          onPress: () => {
            setAiPrompt('');
            fetchDreamArt();
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error generating art:', error);
      setGenerationProgress('');

      let errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to generate dream art';

      // Enhanced error messages
      if (error.message?.includes('timeout')) {
        errorMessage =
          'Generation took too long. Please try with a simpler prompt.';
      } else if (error.response?.status === 429) {
        errorMessage =
          'Rate limit reached. Please wait a moment and try again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setGenerating(false);
      setGenerationProgress('');
    }
  };

  const handleDeleteArt = (id: number) => {
    Alert.alert(
      'Delete Artwork',
      'Are you sure you want to delete this artwork?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(id);
            try {
              const token = await getToken();
              if (!token) {
                router.replace('/auth/login');
                return;
              }

              console.log('🗑️  Deleting artwork:', id);

              await axios.delete(`${API_URL}/api/dreamart/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              console.log('✅ Artwork deleted');
              Alert.alert('Success', 'Artwork deleted');
              fetchDreamArt();
            } catch (error: any) {
              console.error('❌ Error deleting artwork:', error);
              Alert.alert('Error', 'Failed to delete artwork');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  // Image viewer functions
  const openImageViewer = (imageUrl: string, title: string) => {
    setSelectedImageForView(imageUrl);
    setSelectedImageTitle(title);
    setIsImageViewerVisible(true);
  };

  const closeImageViewer = () => {
    setIsImageViewerVisible(false);
    setSelectedImageForView('');
    setSelectedImageTitle('');
  };

  const renderUploadTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Upload Your Dream Art</Text>
      <Text style={styles.sectionDescription}>
        Share the art from your dreams and visions
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Select Image</Text>
        {selectedImage ? (
          <View style={styles.selectedImageContainer}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.selectedImage}
            />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={handleImageSelect}
            >
              <Ionicons name="camera" size={16} color="white" />
              <Text style={styles.changeImageButtonText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.fileSelector}
            onPress={handleImageSelect}
          >
            <Ionicons name="image-outline" size={32} color="#7C3AED" />
            <Text style={styles.fileSelectorText}>Tap to Select Image</Text>
            <Text style={styles.fileSelectorSubtext}>PNG, JPG, GIF, WEBP</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Give your artwork a title..."
          value={title}
          onChangeText={setTitle}
          editable={!uploading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe your dream art..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          editable={!uploading}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!imageBase64 || !title.trim() || uploading) && styles.buttonDisabled,
        ]}
        onPress={handleUploadArt}
        disabled={!imageBase64 || !title.trim() || uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <>
            <Ionicons name="cloud-upload" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Upload Artwork</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderGenerateTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Generate AI Dream Art</Text>
      <Text style={styles.sectionDescription}>
        Let AI create surreal dream artwork from your imagination.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Dream Description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="A floating castle in the clouds surrounded by glowing butterflies, mystical energy..."
          multiline
          numberOfLines={5}
          value={aiPrompt}
          onChangeText={setAiPrompt}
          editable={!generating}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Art Style</Text>
        <View style={styles.styleGrid}>
          {styles_data.map((style) => (
            <TouchableOpacity
              key={style.id}
              style={[
                styles.styleButton,
                aiStyle === style.id && styles.styleButtonActive,
              ]}
              onPress={() => setAiStyle(style.id)}
              disabled={generating}
            >
              <Text
                style={[
                  styles.styleButtonText,
                  aiStyle === style.id && styles.styleButtonTextActive,
                ]}
              >
                {style.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!aiPrompt.trim() || generating) && styles.buttonDisabled,
        ]}
        onPress={handleGenerateImage}
        disabled={!aiPrompt.trim() || generating}
      >
        {generating ? (
          <>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.primaryButtonText}>
              {generationProgress || 'Generating...'}
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="sparkles" size={20} color="white" />
            <Text style={styles.primaryButtonText}>Generate Image</Text>
          </>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          ⏱️ Image generation typically takes 30-60 seconds. Stay on this screen
          while generating. Powered by Chutes.ai Chroma model.
        </Text>
      </View>

      <View style={styles.tipsBox}>
        <Text style={styles.tipsTitle}>💡 Tips for Better Results:</Text>
        <Text style={styles.tipsText}>
          • Use descriptive words and vivid imagery{'\n'}• Include colors,
          textures, and emotions{'\n'}• Combine multiple concepts{'\n'}• Be
          specific about composition
        </Text>
      </View>
    </ScrollView>
  );

//   const renderCollectionTab = () => (
//     <View style={styles.collectionContainer}>
//       <Text style={styles.sectionTitle}>Your Dream Art Collection</Text>

//       {loadingCollection ? (
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#7C3AED" />
//           <Text style={styles.loadingText}>Loading your artworks...</Text>
//         </View>
//       ) : artCollection.length === 0 ? (
//         <View style={styles.emptyContainer}>
//           <Ionicons name="image-outline" size={48} color="#D1D5DB" />
//           <Text style={styles.emptyTitle}>No Dream Art Yet</Text>
//           <Text style={styles.emptySubtitle}>
//             Upload or generate your first dream artwork
//           </Text>
//         </View>
//       ) : (
//         <FlatList
//           data={artCollection}
//           keyExtractor={(item) => item.id.toString()}
//           scrollEnabled={true}
//           numColumns={2}
//           columnWrapperStyle={styles.columnWrapper}
//           renderItem={({ item }) => (
//             <View style={styles.artCardWrapper}>
//               <LinearGradient
//                 colors={['#FFFFFF', '#F8FAFC']}
//                 style={styles.artCard}
//               >
//                 <View style={styles.imageWrapper}>
//                   {/* ✅ FIXED: Added proper image styling */}
//                   <TouchableOpacity
//                     onPress={() => openImageViewer(item.imageUrl, item.title)}
//                     style={styles.imageTouchable}
//                   >
//                     <Image
//                       source={{ uri: item.imageUrl }}
//                       style={styles.artImage}
//                       onError={(e) => console.log('Image load error:', e)}
//                       resizeMode="cover"
//                     />
//                   </TouchableOpacity>
//                 </View>

//                 <View style={styles.artInfo}>
//                   <Text style={styles.artTitle} numberOfLines={2}>
//                     {item.title}
//                   </Text>
//                   {item.description && (
//                     <Text style={styles.artDescription} numberOfLines={2}>
//                       {item.description}
//                     </Text>
//                   )}

//                   <View style={styles.artMeta}>
//                     <View
//                       style={[
//                         styles.artType,
//                         {
//                           backgroundColor:
//                             item.type === 'Generated'
//                               ? 'rgba(124, 58, 237, 0.1)'
//                               : 'rgba(34, 197, 94, 0.1)',
//                         },
//                       ]}
//                     >
//                       <Text
//                         style={[
//                           styles.artTypeText,
//                           {
//                             color:
//                               item.type === 'Generated' ? '#7C3AED' : '#22C55E',
//                           },
//                         ]}
//                       >
//                         {item.type === 'Generated' ? '🤖 AI' : '📸 Upload'}
//                       </Text>
//                     </View>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.deleteArtButton}
//                     onPress={() => handleDeleteArt(item.id)}
//                     disabled={deleting === item.id}
//                   >
//                     {deleting === item.id ? (
//                       <ActivityIndicator size="small" color="#EF4444" />
//                     ) : (
//                       <Ionicons
//                         name="trash-outline"
//                         size={16}
//                         color="#EF4444"
//                       />
//                     )}
//                   </TouchableOpacity>
//                 </View>
//               </LinearGradient>
//             </View>
//           )}
//           contentContainerStyle={styles.collectionList}
//         />
//       )}

//       {/* Image Viewer Modal */}
//       <Modal
//         visible={isImageViewerVisible}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={closeImageViewer}
//       >
//         <View style={styles.imageViewerOverlay}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={closeImageViewer}
//           >
//             <Ionicons name="close" size={32} color="white" />
//           </TouchableOpacity>

//           <View style={styles.imageViewerContainer}>
//             <Image
//               source={{ uri: selectedImageForView }}
//               style={styles.fullScreenImage}
//               resizeMode="contain"
//             />
//             <Text style={styles.imageTitle}>{selectedImageTitle}</Text>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   <FlatList
//   data={artCollection}
//   keyExtractor={(item) => item.id.toString()}
//   scrollEnabled={true}
//   numColumns={2}
//   columnWrapperStyle={styles.columnWrapper}
//   renderItem={({ item }) => (
//     <View style={styles.artCardWrapper}>
//       <LinearGradient
//         colors={['#FFFFFF', '#F8FAFC']}
//         style={styles.artCard}
//       >
//         <View style={styles.imageWrapper}>
//           <TouchableOpacity
//             onPress={() => openImageViewer(item.imageUrl, item.title)}
//             style={styles.imageTouchable}
//           >
//             <Image
//               source={{ uri: item.imageUrl }}
//               style={styles.artImage}
//               onError={(e) => console.log('Image load error:', e)}
//               resizeMode="cover"
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.artInfo}>
//           <View style={styles.artHeader}>
//             <Text style={styles.artTitle} numberOfLines={2}>
//               {item.title}
//             </Text>
//             <TouchableOpacity
//               style={styles.deleteArtButton}
//               onPress={() => handleDeleteArt(item.id)}
//               disabled={deleting === item.id}
//             >
//               {deleting === item.id ? (
//                 <ActivityIndicator size="small" color="#EF4444" />
//               ) : (
//                 <Ionicons name="trash-outline" size={16} color="#EF4444" />
//               )}
//             </TouchableOpacity>
//           </View>

//           {item.description && (
//             <Text style={styles.artDescription} numberOfLines={2}>
//               {item.description}
//             </Text>
//           )}

//           <View style={styles.artMeta}>
//             <View
//               style={[
//                 styles.artType,
//                 {
//                   backgroundColor:
//                     item.type === 'Generated'
//                       ? 'rgba(124, 58, 237, 0.1)'
//                       : 'rgba(34, 197, 94, 0.1)',
//                 },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.artTypeText,
//                   {
//                     color:
//                       item.type === 'Generated' ? '#7C3AED' : '#22C55E',
//                   },
//                 ]}
//               >
//                 {item.type === 'Generated' ? '🤖 AI' : '📸 Upload'}
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>
//     </View>
//   )}
//   contentContainerStyle={[styles.collectionList, { paddingBottom: 60 }]}
// />

//   );
const renderCollectionTab = () => (
  <View style={{ flex: 1 }}>
    {loadingCollection ? (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading your artworks...</Text>
      </View>
    ) : artCollection.length === 0 ? (
      <View style={styles.emptyContainer}>
        <Ionicons name="image-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>No Dream Art Yet</Text>
        <Text style={styles.emptySubtitle}>
          Upload or generate your first dream artwork
        </Text>
      </View>
    ) : (
      <FlatList
        data={artCollection}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={true}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <View style={styles.artCardWrapper}>
            <LinearGradient
              colors={['#FFFFFF', '#F8FAFC']}
              style={styles.artCard}
            >
              <View style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={() => openImageViewer(item.imageUrl, item.title)}
                  style={styles.imageTouchable}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.artImage}
                    resizeMode="cover"
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.artInfo}>
                <View style={styles.artHeader}>
                  <Text style={styles.artTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteArtButton}
                    onPress={() => handleDeleteArt(item.id)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? (
                      <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                </View>

                {item.description && (
                  <Text style={styles.artDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

                <View style={styles.artMeta}>
                  <View
                    style={[
                      styles.artType,
                      {
                        backgroundColor:
                          item.type === 'Generated'
                            ? 'rgba(124, 58, 237, 0.1)'
                            : 'rgba(34, 197, 94, 0.1)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.artTypeText,
                        {
                          color:
                            item.type === 'Generated' ? '#7C3AED' : '#22C55E',
                        },
                      ]}
                    >
                      {item.type === 'Generated' ? '🤖 AI' : '📸 Upload'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        )}
        contentContainerStyle={[styles.collectionList, { paddingBottom: 60 }]}
      />
    )}

    {/* ✅ Image Viewer Modal (add back here) */}
    <Modal
      visible={isImageViewerVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeImageViewer}
    >
      <View style={styles.imageViewerOverlay}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={closeImageViewer}
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <View style={styles.imageViewerContainer}>
          <Image
            source={{ uri: selectedImageForView }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <Text style={styles.imageTitle}>{selectedImageTitle}</Text>
        </View>
      </View>
    </Modal>
  </View>
);


  const tabs = [
    { id: 'upload', name: 'Upload', icon: 'cloud-upload-outline' as const },
    { id: 'generate', name: 'Generate AI', icon: 'sparkles-outline' as const },
    { id: 'collection', name: 'Collection', icon: 'images-outline' as const },
  ];

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={palette.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dream Art</Text>
        <View style={styles.rightAction} />
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.id ? '#7C3AED' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'generate' && renderGenerateTab()}
        {activeTab === 'collection' && renderCollectionTab()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundPrimary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 100,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
  },
  rightAction: {
    width: 44,
    height: 44,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7C3AED',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#7C3AED',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  collectionContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
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
  selectedImageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    padding: 12,
    gap: 8,
  },
  changeImageButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  fileSelector: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 32,
    gap: 12,
  },
  fileSelectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  fileSelectorSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
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
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  styleButtonActive: {
    borderColor: '#7C3AED',
    backgroundColor: '#7C3AED',
  },
  styleButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  styleButtonTextActive: {
    color: 'white',
  },
  primaryButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  tipsBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // collectionList: {
  //   paddingBottom: 20,
  // },
  columnWrapper: {
    gap: 12,
  },
  // artCardWrapper: {
  //   flex: 1,
  // },
  // artCard: {
  //   borderRadius: 12,
  //   overflow: 'hidden',
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 8,
  //   elevation: 3,
  // },
  imageWrapper: {
    width: '100%',
    height: 150,
    backgroundColor: '#F3F4F6',
  },
  imageTouchable: {
    width: '100%',
    height: '100%',
  },
  artImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  // artInfo: {
  //   padding: 12,
  // },
  // artTitle: {
  //   fontSize: 14,
  //   fontWeight: '600',
  //   color: '#1F2937',
  //   marginBottom: 4,
  // },
  // artDescription: {
  //   fontSize: 12,
  //   color: '#6B7280',
  //   marginBottom: 8,
  // },
  // artMeta: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  // },
  // artType: {
  //   paddingHorizontal: 8,
  //   paddingVertical: 4,
  //   borderRadius: 6,
  // },
  // artTypeText: {
  //   fontSize: 11,
  //   fontWeight: '600',
  // },
  // deleteArtButton: {
  //   padding: 6,
  // },
  // Image Viewer Styles
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 10,
  },
  imageViewerContainer: {
    width: '90%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imageTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
  },
  collectionList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    // paddingBottom moved inline so you can adjust dynamically
  },

  artCardWrapper: {
    flex: 1,
    margin: 8,
  },

  artCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },

  artInfo: {
    padding: 10,
  },

  // ✅ Align title + delete icon horizontally
  artHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  artTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },

  deleteArtButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  artDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },

  artMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },

  artType: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  artTypeText: {
    fontSize: 10,
    fontWeight: '500',
  },
});

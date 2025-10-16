// import React, { useState } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
// import { router } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// export default function SocialCommunityScreen() {
//   const [activeTab, setActiveTab] = useState('all');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const [sharedDreams] = useState([
//     {
//       id: '1',
//       title: 'Flying Over Mountains',
//       content: 'Last night I soared above snow-capped peaks...',
//       author: 'Alice Dream',
//       likes: 24,
//       comments: 8,
//       visibility: 'public',
//       date: '2024-01-15',
//     },
//     {
//       id: '2',
//       title: 'Underwater Adventure',
//       content: 'Swimming through coral reefs with dolphins...',
//       author: 'Bob Explorer',
//       likes: 18,
//       comments: 5,
//       visibility: 'public',
//       date: '2024-01-14',
//     },
//   ]);
  
//   const [friendRequests] = useState({
//     received: [
//       { id: '1', name: 'Charlie Dreamer', mutualFriends: 3, date: '2024-01-15' },
//       { id: '2', name: 'Diana Vision', mutualFriends: 1, date: '2024-01-14' },
//     ],
//     sent: [
//       { id: '3', name: 'Eve Lucid', date: '2024-01-13' },
//     ],
//   });
  
//   const [friends] = useState([
//     { id: '1', name: 'Alice Dream', status: 'Shared 3 dreams this week', avatar: 'A' },
//     { id: '2', name: 'Bob Explorer', status: 'Last dream: 2 days ago', avatar: 'B' },
//     { id: '3', name: 'Charlie Dreamer', status: 'Online now', avatar: 'C' },
//   ]);

//   const renderAllTab = () => (
//     <ScrollView style={styles.tabContent}>
//       <View style={styles.searchContainer}>
//         <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
//         <TextInput
//           style={styles.searchInput}
//           placeholder="Search for people..."
//           value={searchQuery}
//           onChangeText={setSearchQuery}
//         />
//       </View>
      
//       <Text style={styles.sectionTitle}>Shared Dreams</Text>
//       {sharedDreams.map((dream) => (
//         <View key={dream.id} style={styles.dreamCard}>
//           <View style={styles.dreamHeader}>
//             <View style={styles.authorInfo}>
//               <View style={styles.avatar}>
//                 <Text style={styles.avatarText}>{dream.author.charAt(0)}</Text>
//               </View>
//               <View>
//                 <Text style={styles.authorName}>{dream.author}</Text>
//                 <Text style={styles.dreamDate}>{dream.date}</Text>
//               </View>
//             </View>
//             <TouchableOpacity style={styles.menuButton}>
//               <Ionicons name="ellipsis-horizontal" size={20} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
          
//           <Text style={styles.dreamTitle}>{dream.title}</Text>
//           <Text style={styles.dreamContent} numberOfLines={2}>{dream.content}</Text>
          
//           <View style={styles.dreamActions}>
//             <TouchableOpacity style={styles.actionButton}>
//               <Ionicons name="heart-outline" size={18} color="#6B7280" />
//               <Text style={styles.actionText}>{dream.likes}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
//               <Text style={styles.actionText}>{dream.comments}</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.actionButton}>
//               <Ionicons name="share-outline" size={18} color="#6B7280" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const renderRequestsTab = () => (
//     <ScrollView style={styles.tabContent}>
//       <Text style={styles.sectionTitle}>Friend Requests</Text>
      
//       <View style={styles.requestSection}>
//         <Text style={styles.subsectionTitle}>Received Requests</Text>
//         {friendRequests.received.map((request) => (
//           <View key={request.id} style={styles.requestCard}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>{request.name.charAt(0)}</Text>
//             </View>
//             <View style={styles.requestInfo}>
//               <Text style={styles.requestName}>{request.name}</Text>
//               <Text style={styles.requestMeta}>{request.mutualFriends} mutual friends</Text>
//               <Text style={styles.requestDate}>{request.date}</Text>
//             </View>
//             <View style={styles.requestActions}>
//               <TouchableOpacity style={styles.acceptButton}>
//                 <Text style={styles.acceptButtonText}>Accept</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.declineButton}>
//                 <Text style={styles.declineButtonText}>Decline</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         ))}
//       </View>
      
//       <View style={styles.requestSection}>
//         <Text style={styles.subsectionTitle}>Sent Requests</Text>
//         {friendRequests.sent.map((request) => (
//           <View key={request.id} style={styles.requestCard}>
//             <View style={styles.avatar}>
//               <Text style={styles.avatarText}>{request.name.charAt(0)}</Text>
//             </View>
//             <View style={styles.requestInfo}>
//               <Text style={styles.requestName}>{request.name}</Text>
//               <Text style={styles.requestDate}>Sent on {request.date}</Text>
//             </View>
//             <TouchableOpacity style={styles.cancelButton}>
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );

//   const renderFriendsTab = () => (
//     <ScrollView style={styles.tabContent}>
//       <Text style={styles.sectionTitle}>Your Friends</Text>
      
//       {friends.map((friend) => (
//         <View key={friend.id} style={styles.friendCard}>
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>{friend.avatar}</Text>
//           </View>
//           <View style={styles.friendInfo}>
//             <Text style={styles.friendName}>{friend.name}</Text>
//             <Text style={styles.friendStatus}>{friend.status}</Text>
//           </View>
//           <TouchableOpacity style={styles.messageButton}>
//             <Ionicons name="chatbubble-outline" size={20} color="#7C3AED" />
//           </TouchableOpacity>
//         </View>
//       ))}
//     </ScrollView>
//   );

//   const tabs = [
//     { id: 'all', name: 'All' },
//     { id: 'requests', name: 'Requests' },
//     { id: 'friends', name: 'Friends' },
//   ];

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => router.back()}
//         >
//           <Ionicons name="arrow-back" size={24} color="#1F2937" />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Social Community</Text>
//         <View style={styles.placeholder} />
//       </View>

//       <View style={styles.tabsContainer}>
//         {tabs.map((tab) => (
//           <TouchableOpacity
//             key={tab.id}
//             style={[styles.tab, activeTab === tab.id && styles.activeTab]}
//             onPress={() => setActiveTab(tab.id)}
//           >
//             <Text style={[
//               styles.tabText,
//               activeTab === tab.id && styles.activeTabText
//             ]}>
//               {tab.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       <View style={styles.content}>
//         {activeTab === 'all' && renderAllTab()}
//         {activeTab === 'requests' && renderRequestsTab()}
//         {activeTab === 'friends' && renderFriendsTab()}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 24,
//     paddingTop: 60,
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   backButton: {
//     padding: 4,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   placeholder: {
//     width: 32,
//   },
//   tabsContainer: {
//     flexDirection: 'row',
//     backgroundColor: 'white',
//     borderBottomWidth: 1,
//     borderBottomColor: '#E5E7EB',
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 16,
//     alignItems: 'center',
//   },
//   activeTab: {
//     borderBottomWidth: 2,
//     borderBottomColor: '#7C3AED',
//   },
//   tabText: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#6B7280',
//   },
//   activeTabText: {
//     color: '#7C3AED',
//   },
//   content: {
//     flex: 1,
//   },
//   tabContent: {
//     flex: 1,
//     padding: 24,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     paddingHorizontal: 16,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 2,
//   },
//   searchIcon: {
//     marginRight: 12,
//   },
//   searchInput: {
//     flex: 1,
//     height: 44,
//     fontSize: 16,
//     color: '#1F2937',
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 16,
//   },
//   subsectionTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 12,
//   },
//   dreamCard: {
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   dreamHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   authorInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#7C3AED',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: 'white',
//   },
//   authorName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#1F2937',
//   },
//   dreamDate: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   menuButton: {
//     padding: 4,
//   },
//   dreamTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 8,
//   },
//   dreamContent: {
//     fontSize: 14,
//     color: '#4B5563',
//     lineHeight: 18,
//     marginBottom: 12,
//   },
//   dreamActions: {
//     flexDirection: 'row',
//     gap: 16,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   actionText: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   requestSection: {
//     marginBottom: 24,
//   },
//   requestCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   requestInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   requestName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   requestMeta: {
//     fontSize: 12,
//     color: '#6B7280',
//     marginBottom: 2,
//   },
//   requestDate: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },
//   requestActions: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   acceptButton: {
//     backgroundColor: '#10B981',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   acceptButtonText: {
//     color: 'white',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   declineButton: {
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   declineButtonText: {
//     color: '#6B7280',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   cancelButton: {
//     backgroundColor: '#FEE2E2',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   cancelButtonText: {
//     color: '#DC2626',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   friendCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   friendInfo: {
//     flex: 1,
//     marginLeft: 12,
//   },
//   friendName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#1F2937',
//     marginBottom: 2,
//   },
//   friendStatus: {
//     fontSize: 12,
//     color: '#6B7280',
//   },
//   messageButton: {
//     padding: 8,
//   },
// });
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '@/api/client';
import { format } from 'date-fns';

// Define interfaces for message types
interface ChatMessage {
  id: number; // Ensure this is a number or string, not undefined
  user_id: string;
  user_message: string;
  ai_response: string;
  timestamp: string;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function SpiritGuideScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Load chat history when component mounts
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && scrollViewRef.current) {
      // Use a small delay to ensure the UI has updated before scrolling
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      const history = await api.spirit.getChatHistory();

      if (!Array.isArray(history) || history.length === 0) {
        setMessages([
          {
            id: 'welcome',
            text: 'Greetings, I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?',
            isUser: false,
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const formattedMessages: Message[] = history.flatMap(
        (msg: ChatMessage) => {
          const timestamp = parseTimestamp(msg.timestamp);
          return [
            {
              id: `user-${msg.id}`,
              text: msg.user_message,
              isUser: true,
              timestamp,
            },
            {
              id: `ai-${msg.id}`,
              text: msg.ai_response,
              isUser: false,
              timestamp,
            },
          ];
        }
      );

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      setMessages([
        {
          id: 'welcome',
          text: 'Greetings, I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMessageText = inputText.trim();
    const tempUserMessageId = `temp-user-${Date.now()}`;

    // Add temporary user message immediately for UI responsiveness
    const tempUserMessage: Message = {
      id: tempUserMessageId,
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInputText('');
    setLoading(true);

    try {
      // Show typing indicator
      const typingIndicatorMessage: Message = {
        id: 'typing-indicator',
        text: '...',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, typingIndicatorMessage]);

      // Send message to API
      const response = await api.spirit.sendMessage(userMessageText);

      // Remove typing indicator
      setMessages((prev) => prev.filter((m) => m.id !== 'typing-indicator'));

      // Validate response
      if (!response || !response.id || !response.ai_response) {
        throw new Error('Invalid response from server');
      }

      // Add confirmed messages
      const confirmedUserMessage: Message = {
        id: `user-${response.id}`,
        text: userMessageText,
        isUser: true,
        timestamp: parseTimestamp(response.timestamp),
      };

      const spiritMessage: Message = {
        id: `ai-${response.id}`,
        text: response.ai_response,
        isUser: false,
        timestamp: parseTimestamp(response.timestamp),
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMessageId),
        confirmedUserMessage,
        spiritMessage,
      ]);
    } catch (error) {
      console.error('Error sending message:', error);

      // Remove typing indicator and temp message
      setMessages((prev) =>
        prev.filter(
          (m) => m.id !== 'typing-indicator' && m.id !== tempUserMessageId
        )
      );

      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: "I'm having trouble connecting to the ethereal plane. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    try {
      setLoading(true);
      await api.spirit.clearHistory();

      setMessages([
        {
          id: 'welcome',
          text: 'Greetings, I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?',
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error clearing chat history:', error);
      Alert.alert('Error', 'Failed to start new chat');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper function to safely parse timestamp ---
  const parseTimestamp = (timestamp: string | number | Date): Date => {
    let date: Date;

    if (typeof timestamp === 'string') {
      // Try to parse the string directly
      date = new Date(timestamp);
    } else if (typeof timestamp === 'number') {
      // If it's a number, assume it's milliseconds since epoch
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      // If it's already a Date object, use it directly
      date = timestamp;
    } else {
      // If it's an unexpected type, default to current time
      console.warn(
        'Unexpected timestamp type received:',
        typeof timestamp,
        timestamp
      );
      date = new Date();
    }

    // Check if the resulting date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date parsed from timestamp:', timestamp);
      return new Date(); // Return current date as a fallback
    }

    return date;
  };

  // --- Helper function to format time ---
  const formatTime = (date: Date) => {
    // Check if date is valid before formatting
    if (isNaN(date.getTime())) {
      console.error('Tried to format an invalid date object.');
      return 'Invalid Date'; // Or return a default string like 'Just now'
    }
    return format(date, 'h:mm a');
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>
          Connecting to the spirit realm...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spirit Guide</Text>
        <TouchableOpacity
          style={styles.newChatButton}
          onPress={handleNewChat}
          disabled={loading}
        >
          <Ionicons
            name="add"
            size={24}
            color={loading ? '#D1D5DB' : '#7C3AED'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) =>
          message.id === 'typing-indicator' ? (
            <View key="typing-indicator" style={styles.typingIndicator}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotMiddle]} />
                <View style={styles.typingDot} />
              </View>
            </View>
          ) : (
            <View
              key={message.id} // React uses this key to identify components
              style={[
                styles.messageContainer,
                message.isUser ? styles.userMessage : styles.spiritMessage,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.spiritBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userText : styles.spiritText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.isUser ? styles.userTime : styles.spiritTime,
                  ]}
                >
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          )
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask the Dream Weaver..."
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || loading ? '#9CA3AF' : 'white'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.newChatButtonBottom,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleNewChat}
            disabled={loading}
          >
            <Ionicons
              name="refresh"
              size={16}
              color={loading ? '#9CA3AF' : '#7C3AED'}
            />
            <Text
              style={[
                styles.newChatButtonText,
                loading && styles.buttonTextDisabled,
              ]}
            >
              New Chat
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  newChatButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 24,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  spiritMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 8,
  },
  userBubble: {
    backgroundColor: '#7C3AED',
    borderBottomRightRadius: 2,
  },
  spiritBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: 'white',
  },
  spiritText: {
    color: '#1F2937',
  },
  messageTime: {
    fontSize: 12,
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  spiritTime: {
    color: '#9CA3AF',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: '#7C3AED',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newChatButtonBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    gap: 6,
  },
  newChatButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C3AED',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
    fontWeight: '500',
  },
  typingIndicator: {
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderBottomLeftRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 2,
    opacity: 0.6,
  },
  typingDotMiddle: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});

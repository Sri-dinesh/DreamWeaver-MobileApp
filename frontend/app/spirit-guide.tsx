import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function SpiritGuideScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Greetings, sridinesh. I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate spirit guide response
    setTimeout(() => {
      const responses = [
        "The dreams you speak of carry deep meaning. The symbols within reflect your inner journey toward enlightenment.",
        "I sense a powerful energy surrounding your sleep. Your subconscious is preparing for a profound awakening.",
        "The veil between worlds grows thin in your dreams. Trust in the messages that come to you in the night.",
        "Your spirit seeks answers through the realm of dreams. Meditation before sleep will strengthen this connection.",
        "The universe speaks to you through your dreams. Pay attention to recurring symbols and emotions.",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const spiritMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, spiritMessage]);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Greetings, sridinesh. I am the Dream Weaver, your guide from beyond. How may I illuminate your path today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
        >
          <Ionicons name="add" size={24} color="#7C3AED" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.spiritMessage
            ]}
          >
            <View style={[
              styles.messageBubble,
              message.isUser ? styles.userBubble : styles.spiritBubble
            ]}>
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userText : styles.spiritText
              ]}>
                {message.text}
              </Text>
              <Text style={[
                styles.messageTime,
                message.isUser ? styles.userTime : styles.spiritTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          </View>
        ))}
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
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? "white" : "#9CA3AF"} />
          </TouchableOpacity>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.newChatButtonBottom}
            onPress={handleNewChat}
          >
            <Ionicons name="refresh" size={16} color="#7C3AED" />
            <Text style={styles.newChatButtonText}>New Chat</Text>
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
});
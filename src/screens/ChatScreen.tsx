import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {MessagesStackParamList} from '../types/navigation';

type ChatScreenNavigationProp = NativeStackNavigationProp<
  MessagesStackParamList,
  'Chat'
>;

type ChatScreenRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

interface MessageProps {
  text: string;
  isMine: boolean;
  timestamp: string;
}

const Message: React.FC<MessageProps> = ({text, isMine, timestamp}) => {
  return (
    <View style={[styles.messageContainer, isMine && styles.myMessageContainer]}>
      <View style={[styles.messageBubble, isMine && styles.myMessageBubble]}>
        <Text style={[styles.messageText, isMine && styles.myMessageText]}>
          {text}
        </Text>
        <Text style={[styles.timestamp, isMine && styles.myTimestamp]}>
          {timestamp}
        </Text>
      </View>
    </View>
  );
};

export const ChatScreen: React.FC<ChatScreenProps> = ({navigation, route}) => {
  const {userName, userAvatar} = route.params;
  const [messageText, setMessageText] = useState('');

  const mockMessages = [
    {id: '1', text: 'Hey! Check out my new Snaplet!', isMine: false, timestamp: '10:30'},
    {id: '2', text: 'Nice one! Looks great!', isMine: true, timestamp: '10:32'},
    {id: '3', text: 'Thanks! Working on another one now', isMine: false, timestamp: '10:35'},
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Image
          source={
            userAvatar ? {uri: userAvatar} : require('../../assets/placeholder.png')
          }
          style={styles.avatar}
        />
        <Text style={styles.userName}>{userName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>
        {mockMessages.map(message => (
          <Message
            key={message.id}
            text={message.text}
            isMine={message.isMine}
            timestamp={message.timestamp}
          />
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#999999"
          value={messageText}
          onChangeText={setMessageText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendIcon}>📤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5E6D3',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 28,
    color: '#000000',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: '#3E2723',
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#F5E6D3',
  },
  timestamp: {
    fontSize: 12,
    color: '#999999',
  },
  myTimestamp: {
    color: '#D4C4A8',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5E6D3',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3E2723',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 20,
  },
});

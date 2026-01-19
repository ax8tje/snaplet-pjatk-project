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
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MessagesStackParamList} from '../types/navigation';

type MessagesScreenNavigationProp = NativeStackNavigationProp<
  MessagesStackParamList,
  'MessagesList'
>;

interface MessagesScreenProps {
  navigation: MessagesScreenNavigationProp;
}

interface ChatItemProps {
  id: string;
  userName: string;
  message: string;
  avatar?: string;
  onPress: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  userName,
  message,
  avatar,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <Image
        source={avatar ? {uri: avatar} : require('../../assets/placeholder.png')}
        style={styles.avatar}
      />
      <View style={styles.chatContent}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {message}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export const MessagesScreen: React.FC<MessagesScreenProps> = ({
  navigation,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'groups' | 'contacts'>(
    'all',
  );

  const mockChats = [
    {
      id: '1',
      userName: 'Krzysztof',
      message: 'Check out my new Snaplet!',
    },
    {
      id: '2',
      userName: 'Frank',
      message: "I'm at school, just showed some kids my Snaplet!",
    },
    {
      id: '3',
      userName: 'Dude from stock',
      message: 'My new Snaplet is the best Snaplet!',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="search for message"
          placeholderTextColor="#999999"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'all' && styles.activeTabText,
            ]}>
            All chats
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.activeTab]}
          onPress={() => setActiveTab('groups')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'groups' && styles.activeTabText,
            ]}>
            Groups
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => setActiveTab('contacts')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'contacts' && styles.activeTabText,
            ]}>
            Contacts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {mockChats.map(chat => (
          <ChatItem
            key={chat.id}
            id={chat.id}
            userName={chat.userName}
            message={chat.message}
            onPress={() =>
              navigation.navigate('Chat', {
                chatId: chat.id,
                userName: chat.userName,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  settingsIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  addIcon: {
    fontSize: 28,
    color: '#000000',
    fontWeight: '300',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4C4A8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#3E2723',
  },
  tabText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#F5E6D3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  chatContent: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666666',
  },
  chevron: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
});

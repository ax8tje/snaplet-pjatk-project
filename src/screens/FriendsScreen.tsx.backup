import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';

interface FriendItemProps {
  name: string;
  avatar?: string;
  onPress: () => void;
}

const FriendItem: React.FC<FriendItemProps> = ({name, avatar, onPress}) => {
  return (
    <TouchableOpacity style={styles.friendItem} onPress={onPress}>
      <Image
        source={avatar ? {uri: avatar} : require('../../assets/placeholder.png')}
        style={styles.avatar}
      />
      <Text style={styles.friendName}>{name}</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addIcon}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export const FriendsScreen: React.FC = () => {
  const mockFriends = [
    {id: '1', name: 'Krzysztof'},
    {id: '2', name: 'Frank'},
    {id: '3', name: 'Dude from stock'},
    {id: '4', name: 'Sarah'},
    {id: '5', name: 'Mike'},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="search for friends"
          placeholderTextColor="#999999"
        />
      </View>

      {/* Friends List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {mockFriends.map(friend => (
          <FriendItem
            key={friend.id}
            name={friend.name}
            onPress={() => console.log('View friend:', friend.name)}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  friendName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3E2723',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    fontSize: 24,
    color: '#F5E6D3',
    fontWeight: '300',
  },
});

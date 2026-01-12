import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {HomeStackParamList} from '../types/navigation';

type VideoViewScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'VideoView'
>;

type VideoViewScreenRouteProp = RouteProp<HomeStackParamList, 'VideoView'>;

interface VideoViewScreenProps {
  navigation: VideoViewScreenNavigationProp;
  route: VideoViewScreenRouteProp;
}

export const VideoViewScreen: React.FC<VideoViewScreenProps> = ({
  navigation,
  route,
}) => {
  const [activeTab, setActiveTab] = useState<'foryou' | 'friends'>('foryou');
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F5E6D3" />

      {/* Header with Tabs */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'foryou' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('foryou')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'foryou' && styles.activeTabText,
              ]}>
              For you
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'friends' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('friends')}>
            <Text
              style={[
                styles.tabText,
                activeTab === 'friends' && styles.activeTabText,
              ]}>
              Friends
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Video Content */}
      <View style={styles.videoContainer}>
        <Image
          source={require('../../assets/placeholder.png')}
          style={styles.videoImage}
          resizeMode="cover"
        />

        {/* Side Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setLiked(!liked)}>
            <Text style={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionCount}>1,302</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionCount}>16</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📤</Text>
            <Text style={styles.actionCount}>35</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.userInfo}>
            <Image
              source={require('../../assets/placeholder.png')}
              style={styles.userAvatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>Dude from stock</Text>
              <Text style={styles.videoDescription}>
                Description of the video
              </Text>
              <Text style={styles.videoDate}>10-01-2026</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5E6D3',
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5E6D3',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#000000',
    overflow: 'hidden',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#3E2723',
  },
  tabText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#F5E6D3',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  searchIcon: {
    fontSize: 20,
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionCount: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(245, 230, 211, 0.9)',
  },
  userInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  userDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  videoDate: {
    fontSize: 12,
    color: '#999999',
  },
});

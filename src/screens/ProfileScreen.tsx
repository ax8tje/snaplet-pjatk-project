import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'ProfileMain'
>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

// Mock data
const mockSnaplets = {
  january2026: [
    {id: '1', thumbnail: require('../../assets/placeholder.png')},
    {id: '2', thumbnail: require('../../assets/placeholder.png')},
    {id: '3', thumbnail: require('../../assets/placeholder.png')},
    {id: '4', thumbnail: require('../../assets/placeholder.png')},
    {id: '5', thumbnail: require('../../assets/placeholder.png')},
    {id: '6', thumbnail: require('../../assets/placeholder.png')},
  ],
  december2025: [
    {id: '7', thumbnail: require('../../assets/placeholder.png')},
    {id: '8', thumbnail: require('../../assets/placeholder.png')},
  ],
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileRow}>
            <Image
              source={require('../../assets/placeholder.png')}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.username}>Krzysztof</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Snaplets:</Text>
                  <Text style={styles.statValue}>6</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Friends:</Text>
                  <Text style={styles.statValue}>3</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Likes:</Text>
                  <Text style={styles.statValue}>625</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageIcon}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* January 2026 Section */}
        <View style={styles.monthSection}>
          <Text style={styles.monthTitle}>January 2026</Text>
          <View style={styles.monthDivider} />
          <View style={styles.snapletsGrid}>
            {mockSnaplets.january2026.map((snaplet, index) => (
              <TouchableOpacity key={snaplet.id} style={styles.snapletItem}>
                <Image
                  source={snaplet.thumbnail}
                  style={styles.snapletThumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* December 2025 Section */}
        <View style={styles.monthSection}>
          <Text style={styles.monthTitle}>December 2025</Text>
          <View style={styles.monthDivider} />
          <View style={styles.snapletsGrid}>
            {mockSnaplets.december2025.map((snaplet, index) => (
              <TouchableOpacity key={snaplet.id} style={styles.snapletItem}>
                <Image
                  source={snaplet.thumbnail}
                  style={styles.snapletThumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* November 2025 Section (Empty) */}
        <View style={styles.monthSection}>
          <Text style={styles.monthTitle}>November 2025</Text>
          <View style={styles.monthDivider} />
        </View>
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
    padding: 16,
    alignItems: 'flex-start',
  },
  settingsButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileHeader: {
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    gap: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  messageIcon: {
    fontSize: 20,
  },
  monthSection: {
    marginBottom: 32,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  monthDivider: {
    height: 2,
    backgroundColor: '#000000',
    marginBottom: 16,
  },
  snapletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  snapletItem: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  snapletThumbnail: {
    width: '100%',
    height: '100%',
  },
});

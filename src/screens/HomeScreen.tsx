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
import {HomeStackParamList} from '../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'HomeFeed'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Mock data for the grid
const mockSnaplets = [
  {id: '1', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
  {id: '2', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
  {id: '3', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
  {id: '4', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
  {id: '5', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
  {id: '6', thumbnail: require('../../assets/placeholder.png'), type: 'image'},
];

const mockProcessing = [
  {id: 'p1', duration: '12:32:12'},
  {id: 'p2', duration: '36:32:12'},
  {id: 'p3', duration: '60:32:12'},
];

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E2723" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.settingsButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Grid Container */}
        <View style={styles.gridContainer}>
          {/* First Row */}
          <View style={styles.row}>
            {mockSnaplets.slice(0, 5).map((snaplet, index) => (
              <TouchableOpacity
                key={snaplet.id}
                style={styles.gridItem}
                onPress={() =>
                  navigation.navigate('VideoView', {
                    videoId: snaplet.id,
                    userId: 'user1',
                  })
                }>
                <Image
                  source={snaplet.thumbnail}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Second Row with one actual image and placeholders */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() =>
                navigation.navigate('VideoView', {
                  videoId: '6',
                  userId: 'user1',
                })
              }>
              <Image
                source={mockSnaplets[5].thumbnail}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
          </View>

          {/* Third Row - All placeholders */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map(i => (
              <View key={`r3-${i}`} style={styles.gridItem}>
                <View style={styles.placeholderBox} />
              </View>
            ))}
          </View>

          {/* Fourth Row - All placeholders */}
          <View style={styles.row}>
            {[1, 2, 3, 4, 5].map(i => (
              <View key={`r4-${i}`} style={styles.gridItem}>
                <View style={styles.placeholderBox} />
              </View>
            ))}
          </View>

          {/* Fifth Row - Placeholders, Add button, and Processing videos */}
          <View style={styles.row}>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
            <View style={styles.gridItem}>
              <View style={styles.placeholderBox} />
            </View>
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => console.log('Add new snaplet')}>
              <View style={styles.addButton}>
                <Text style={styles.addIcon}>+</Text>
              </View>
            </TouchableOpacity>
            {mockProcessing.map(proc => (
              <View key={proc.id} style={styles.gridItem}>
                <View style={styles.processingBox}>
                  <View style={styles.loadingIndicator} />
                  <Text style={styles.processingTime}>{proc.duration}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Sixth Row - One processing video */}
          <View style={styles.row}>
            <View style={styles.gridItem}>
              <View style={styles.processingBox}>
                <View style={styles.loadingIndicator} />
                <Text style={styles.processingTime}>60:32:12</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723',
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
  gridContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gridItem: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5E6D3',
    borderRadius: 12,
  },
  addButton: {
    width: '100%',
    height: '100%',
    backgroundColor: '#5D4037',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  addIcon: {
    fontSize: 48,
    color: '#F5E6D3',
    fontWeight: '300',
  },
  processingBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#A1887F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#F5E6D3',
    borderTopColor: 'transparent',
    marginBottom: 8,
  },
  processingTime: {
    fontSize: 12,
    color: '#F5E6D3',
    fontWeight: '600',
  },
});

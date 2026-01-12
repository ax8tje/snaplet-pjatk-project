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
import {HomeStackParamList} from '../types/navigation';

type SearchScreenNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'Search'
>;

interface SearchScreenProps {
  navigation: SearchScreenNavigationProp;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const mockResults = [
    {id: '1', type: 'user', name: 'Krzysztof', image: null},
    {id: '2', type: 'user', name: 'Frank', image: null},
    {id: '3', type: 'video', name: 'Amazing Snaplet', image: null},
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {mockResults.map(result => (
          <TouchableOpacity key={result.id} style={styles.resultItem}>
            <Image
              source={require('../../assets/placeholder.png')}
              style={styles.resultImage}
            />
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultType}>
                {result.type === 'user' ? 'User' : 'Video'}
              </Text>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4C4A8',
    borderRadius: 12,
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
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  resultType: {
    fontSize: 14,
    color: '#666666',
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Settings'
>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

interface SettingItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const SettingItem: React.FC<SettingItemProps> = ({icon, label, onPress}) => {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  navigation,
}) => {
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="search for settings"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Settings List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <SettingItem
            icon="👤"
            label="Account"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="🔔"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          <SettingItem
            icon="👁"
            label="Appearance"
            onPress={() => navigation.navigate('Appearance')}
          />
          <SettingItem
            icon="🔒"
            label="Privacy & Security"
            onPress={() => navigation.navigate('Privacy')}
          />
          <SettingItem
            icon="🎧"
            label="Help and Support"
            onPress={() => navigation.navigate('Help')}
          />
          <SettingItem
            icon="💡"
            label="About"
            onPress={() => navigation.navigate('About')}
          />
        </ScrollView>
      </View>
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
    backgroundColor: '#F5E6D3',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5E6D3',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4C4A8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingLabel: {
    fontSize: 18,
    color: '#000000',
  },
  chevron: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
});

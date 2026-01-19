import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';

type HelpScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Help'
>;

interface HelpScreenProps {
  navigation: HelpScreenNavigationProp;
}

interface HelpItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const HelpItem: React.FC<HelpItemProps> = ({icon, label, onPress}) => {
  return (
    <TouchableOpacity style={styles.helpItem} onPress={onPress}>
      <Text style={styles.helpIcon}>{icon}</Text>
      <Text style={styles.helpLabel}>{label}</Text>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

export const HelpScreen: React.FC<HelpScreenProps> = ({navigation}) => {
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
        <Text style={styles.headerTitle}>Help and Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <HelpItem
          icon="📖"
          label="Help Center"
          onPress={() => console.log('Open Help Center')}
        />
        <HelpItem
          icon="💬"
          label="Contact Support"
          onPress={() => console.log('Contact Support')}
        />
        <HelpItem
          icon="📧"
          label="Report a Problem"
          onPress={() => console.log('Report Problem')}
        />
        <HelpItem
          icon="📱"
          label="Community Guidelines"
          onPress={() => console.log('Community Guidelines')}
        />
        <HelpItem
          icon="📄"
          label="Terms of Service"
          onPress={() => console.log('Terms of Service')}
        />
        <HelpItem
          icon="🔒"
          label="Privacy Policy"
          onPress={() => console.log('Privacy Policy')}
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4A8',
  },
  helpIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  helpLabel: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  chevron: {
    fontSize: 32,
    color: '#000000',
    fontWeight: '300',
  },
});

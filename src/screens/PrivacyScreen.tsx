import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';

type PrivacyScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Privacy'
>;

interface PrivacyScreenProps {
  navigation: PrivacyScreenNavigationProp;
}

interface SettingToggleProps {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
};

export const PrivacyScreen: React.FC<PrivacyScreenProps> = ({navigation}) => {
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [allowMessages, setAllowMessages] = useState(true);

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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <SettingToggle
          label="Private Account"
          description="Only approved followers can see your Snaplets"
          value={privateAccount}
          onValueChange={setPrivateAccount}
        />
        <SettingToggle
          label="Show Activity Status"
          description="Let others see when you're active"
          value={showActivity}
          onValueChange={setShowActivity}
        />
        <SettingToggle
          label="Allow Comments"
          description="Let others comment on your Snaplets"
          value={allowComments}
          onValueChange={setAllowComments}
        />
        <SettingToggle
          label="Allow Messages"
          description="Let others send you messages"
          value={allowMessages}
          onValueChange={setAllowMessages}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4A8',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
  },
});

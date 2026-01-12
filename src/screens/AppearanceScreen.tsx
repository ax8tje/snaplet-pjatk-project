import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';

type AppearanceScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Appearance'
>;

interface AppearanceScreenProps {
  navigation: AppearanceScreenNavigationProp;
}

interface ThemeOptionProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.themeOption, isSelected && styles.themeOptionSelected]}
      onPress={onPress}>
      <Text
        style={[
          styles.themeOptionText,
          isSelected && styles.themeOptionTextSelected,
        ]}>
        {label}
      </Text>
      {isSelected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
};

export const AppearanceScreen: React.FC<AppearanceScreenProps> = ({
  navigation,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>(
    'light',
  );

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
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Theme</Text>
        <ThemeOption
          label="Light"
          isSelected={selectedTheme === 'light'}
          onPress={() => setSelectedTheme('light')}
        />
        <ThemeOption
          label="Dark"
          isSelected={selectedTheme === 'dark'}
          onPress={() => setSelectedTheme('dark')}
        />
        <ThemeOption
          label="Auto"
          isSelected={selectedTheme === 'auto'}
          onPress={() => setSelectedTheme('auto')}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
    marginTop: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
  },
  themeOptionSelected: {
    backgroundColor: '#3E2723',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  themeOptionTextSelected: {
    color: '#F5E6D3',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#F5E6D3',
  },
});

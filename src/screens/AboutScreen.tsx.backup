import React from 'react';
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

type AboutScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'About'
>;

interface AboutScreenProps {
  navigation: AboutScreenNavigationProp;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({navigation}) => {
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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>▶</Text>
          </View>
          <Text style={styles.logoText}>Snaplet</Text>
        </View>

        {/* Version Info */}
        <View style={styles.infoSection}>
          <Text style={styles.versionLabel}>Version</Text>
          <Text style={styles.versionValue}>1.0.0</Text>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.description}>
            Snaplet is a social media platform for sharing short video content
            with friends and the world. Create, share, and discover amazing
            Snaplets!
          </Text>
        </View>

        {/* Credits */}
        <View style={styles.creditsSection}>
          <Text style={styles.creditsTitle}>Created by</Text>
          <Text style={styles.creditsText}>PJATK Students</Text>
          <Text style={styles.creditsText}>© 2026 Snaplet</Text>
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 40,
    color: '#FFFFFF',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C4A8',
    marginBottom: 24,
  },
  versionLabel: {
    fontSize: 16,
    color: '#000000',
  },
  versionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  descriptionSection: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666666',
    textAlign: 'center',
  },
  creditsSection: {
    alignItems: 'center',
  },
  creditsTitle: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
  creditsText: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
});

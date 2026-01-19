import React from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../types/navigation';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

interface WelcomeScreenProps {
  navigation: WelcomeScreenNavigationProp;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <Text style={styles.logoIcon}>▶</Text>
        </View>
        <Text style={styles.logoText}>Snaplet</Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.promptText}>Don't have an account?</Text>
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('Register')}>
          Register.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5E6D3',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
    backgroundColor: '#D4C4A8',
    paddingVertical: 20,
  },
  promptText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

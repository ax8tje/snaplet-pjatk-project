import React from 'react';
import {View, Text, StyleSheet, StatusBar, ScrollView} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../types/navigation';
import {Button, Input} from '../components';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

// Simple icon components (you can replace these with actual icon libraries later)
const UserIcon = () => <Text style={styles.icon}>👤</Text>;
const FacebookIcon = () => <Text style={styles.icon}>f</Text>;
const InstagramIcon = () => <Text style={styles.icon}>📷</Text>;
const PeopleIcon = () => <Text style={styles.icon}>👥</Text>;

export const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5E6D3" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoIcon}>▶</Text>
          </View>
          <Text style={styles.logoText}>Snaplet</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Input
            placeholder="Use phone / email / username"
            icon={<UserIcon />}
            containerStyle={styles.input}
          />

          <Button
            title="Continue with Facebook"
            variant="social"
            icon={<FacebookIcon />}
            onPress={() => console.log('Facebook login')}
            style={styles.socialButton}
          />

          <Button
            title="Continue with Instagram"
            variant="social"
            icon={<InstagramIcon />}
            onPress={() => console.log('Instagram login')}
            style={styles.socialButton}
          />

          <Button
            title="Continue as Guest"
            variant="social"
            icon={<PeopleIcon />}
            onPress={() => console.log('Guest login')}
            style={styles.socialButton}
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.promptText}>Already have an account?</Text>
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate('Welcome')}>
            Login.
          </Text>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
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
  formContainer: {
    paddingHorizontal: 40,
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  socialButton: {
    marginVertical: 4,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
    paddingTop: 40,
    backgroundColor: '#D4C4A8',
    paddingVertical: 20,
    marginTop: 40,
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
  icon: {
    fontSize: 20,
  },
});

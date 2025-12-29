import React from 'react';
import {View, Text, StyleSheet, StatusBar, ScrollView} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AuthStackParamList} from '../types/navigation';
import {Button, Input} from '../components';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

interface RegisterScreenProps {
  navigation: RegisterScreenNavigationProp;
}

// Simple icon components
const UserIcon = () => <Text style={styles.icon}>👤</Text>;
const EmailIcon = () => <Text style={styles.icon}>✉️</Text>;
const LockIcon = () => <Text style={styles.icon}>🔒</Text>;
const FacebookIcon = () => <Text style={styles.icon}>f</Text>;
const InstagramIcon = () => <Text style={styles.icon}>📷</Text>;

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigation,
}) => {
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

        {/* Register Form */}
        <View style={styles.formContainer}>
          <Input
            placeholder="Username"
            icon={<UserIcon />}
            containerStyle={styles.input}
          />

          <Input
            placeholder="Email"
            icon={<EmailIcon />}
            keyboardType="email-address"
            containerStyle={styles.input}
          />

          <Input
            placeholder="Password"
            icon={<LockIcon />}
            secureTextEntry
            containerStyle={styles.input}
          />

          <Button
            title="Create Account"
            onPress={() => console.log('Register')}
            style={styles.registerButton}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Facebook"
            variant="social"
            icon={<FacebookIcon />}
            onPress={() => console.log('Facebook register')}
            style={styles.socialButton}
          />

          <Button
            title="Continue with Instagram"
            variant="social"
            icon={<InstagramIcon />}
            onPress={() => console.log('Instagram register')}
            style={styles.socialButton}
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.promptText}>Already have an account?</Text>
          <Text
            style={styles.linkText}
            onPress={() => navigation.navigate('Login')}>
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
    marginTop: 40,
    marginBottom: 30,
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
    marginBottom: 4,
  },
  registerButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D4C4A8',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#999999',
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
    marginTop: 20,
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

import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../types/navigation';
import {
  ProfileScreen,
  SettingsScreen,
  EditProfileScreen,
  NotificationsScreen,
  AppearanceScreen,
  PrivacyScreen,
  HelpScreen,
  AboutScreen,
} from '../screens';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};

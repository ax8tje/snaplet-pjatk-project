import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MessagesStackParamList} from '../types/navigation';
import {MessagesScreen, ChatScreen} from '../screens';

const Stack = createNativeStackNavigator<MessagesStackParamList>();

export const MessagesStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="MessagesList" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

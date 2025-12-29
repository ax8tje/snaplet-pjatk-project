import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthNavigator} from './AuthNavigator';

export const RootNavigator = () => {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
};

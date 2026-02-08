import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MainTabParamList} from '../types/navigation';
import {HomeStackNavigator} from './HomeStackNavigator';
import {MessagesStackNavigator} from './MessagesStackNavigator';
import {ProfileStackNavigator} from './ProfileStackNavigator';
import {FriendsScreen, CameraScreen, CalendarScreen} from '../screens';
import {Text, StyleSheet} from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple icon components
const ProfileIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.icon, focused && styles.iconActive]}>👤</Text>
);

const FriendsIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.icon, focused && styles.iconActive]}>👥</Text>
);

const CameraIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.iconLarge, focused && styles.iconActive]}>▶</Text>
);

const MessagesIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.icon, focused && styles.iconActive]}>💬</Text>
);

const GridIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.icon, focused && styles.iconActive]}>⊞</Text>
);

const CalendarIcon = ({focused}: {focused: boolean}) => (
    <Text style={[styles.icon, focused && styles.iconActive]}>📅</Text>
);

export const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#000000',
                tabBarInactiveTintColor: '#666666',
                tabBarShowLabel: false,
                tabBarHideOnKeyboard: true,
            }}>
            <Tab.Screen
                name="Profile"
                component={ProfileStackNavigator}
                options={{
                    tabBarIcon: ProfileIcon,
                }}
            />
            <Tab.Screen
                name="Friends"
                component={FriendsScreen}
                options={{
                    tabBarIcon: FriendsIcon,
                }}
            />
            <Tab.Screen
                name="Camera"
                component={CameraScreen}
                options={{
                    tabBarIcon: CameraIcon,
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={CalendarScreen}
                options={{
                    tabBarIcon: ({ focused }) => <Text style={[styles.icon, focused && styles.iconActive]}>📅</Text>,
                }}
            />
            <Tab.Screen
                name="Messages"
                component={MessagesStackNavigator}
                options={{
                    tabBarIcon: MessagesIcon,
                }}
            />
            <Tab.Screen
                name="Home"
                component={HomeStackNavigator}
                options={{
                    tabBarIcon: GridIcon,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: '#F5E6D3',
        borderTopWidth: 0,
        height: 80,
        paddingBottom: 20,
        paddingTop: 10,
    },
    icon: {
        fontSize: 24,
    },
    iconLarge: {
        fontSize: 32,
    },
    iconActive: {
        opacity: 1,
    },
});
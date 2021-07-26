/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import { BottomTabParamList, WelcomeParamList, OwingParamList, OwesParamList, HistoryParamList, SendParamList, SettingsParamList  } from '../types';

import WelcomeScreen from '../screens/WelcomeScreen';
import OwingScreen from '../screens/OwingScreen';
import OwesScreen from '../screens/OwesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SendScreen from '../screens/SendScreen';
import SettingsScreen from '../screens/SettingsScreen';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Welcome"
      tabBarOptions={{ activeTintColor: Colors[colorScheme].tint }}>
      <BottomTab.Screen
        name="Welcome"
        component={WelcomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Owing"
        component={OwingNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-up-circle" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Owes"
        component={OwesNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-down-circle" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="History"
        component={HistoryNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Send"
        component={SendNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="arrow-up" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}


// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const WelcomeStack = createStackNavigator<WelcomeParamList>();

function WelcomeNavigator() {
  return (
    <WelcomeStack.Navigator>
      <WelcomeStack.Screen
        name="WelcomeScreen"
        component={WelcomeScreen}
        options={{ headerTitle: 'Welcome', headerShown: false }}
      />
    </WelcomeStack.Navigator>
  );
}

const OwingStack = createStackNavigator<OwingParamList>();

function OwingNavigator() {
  return (
    <OwingStack.Navigator>
      <OwingStack.Screen
        name="OwingScreen"
        component={OwingScreen}
        options={{ headerTitle: 'Owing', headerShown: false }}
      />
    </OwingStack.Navigator>
  );
}

const OwesStack = createStackNavigator<OwesParamList>();

function OwesNavigator() {
  return (
    <OwesStack.Navigator>
      <OwesStack.Screen
        name="OwesScreen"
        component={OwesScreen}
        options={{ headerTitle: 'Owes', headerShown: false }}
      />
    </OwesStack.Navigator>
  );
}

const HistoryStack = createStackNavigator<HistoryParamList>();

function HistoryNavigator() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name="HistoryScreen"
        component={HistoryScreen}
        options={{ headerTitle: 'History', headerShown: false }}
      />
    </HistoryStack.Navigator>
  );
}

const SendStack = createStackNavigator<SendParamList>();

function SendNavigator() {
  return (
    <SendStack.Navigator>
      <SendStack.Screen
        name="SendScreen"
        component={SendScreen}
        options={{ headerTitle: 'Send', headerShown: false }}
      />
    </SendStack.Navigator>
  );
}

const SettingsStack = createStackNavigator<SettingsParamList>();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerTitle: 'Settings', headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
}

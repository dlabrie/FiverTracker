import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { Text } from '../components/Themed';

import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';

import { authContext } from '../reducers/authContext';

import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// EACH TIME A NAVIGATION OCCURS A THE NEW SCREEN WILL BE PUSHED
// ON TOP OF A STACKNAVIGATOR. EACH BACK ACTION REMOVES THE SCREEN
// FROM THE STACKNAVIGATOR
const AuthenticationNavigationStack = createStackNavigator();

export default function AuthenticationStackScreen() {
  const { authState, authDispatch } = useContext(authContext);

  const [authenticated, setAuthenticated] = useState(false);
  const checkAuth = () => {
    if(!authState.authToken) {
      if(authenticated)
        setAuthenticated(false);
      return false;
    }

    if(!authenticated)
      setAuthenticated(true);

    return checkFaceId();
  }

  const checkFaceId = async () => {
    return true;
    try {
      // Checking if device is compatible
      const isCompatible = await LocalAuthentication.hasHardwareAsync();
      
      if (!isCompatible) {
        alert('Error','This application relies on biometric authentication and therefore incompatible.')
        if(authenticated)
          setAuthenticated(false);
        return false;
      }

      // Checking if device has biometrics records
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!isEnrolled) {
        Alert.alert('Error','This application relies on biometric data, please configure your device.')
        if(authenticated)
          setAuthenticated(false);
        return false;
      }

      // Authenticate user
      await LocalAuthentication.authenticateAsync();

      if(!authenticated)
        setAuthenticated(true);
      return true;
    } catch (error) {
      Alert.alert('An error as occured', error?.message);
    }
  };

  // NOTE THAT 'CHECKFORTOKEN' GETS CALLED ONLY
  // DURING FIRST RENDER BY PASSING THE EMPTY ARRAY
  // TO USEEFFECT'S SECOND PARAMETER
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <authContext.Provider value={{authState, authDispatch}}>
        <AuthenticationNavigationStack.Navigator
            screenOptions={{
            headerTransparent: true,
            headerBackTitleVisible: false,
            headerTitle: () => null,
            }}
        >
          {!authenticated && !authState.authToken ? (
            <AuthenticationNavigationStack.Screen name="Login" component={LoginScreen} />
            ) : (
            <AuthenticationNavigationStack.Screen name="Root" component={BottomTabNavigator} />
          )}
        </AuthenticationNavigationStack.Navigator>
    </authContext.Provider>

  );
};


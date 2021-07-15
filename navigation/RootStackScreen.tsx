import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Alert } from 'react-native';
import { Text } from '../components/Themed';

import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';

import AuthenticationStackScreen from './AuthenticationStackScreen';

import { authContext } from '../reducers/authContext';

import * as SecureStore from 'expo-secure-store';

// EACH TIME A NAVIGATION OCCURS A THE NEW SCREEN WILL BE PUSHED
// ON TOP OF A STACKNAVIGATOR. EACH BACK ACTION REMOVES THE SCREEN
// FROM THE STACKNAVIGATOR
const RootNavigationStack = createStackNavigator();

export default function RootStackScreen() {
  const { authState, authDispatch } = useContext(authContext);

  const getAuthToken = async () => {
    const authToken = await SecureStore.getItemAsync('authToken');
    if (authToken) {
      authDispatch({ type: 'setAuthToken', authToken: authToken });
    }
    return authToken;
  };

  const getUUID = async () => {
    const UUID = await SecureStore.getItemAsync('UUID');
    if (!UUID) {
      authDispatch({ type: 'generateUUID' });
    } else {
      authDispatch({ type: 'setUUID', UUID: UUID});
    }
    return UUID;
  };

  // NOTE THAT 'CHECKFORTOKEN' GETS CALLED ONLY
  // DURING FIRST RENDER BY PASSING THE EMPTY ARRAY
  // TO USEEFFECT'S SECOND PARAMETER
  useEffect(() => {
    getAuthToken();
    getUUID();
  }, []);

  // We only want to start drawing the app when the authState has been updated.
  return (
    <authContext.Provider value={{authState, authDispatch}}>
      {authState && authState.uuid && <AuthenticationStackScreen />}
    </authContext.Provider>

  );
};


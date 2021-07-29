/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import * as React from 'react';
import { ColorSchemeName } from 'react-native';

import RootStackScreen from './RootStackScreen';
import { AuthStore } from '../reducers/authContext';
import { TransactionStore } from '../reducers/transactionContext';

import * as SecureStore from 'expo-secure-store';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const getColourMode = async () => {
    const colourmode = await SecureStore.getItemAsync('colourmode');
    if (!colourmode) {
      authDispatch({ type: 'colourmode', colourmode: "dark" });
      return 'dark';
    } 
    return colourmode === 'dark' ? "dark" : "light";
  };

  return (
    <AuthStore>
      <TransactionStore>
        <NavigationContainer
          theme={DarkTheme}>
          <RootStackScreen />
        </NavigationContainer>
      </TransactionStore>
    </AuthStore>
  );
}


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

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <AuthStore>
      <TransactionStore>
        <NavigationContainer
          theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootStackScreen />
        </NavigationContainer>
      </TransactionStore>
    </AuthStore>
  );
}


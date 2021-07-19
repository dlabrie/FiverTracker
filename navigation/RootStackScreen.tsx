import React, { useContext, useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Text, View  } from '../components/Themed';

import BottomTabNavigator from './BottomTabNavigator';
import LoginScreen from '../screens/LoginScreen';

import LoadingScreen from '../components/LoadingScreen';


import AuthenticationStackScreen from './AuthenticationStackScreen';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import * as SecureStore from 'expo-secure-store';

// EACH TIME A NAVIGATION OCCURS A THE NEW SCREEN WILL BE PUSHED
// ON TOP OF A STACKNAVIGATOR. EACH BACK ACTION REMOVES THE SCREEN
// FROM THE STACKNAVIGATOR
const RootNavigationStack = createStackNavigator();

export default function RootStackScreen() {
  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

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
    transactionDispatch({type: "init"});
  }, []);

  const showLoadingScreen = () => {
    
    if(!transactionState.loadingComplete) {
      var text = `Loading transactions ${transactionState.loadingMode} ${transactionState.loadingDate} \n\n${transactionState.loadingState}`;
      return (            <View style={styles.loadingIconContainer}>
        <View style={styles.loadingIconShade}>
            <ActivityIndicator
                color = '#009FFF'
                size = "large"
                style = {styles.loadingIcon}/>
        </View>
        <View style={styles.textShade}>
            <Text darkColor="#fff" lightColor="#fff">{text}</Text>
        </View>
    </View>);
      
    }
    return null;
  }

  // We only want to start drawing the app when the authState has been updated.
  return (
    <authContext.Provider value={{authState, authDispatch}}>
      <transactionContext.Provider value={{ transactionState, transactionDispatch }}>
        {transactionState && transactionState.init && authState && authState.uuid && <AuthenticationStackScreen />}
        {showLoadingScreen()}
      </transactionContext.Provider>
    </authContext.Provider>

  );
};

const styles = StyleSheet.create({
  loadingIconContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingIconShade: {
      alignItems: 'center',
      justifyContent: 'center',   
      padding: 30,
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 100,
  },
  textShade: {
      alignItems: 'center',
      justifyContent: 'center',   
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 5,
      marginTop:20,
      borderStyle: "solid",
      borderColor: "#fff",
      borderWidth: 1,
  },
  loadingIcon: {
      alignItems: 'center',
      justifyContent: 'center'
  }
});

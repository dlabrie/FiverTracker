import React, {useContext} from 'react';
import { Alert, Button, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import * as SecureStore from 'expo-secure-store';

export default function App() {
      
  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const Logout = async () => {
    transactionDispatch({ type: 'resetTransactions'});
    authDispatch({ type: 'unsetAuthToken'});
  };
  const resetTransactions = async () => {
    transactionDispatch({ type: 'resetTransactions'});
    alert("The transaction cache has been emptied.");
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerSettings}>
        <TouchableOpacity style={styles.btn} onPress={resetTransactions}>
            <Text lightColor="#fff">Empty Transaction Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={Logout}>
            <Text lightColor="#fff">LOGOUT</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 10,
    flexBasis: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSettings: {
    width: "95%",
  },
  text: {
    textAlign: 'center',
  },
  btn: {
    width: "100%",
    borderRadius: 3,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop: 5,
    backgroundColor: "#009FFF",
    marginTop: 20,
  },
});
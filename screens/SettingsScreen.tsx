import React, {useContext} from 'react';
import { Alert, Button, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View } from '../components/Themed';

import { authContext } from '../reducers/authContext';

import * as SecureStore from 'expo-secure-store';

export default function App() {
      
  const { state, dispatch } = useContext(authContext);

  const Logout = async () => {
    dispatch({ type: 'unsetAuthToken'});
  };

  return (
    <View style={styles.container}>
      <View style={styles.containerSettings}>
        <Text>state: {JSON.stringify(state)}</Text>
        <TouchableOpacity style={styles.btn} onPress={Logout}>
            <Text>LOGOUT</Text>
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
    width: "90%",
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
    backgroundColor: "#009FFF"
  },
});
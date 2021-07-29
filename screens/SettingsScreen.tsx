import React, {useContext, useEffect, useState} from 'react';
import { StyleSheet, TouchableOpacity, Switch, TouchableWithoutFeedback, Keyboard } from 'react-native';

import { Text, View, TextInput } from '../components/Themed';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import Constants from 'expo-constants';

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

  const [isEnabled, setIsEnabled] = useState(true);
  const toggleSwitch = (state: any) => {
    alert( state?"dark":"light");
    authDispatch({type: "colourmode", colourmode: state?"dark":"light"})
  }

  const refreshTransactions =  () => {
    transactionDispatch({type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
  };

  const [fromNote, setFromNoteState] = useState("");

  const pullNote = async () => {
    const note = await SecureStore.getItemAsync('fromNote');
    if(note!=fromNote && note!="")
    setFromNoteState(note);
  };

  const setFromNote = async (str: string) => {
    setFromNoteState(str);
    SecureStore.setItemAsync('fromNote', str);
  }

  useEffect(()=>{
    pullNote();
  })


        /*
        <View style={styles.settingView}>
          <View style={styles.settingTitleView}>
            <Text style={styles.settingTitle}>Dark Mode {authState.colourmode}</Text>
          </View>
          <View style={styles.toggleView}>
            <Switch
              trackColor={{ false: "#222", true: "#009fff" }}
              ios_backgroundColor="#222"
              onValueChange={toggleSwitch}
              value={authState.colourmode=="dark"}
            />
          </View>
        </View>
*/
  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>

    <View style={styles.container}>
      <View style={styles.containerSettings}>

        <Text style={styles.settingTitle}>Swap back note</Text>
        <TextInput
            style={styles.textInput}
            placeholder="Note added when sending back"
            autoCapitalize="none"
            autoCorrect={true}
            value={fromNote}
            maxLength={250}
            onChangeText={(fromNote) => setFromNote(fromNote)}
            />

        <TouchableOpacity style={styles.btn} onPress={refreshTransactions}>
            <Text lightColor="#fff">Refresh Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={resetTransactions}>
            <Text lightColor="#fff">Empty Transaction Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={Logout}>
            <Text lightColor="#fff">Logout</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Version: v0.6.420</Text>

      </View>
    </View>
    </TouchableWithoutFeedback>
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

  settingView: {
    flexDirection: "row",
  },
  settingTitleView: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: "100%",
    flex: 85,
  },
  settingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  toggleView: {
    flex: 15,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  textInput: {
    width: '100%',
    padding: 15,
    borderRadius: 3,
    marginBottom:10,
  },

  text: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 10,
  },
  btn: {
    width: "100%",
    borderRadius: 3,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "#009FFF",
    marginTop: 20,
  },
});
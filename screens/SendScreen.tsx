import React, {useContext, useState} from 'react';
import { Alert, Button, StyleSheet, TouchableOpacity } from 'react-native';

import { Text, View, TextInput } from '../components/Themed';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import lookupLabrie from '../components/labrie/lookupLabrie';
import * as fundHandler from "../components/fundHandler";
import { useEffect } from 'react';

import * as SecureStore from 'expo-secure-store';


export default function Send() {
      
  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [myShaketag, setMyShaketag] = useState("");
  const [myNote, setMyNoteState] = useState("");

  const setMyNote = async (str) => {
    setMyNoteState(str);
    SecureStore.setItemAsync('note', str);
  }

  const pullNote = async () => {
    const note = await SecureStore.getItemAsync('note');
    if(note!=myNote && note!="")
        setMyNoteState(note);
  };

  const Send = async () => {
    var response = await lookupLabrie(authState.uuid, myShaketag, "initiate");
    var resp = await response.json();
    if(response.status != 200) {
      alert("Something went wrong when checking if you should initiate with this person with swap.labrie.ca.");
      return false;
    }

    if(resp.data.allow_initiate == 0) {
      alert(resp.data.shaketag+" is marked as do not initiate: "+resp.data.reason);
      return false;
    }

    if(typeof transactionState.peersInverse[myShaketag] !== 'undefined') {
      for(let sid in transactionState.todaysSwappers) {
        if(transactionState.peersInverse[myShaketag] == sid) {
          Alert.alert("Uh oh", "It appears you've already swapped with "+myShaketag);
          return false;
        }
      }
    }
    
    transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: 'Sending a Fiver to '+myShaketag});
    await fundHandler.sendFunds(authState.uuid, authState.authToken, myShaketag, "5.00", myNote);

    transactionDispatch({ type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
    setMyShaketag("");
  };

  useEffect(()=>{
    pullNote();
  })

  return (
    <View style={styles.container}>
      <View style={styles.containerSettings}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Send a fiver 💸</Text>
        </View>
        <TextInput
            style={styles.textInput}
            placeholder="shaketag"
            autoCapitalize="none"
            autoCorrect={false}
            value={myShaketag}
            onChangeText={(myShaketag) => setMyShaketag(myShaketag)}
            />
        <TextInput
            style={styles.textInput}
            placeholder="note"
            autoCapitalize="none"
            autoCorrect={true}
            value={myNote}
            maxLength={250}
            onChangeText={(myNote) => setMyNote(myNote)}
            />
        <TouchableOpacity style={styles.btn} onPress={Send}>
            <Text lightColor="#fff">Send</Text>
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
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    marginBottom:10,
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:40,
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
    //marginTop: 5,
    backgroundColor: "#009FFF",
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderRadius: 3,
    marginBottom:10,
  },
});
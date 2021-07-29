import { Ionicons } from '@expo/vector-icons';

import React, {useContext, useState} from 'react';
import { Alert, Button, StyleSheet, TouchableWithoutFeedback, TouchableOpacity, Keyboard, FlatList } from 'react-native';

import { Text, View, TextInput } from '../components/Themed';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import lookupLabrie from '../components/labrie/lookupLabrie';
import onlineBots from '../components/labrie/onlineBots';
import shaketag from '../components/shakepay/shaketag'

import * as fundHandler from "../components/fundHandler";
import { useEffect } from 'react';

import * as SecureStore from 'expo-secure-store';


export default function Send({navigation}) {
      
  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [toShaketag, setToShaketag] = useState("");
  const [toNote, setToNoteState] = useState("");

  const setToNote = async (str: string) => {
    setToNoteState(str);
    SecureStore.setItemAsync('note', str);
  }

  const pullNote = async () => {
    const note = await SecureStore.getItemAsync('note');
    if(note!=toNote && note!="")
        setToNoteState(note);
  };

  const SendToBot = async (bot: string) => {
    Send(bot);
  }

  const SendTo = async () => {
    Send(toShaketag);
  }
  
  const Send = async (sendToShaketag: string) => {
    var response = await lookupLabrie(authState.uuid, sendToShaketag, "initiate");
    var resp = await response.json();
    if(response.status != 200) {
      alert("Something went wrong when checking if you should initiate with this person with swap.labrie.ca.");
      return false;
    }

    if(resp.data.allow_initiate == 0) {
      Alert.alert("Oh", resp.data.shaketag+" is marked as do not initiate: "+resp.data.reason,
      [ 
          {text: "Send anyway cause I want to", onPress: async () => {
                  transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: 'Sending a Fiver to '+sendToShaketag});
                  await fundHandler.sendFunds(authState.uuid, authState.authToken, sendToShaketag, "5.00", toNote);
              
                  transactionDispatch({ type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
                  setToShaketag("");
              } 
          },
          {text: "No, I'd rather not", style: 'cancel'}
      ]);
      return false;
    }

    if(typeof transactionState.peersInverse[sendToShaketag] !== 'undefined') {
      for(let sid in transactionState.todaysSwappers) {
        if(transactionState.peersInverse[sendToShaketag] == sid) {
          Alert.alert("Uh oh", "It appears you've already swapped with "+sendToShaketag);
          setToShaketag("");
          return false;
        }
      }
    }
    
    Alert.alert("Send a fiver", "Would you like to send $5 to "+sendToShaketag+"?",
    [ 
         {text: "Heck YES", onPress: async () => {
                transactionDispatch({ type: "loadingStatus", loadingComplete: false, loadingState: 'Sending a Fiver to '+sendToShaketag});
                await fundHandler.sendFunds(authState.uuid, authState.authToken, sendToShaketag, "5.00", toNote);
            
                transactionDispatch({ type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
                setToShaketag("");
             } 
         },
         {text: "No, I didn't mean to press that", style: 'cancel'}
    ]);
  };

  const [availableTags, setAvailableTags] = useState([]);

  const renderItem = ({item}) => {
    //return (<Text>{JSON.stringify(item)}</Text>);   
    return(
      <TouchableOpacity onPress={() => {SendToBot(item.shaketag);}}>
        <View style = {styles.row}>
           <View style = {styles.positionView}>
           <View style = {styles.positionCard}>
              <Text style={styles.position} lightColor="#fff">{item.position}</Text>
              </View>
           </View>
           <View style={styles.tagInfoView}>
                <View style={styles.tagInfoViewInside}>
                  <Text>@{ item.shaketag }</Text>
                  <Text>{item.points}</Text>
                  <Text style={styles.date} darkColor="#bbb" lightColor="#666">Last ping: {item.lastPingSeconds}</Text>
                </View>
            </View>
        </View>
      </TouchableOpacity>
    );

  }

  const EmptyListMessage = ({item}) => {
    return (
      // Flat List Item
      <Text>
        You either swapped with all online bots or none are online. Refresh to find out.
      </Text>
    );
  }

  const populateOnlineBots = async () => {
    var response = await onlineBots();
    var resp = await response.json();

    var myst = myShaketag;
    if(myShaketag=="") {
      var s = await shaketag(authState.uuid, authState.authToken);
      if(s!=myShaketag && s!="")
        setMyShaketag(s);
      
      myst = s;
    } 

    var available = [];
    for(let ob in resp) {
      var st = resp[ob].shaketag;
      var found = false;
      
      if(myst==st) {
        found = true;
      }
      
      if(found == false && typeof transactionState.peersInverse[st] !== 'undefined') {
        for(let sid in transactionState.todaysSwappers) {
          if(transactionState.peersInverse[st] == sid) {
            found = true;
          }
        }
      }
      if(!found) {
        available.push(resp[ob]);
      }
    }
    setAvailableTags(available);
  }

  useEffect(()=>{
    pullNote();

    const refresh = navigation.addListener('focus', () => {
      populateOnlineBots();
    });
    return refresh;
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>
      <View style={styles.container}>
        <View style={styles.subcontainer}>
          <View style={styles.containerSettings}>
            <Text style={styles.title}>Send a fiver 💸</Text>
          </View>
          <TextInput
              style={styles.textInput}
              placeholder="shaketag"
              autoCapitalize="none"
              autoCorrect={false}
              value={toShaketag}
              onChangeText={(toShaketag) => setToShaketag(toShaketag)}
              />
          <TextInput
              style={styles.textInput}
              placeholder="note"
              autoCapitalize="none"
              autoCorrect={true}
              value={toNote}
              maxLength={250}
              onChangeText={(toNote) => setToNote(toNote)}
              />
          <TouchableOpacity style={styles.btn} onPress={SendTo}>
              <Text lightColor="#fff">Send</Text>
          </TouchableOpacity>
        </View>
        <View style={{flex:1, width: "100%", paddingBottom: 60}}>
          <View style={styles.headerView}>
            <View style={styles.titleView}>
              <Text style={styles.title}>Online Bots</Text>
              <Text style={styles.helptext}>Press on a card to send to a bot.</Text>
              <Text style={styles.helptext}>Send at your own risk.</Text>
            </View>
            <View style={styles.refreshView}>
              <TouchableOpacity onPress={() => {populateOnlineBots()}}>
                <Ionicons name="refresh-sharp" size={30} color="#009fff" />
              </TouchableOpacity>
            </View>
          </View>
          <View>
            <FlatList
              data={availableTags}
              renderItem={renderItem}
              style={{ width: "100%", }}
              keyExtractor={(item) => item.shaketag}
              ListEmptyComponent={EmptyListMessage}
              /> 
          </View>
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
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: "column",
    height: "95%",
    marginTop: 20,
  },
  subcontainer: {
    width: "99%",
  },
  containerSettings: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: "100%",
    marginTop:30,
    marginBottom:10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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

  headerView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15,
  },
  titleContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: "100%",
    flex: 85,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',

  },
  helptext: {
    fontSize: 12,
  },
  refreshView: {
    flex: 15,
    justifyContent: "center",
    alignItems: "flex-end",

  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingTop: 5,
    justifyContent:"flex-end",
    borderRadius: 5,
    marginBottom: 5,
  },
  positionView: {
    flex: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#009FFF1A",
    borderTopStartRadius:10,
    borderBottomStartRadius:10,
    fontSize: 10,
  },
  positionCard: {
    padding: 15,
    borderRadius:100,
    backgroundColor: "#ff000099",
  },
  tagInfoView: {
    flex: 60,
    fontSize:12,
  },
  tagInfoViewInside: {
      backgroundColor: "#009FFF1A",
      padding:5,
      borderBottomEndRadius:10,
      borderTopEndRadius:10,
  },

});
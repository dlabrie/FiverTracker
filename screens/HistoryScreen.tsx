import { Ionicons } from '@expo/vector-icons';

import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import { Text, View, TextInput } from '../components/Themed';

import Transaction from '../components/Transaction';

import * as transactionDatabaseHandler from '../components/transactionDatabaseHandler'

export default function OwesScreen({navigation}) {

  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [filter, setFilter] = useState("");

  const [badges, setBadges] = useState([]);

  const renderItem = ({item}) => {
    var user = transactionState.peers[item.peer];
    return (<Transaction user={user} due={item.amount} amount={item.amount} createdAt={item.createdAt} note={item.note} />);
  }

  const setHistoryFilter = (shaketag, force=false) => {
    if(filter != shaketag || force) {
      setFilter(shaketag);
      if(shaketag != "") {
        transactionDatabaseHandler.getUserTransactions(shaketag, transactionDispatch);
      } else {
        transactionDatabaseHandler.getHistory(transactionDispatch);
      }
    }
  }

  const refreshTransactions = async () => {
    transactionDispatch({type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
    while(transactionState.loadingComplete==false) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHistoryFilter(filter, true);
  };

  useEffect(()=>{
    setHistoryFilter(filter);

    const refresh = navigation.addListener('focus', () => {
      setHistoryFilter(filter, true);
    });
    return refresh;
  }, [navigation]);
  
  const EmptyListMessage = ({item}) => {
    return (
      // Flat List Item
      <Text style={{marginTop:20}}>
        No transactions for current filter.
      </Text>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleView}>
          <Text style={styles.title}>History</Text>
        </View>
        <View style={styles.textInputView}>
          <TextInput
            style={styles.textInput}
            placeholder="shaketag"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={(txt) => setHistoryFilter(txt)}
            />
        </View>  
        <View style={styles.refreshView}>
          <TouchableOpacity onPress={() => {refreshTransactions()}}>
            <Ionicons name="refresh-sharp" size={30} color="#009fff" />
          </TouchableOpacity>
        </View>        
      
      </View>
      <FlatList
           data={transactionState.history}
           renderItem={renderItem}
           style={{ width: "100%" }}
           keyExtractor={(item) => item.transactionId}
           ListEmptyComponent={EmptyListMessage}
           /> 
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
    marginTop:30,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    flexDirection: "row",
    alignContent: "center",
    marginTop:5,
  },
  titleView: {
    flex: 4,
  },
  refreshView: {
    paddingLeft:5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInputView: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 6,
  },
  textInput: {
    width: '100%',
    padding: 15,
    borderRadius: 3,
  },


});

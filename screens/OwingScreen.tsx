import { Ionicons } from '@expo/vector-icons';

import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import { Text, View } from '../components/Themed';

import Dues from '../components/Dues'

export default function OwingScreen() {

  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [badges, setBadges] = useState([]);

  const renderItem = ({item}) => {
    var user = transactionState.peers[item.lastTransaction.peer];
    return (<Dues user={user} 
      due={item.amount} 
      amount={item.lastTransaction.amount} 
      createdAt={item.lastTransaction.createdAt} 
      note={item.lastTransaction.note} 
      uuid={authState.uuid} 
      authToken={authState.authToken}
      transactionDispatch={transactionDispatch} 
      />);
  }

  const refreshTransactions =  () => {
    transactionDispatch({type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
  };
  
  return (
    <View style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>You owe them</Text>
            <Text style={styles.helptext}>Press on a card to send back your dues.</Text>
          </View>
          <View style={styles.refreshView}>
            <TouchableOpacity onPress={() => {refreshTransactions()}}>
              <Ionicons name="refresh-sharp" size={30} color="#009fff" />
            </TouchableOpacity>
          </View>
        </View>
        <FlatList
           data={transactionState.owing}
           renderItem={renderItem}
           style={{ width: "100%" }}
           keyExtractor={(item) => item.lastTransaction.transactionId}
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
    marginTop: 40,
  },
  headerView: {
    flexDirection: "row",
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
  }
});

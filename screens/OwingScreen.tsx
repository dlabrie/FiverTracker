import React, { useState, useContext } from 'react';
import { StyleSheet, FlatList } from 'react-native';

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
  
  return (
    <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>You owe them</Text>
          <Text style={styles.helptext}>Press on a card to send back your dues.</Text>
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
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:30,
  },
  helptext: {
    fontSize: 12,
  },
});

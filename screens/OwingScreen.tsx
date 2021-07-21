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
        <View style={styles.shaketagContainer}>
          <Text style={styles.title}>You owe them</Text>
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
  shaketagContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueTextWaitlist: {
    fontSize: 28,
    fontWeight: "700",
    color: "#009FFF",
  },
  greyTextWaitlist: {
    marginTop: 10,
    fontSize: 14,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  paddle: {
    height: 25,
    width: 25,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    paddingTop: 5,
    justifyContent: 'space-around'
  },
  box: {
    width: "49%",
    paddingVertical: 5,
    alignItems: "center",
    backgroundColor: "#009FFF20",
    borderRadius:5,
  },
});

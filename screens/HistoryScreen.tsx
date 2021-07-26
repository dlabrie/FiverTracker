import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, FlatList } from 'react-native';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import { Text, View, TextInput } from '../components/Themed';

import Transaction from '../components/Transaction';


import * as transactionDatabaseHandler from '../components/transactionDatabaseHandler'

export default function OwesScreen() {

  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [filter, setFilter] = useState("");

  const [badges, setBadges] = useState([]);

  const renderItem = ({item}) => {
    var user = transactionState.peers[item.peer];
    return (<Transaction user={user} due={item.amount} amount={item.amount} createdAt={item.createdAt} note={item.note} />);
  }

  const setHistoryFilter = (shaketag) => {
    if(filter != shaketag) {
      setFilter(shaketag);
      if(shaketag != "") {
        transactionDatabaseHandler.getUserTransactions(shaketag, transactionDispatch);
      } else {
        transactionDatabaseHandler.getHistory(transactionDispatch);
      }
    }
  }

  useEffect(()=>{
    //ssetHistoryFilter("");
  });
  
  const EmptyListMessage = ({item}) => {
    return (
      // Flat List Item
      <Text>
        No Data Found
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
  },
  container90: {
    flex: 1,
    width: "95%",
    padding: 10,
    flexBasis: 10,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    flexDirection: "row",
    alignContent: "center",
    height: 90,
    marginTop:10,
  },
  titleView: {
    flex: 4,
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

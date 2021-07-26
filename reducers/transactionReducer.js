import uuid from "react-native-uuid";
import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('transactions.db') // returns Database object

import * as transactionDatabaseHandler from '../components/transactionDatabaseHandler'

const setToken = async (transactionToken) => {
  await SecureStore.setItemAsync('transactionToken', transactionToken);
};

const transactionReducer = (transactionState, action) => {
  switch (action.type) {
    case 'init':
        // Check if the items table exists if not create it
        transactionDatabaseHandler.init()
      
        return {
          ...transactionState,
          init: true,
        };
    case 'update':
      transactionDatabaseHandler.updateTransactions(action.uuid, action.authToken, action.transactionDispatch);
      return {
        ...transactionState,
      };
    case 'loadingStatus':      
      return {
        ...transactionState,
        loadingComplete: action.loadingComplete,
        loadingState: action.loadingState,
      }; 
    case 'storePeers':
      return {
        ...transactionState,
        peers: action.peers,
        peersInverse: action.peersInverse,
      };
    case 'dues': 
      return {
        ...transactionState,
        owing: action.owing,
        owes: action.owes,
      };
    case 'resetTransactions':
      transactionDatabaseHandler.resetTransactions();
      return {
        ...transactionState,
      };
    case 'userTransactions':
      return {
        ...transactionState,
        history: action.history,
      };
    case 'todaysSwappers': {
      return {
        ...transactionState,
        todaysSwappers: action.todaysSwappers,
      };
    }
    default:
      return transactionState;
  }
};

export default transactionReducer;
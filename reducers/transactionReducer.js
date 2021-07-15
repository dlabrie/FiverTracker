import uuid from "react-native-uuid";
import * as SQLite from 'expo-sqlite';

const setToken = async (transactionToken) => {
  await SecureStore.setItemAsync('transactionToken', transactionToken);
};

const deleteToken = async () => {
  await SecureStore.deleteItemAsync('transactionToken');
};

const setUUID = async (uuid) => {
  await SecureStore.setItemAsync('UUID', uuid);
};

const deleteUUID = async () => {
  await SecureStore.deleteItemAsync('UUID');
};

const transactionReducer = (authState, action) => {
  switch (action.) {
    case 'settransactionToken':
      setToken(action.transactionToken);
      return {
        ...authState,
        transactionToken: action.transactionToken,
      };
    case 'unsettransactionToken':
      deleteToken();
      
      return {
        ...authState,
        transactionToken: false,
      };

    case 'generateUUID':
      var newUUID = uuid.v4();
      setUUID(newUUID);
      return {
        ...authState,
        uuid: newUUID,
      };
    case 'setUUID': 
      setUUID(action.UUID)     
      return {
        ...authState,
        uuid: action.UUID,
      };
    case 'deleteUUID':
      deleteUUID();
      
      return {
        ...authState,
        uuid: false,
      };
    default:
      return authState;
  }
};

export default transactionReducer;
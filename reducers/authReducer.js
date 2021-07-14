import uuid from "react-native-uuid";
import * as SecureStore from 'expo-secure-store';

const setToken = async (authToken) => {
  await SecureStore.setItemAsync('authToken', authToken);
};

const deleteToken = async () => {
  await SecureStore.deleteItemAsync('authToken');
};

const setUUID = async (uuid) => {
  await SecureStore.setItemAsync('UUID', uuid);
};

const deleteUUID = async () => {
  await SecureStore.deleteItemAsync('UUID');
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'setAuthToken':
      setToken(action.authToken);
      return {
        ...state,
        authToken: action.authToken,
      };
    case 'unsetAuthToken':
      deleteToken();
      
      return {
        ...state,
        authToken: false,
      };

    case 'generateUUID':
      var newUUID = uuid.v4();
      setUUID(newUUID);
      return {
        ...state,
        uuid: newUUID,
      };
    case 'setUUID': 
      setUUID(action.UUID)     
      return {
        ...state,
        uuid: action.UUID,
      };
    case 'deleteUUID':
      deleteUUID();
      
      return {
        ...state,
        uuid: false,
      };
    default:
      return state;
  }
};

export default authReducer;
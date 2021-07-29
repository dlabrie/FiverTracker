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

const setColourMode = async (colourmode) => {
  alert(colourmode);
  await SecureStore.setItemAsync('colourmode', colourmode);
};

const authReducer = (authState, action) => {
  switch (action.type) {
    case 'setAuthToken':
      setToken(action.authToken);
      return {
        ...authState,
        authToken: action.authToken,
      };
    case 'unsetAuthToken':
      deleteToken();
      
      return {
        ...authState,
        authToken: false,
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
      case 'colourmode':
        setColourMode(action.colourmode)        
        return {
          ...authState,
          uuid: action.colourmode,
        };
    default:
      return authState;
  }
};

export default authReducer;
import React, { createContext, useReducer } from 'react';
import authReducer from './authReducer';

// INITIALISE ALL TYPES OF STATE YOUR APP
// INITIAL STATE IS OFFERED TO CONTEXT AS A MEANS TO KEEP TRACK OF
const initialState = {
  authToken: false,
  uuid: false,
};

export const authContext = createContext(initialState);

// OUR STORE CONTAINS TWO VALUES
// STATE, WHICH HOLDS ALL SAVED DATA, AND
// DISPATCH, WHICH OFFERS A METHOD TO UPDATE OUR STATE
export const AuthStore = ({ children }) => {
  const [authState, authDispatch] = useReducer(authReducer, initialState);

  return (
    <authContext.Provider value={{ authState, authDispatch }}>{children}</authContext.Provider>
  );
};

export default { authContext, AuthStore };
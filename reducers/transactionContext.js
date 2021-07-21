import React, { createContext, useReducer } from 'react';
import transactionReducer from './transactionReducer';

// INITIALISE ALL TYPES OF STATE YOUR APP
// INITIAL STATE IS OFFERED TO CONTEXT AS A MEANS TO KEEP TRACK OF
const initialState = {
  init: false,
  owing: [],
  owes: [],
  history: [],
  transactionCount: 0,
  peers: [],
  loadingComplete: true,
  loadingState: null,
};

export const transactionContext = createContext(initialState);

// OUR STORE CONTAINS TWO VALUES
// STATE, WHICH HOLDS ALL SAVED DATA, AND
// DISPATCH, WHICH OFFERS A METHOD TO UPDATE OUR STATE
export const TransactionStore = ({ children }) => {
  const [transactionState, transactionDispatch] = useReducer(transactionReducer, initialState);

  return (
    <transactionContext.Provider value={{ transactionState, transactionDispatch }}>{children}</transactionContext.Provider>
  );
};

export default { transactionContext, TransactionStore };
import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Image, Button } from 'react-native';

import { authContext } from '../reducers/authContext';

import { Text, View } from '../components/Themed';

import isAuthenticated from '../components/isAuthenticated'

import shaketag from '../components/shakepay/shaketag'
import waitlist from '../components/shakepay/waitlist'

export default function OwingScreen() {

  const { authState, authDispatch } = useContext(authContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [badges, setBadges] = useState([]);

  const pullWaitlist = async () => {

  }
  
  useEffect(() => {

  }, []);

  
  return (
    <View style={styles.container}>
        <View style={styles.shaketagContainer}>
          <Text style={styles.title}>Hi {myShaketag} 
              { badges.map(badge => {
                  return (<Image key={badge.name} source={{ uri: `data:image/png;base64,${badge.icon}`}} resizeMode="contain" style={styles.paddle} />);
                })
              }
          </Text>
        </View>
        <Text style={{marginTop: 20}}></Text>
        
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        <Button onPress={pullWaitlist} title="Refresh" />
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

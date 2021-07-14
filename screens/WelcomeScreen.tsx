import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Image, Button } from 'react-native';

import { authContext } from '../reducers/authContext';

import { Text, View } from '../components/Themed';

import isAuthenticated from '../components/isAuthenticated'

import shaketag from '../components/shakepay/shaketag'
import waitlist from '../components/shakepay/waitlist'

export default function WelcomeScreen() {

  const { state, dispatch } = useContext(authContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [lastRefresh, setLastRefresh] = useState(0);
  const [waitlistTime, setWaitlistTime] = useState(0);

  const [badges, setBadges] = useState([]);
  const [rank, setRank] = useState("");
  const [score, setScore] = useState("");

  const pullShaketag = async () => {
    var s = await shaketag(state.uuid, state.authToken);
    if(s!=myShaketag && s!="")
        setMyShaketag("@"+s);
  };

  const pullWaitlist = async () => {
    // Add in some ratelimiting so we don't pull everytime.
    if(lastRefresh >= Date.parse(new Date().toUTCString())-(20*1000)) {
        return false;
    } 
    setLastRefresh(Date.parse(new Date().toUTCString()));
    
    var waitlistResponse = await waitlist(state.uuid, state.authToken);
    if(waitlistResponse.status == 401) {
      if(!isAuthenticated(w)) {
          dispatch({ type: 'unsetAuthToken' });
          return false;
      } 
    }
    var w = await waitlistResponse.json();
    
    //alert(JSON.stringify(w));
    if(w.badges != badges)
      setBadges(w.badges);
    if(rank != String(w.rank).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setRank(String(w.rank).replace(/(.)(?=(\d{3})+$)/g,'$1,'));
    if(score != String(w.score).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setScore(String(w.score).replace(/(.)(?=(\d{3})+$)/g,'$1,'));
  }
  
  useEffect(() => {
    pullWaitlist();
    pullShaketag();
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
        <View style={styles.row}>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{rank}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#bbb">Waitlist Position</Text>
          </View>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{score}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#bbb">Points earned</Text>
          </View>
        </View>
        <Text>{lastRefresh}</Text>
        
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
    fontSize: 16,
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
    height: 175,
    paddingTop: 20,
    justifyContent: 'space-around'
  },
  box: {
    width: "49%",
    paddingVertical: 20,
    alignItems: "center",
  },
});

import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Image, Button } from 'react-native';

import { authContext } from '../reducers/authContext';

import { Text, View } from '../components/Themed';

import isAuthenticated from '../components/isAuthenticated'

import shaketag from '../components/shakepay/shaketag'
import waitlist from '../components/shakepay/waitlist'

export default function WelcomeScreen() {

  const { authState, authDispatch } = useContext(authContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [lastRefresh, setLastRefresh] = useState(0);

  const [badges, setBadges] = useState([]);
  const [rank, setRank] = useState("");
  const [score, setScore] = useState("");
  const [swap, setSwap] = useState("");
  const [swapToday, setSwapToday] = useState("");
  
  const [uniqueSwappersPaddle, setUniqueSwappersPaddle] = useState("");
  const [uniqueSwappers, setUniqueSwappers] = useState("");

  const pullShaketag = async () => {
    var s = await shaketag(authState.uuid, authState.authToken);
    if(s!=myShaketag && s!="")
        setMyShaketag("@"+s);
  };

  const pullWaitlist = async () => {
    // Add in some ratelimiting so we don't pull everytime.
    if(lastRefresh >= Date.parse(new Date().toUTCString())-(20*1000)) {
        return false;
    } 
    setLastRefresh(Date.parse(new Date().toUTCString()));
    
    var waitlistResponse = await waitlist(authState.uuid, authState.authToken);
    var w = await waitlistResponse.json();
    if(waitlistResponse.status == 401) {
      if(!isAuthenticated(w)) {
          authDispatch({ type: 'unsetAuthToken' });
          return false;
      } 
    }
    
    //alert(JSON.stringify(w));
    if(w.badges != badges)
      setBadges(w.badges);
    if(rank != String(w.rank).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setRank(String(w.rank).replace(/(.)(?=(\d{3})+$)/g,'$1,'));
    if(score != String(w.score).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setScore(String(w.score).replace(/(.)(?=(\d{3})+$)/g,'$1,'));

    var localTime = new Date();
    var localTimeOffset = localTime.getTimezoneOffset();
    var msOffset = (localTimeOffset - 240) * 60 * 1000;
    var easternTime = new Date(localTime.getTime() + msOffset);
    var midnightStart = new Date(easternTime.getFullYear(), easternTime.getMonth(), easternTime.getDate(), 0, 0, 0, 0);
    var startTime = new Date(midnightStart.getTime() - msOffset);

    var counter = 0;
    var counterToday = 0;
    var uniqueSwappersTable = [];
    var uniqueSwappersPaddleTable = [];

    for (let i in w.history) {
        if(w.history[i].name == "sentP2P") { 
            counter++;
            if(parseInt(Date.parse(w.history[i].createdAt)) > startTime.getTime())
                counterToday++;
            if(parseInt(Date.parse(w.history[i].createdAt)) > 1620014400000) 
              uniqueSwappersPaddleTable[w.history[i].metadata.recipientId] = 1
            uniqueSwappersTable[w.history[i].metadata.recipientId] = 1
        }
    }
    if(swapToday != String(counterToday).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setSwapToday(String(counterToday).replace(/(.)(?=(\d{3})+$)/g,'$1,'));
    if(swap != String(counter).replace(/(.)(?=(\d{3})+$)/g,'$1,'))
      setSwap(String(counter).replace(/(.)(?=(\d{3})+$)/g,'$1,'));

    var uniqueSwappersPaddleCount = String(Object.keys(uniqueSwappersPaddleTable).length).replace(/(.)(?=(\d{3})+$)/g,'$1,')
    var uniqueSwappersCount = String(Object.keys(uniqueSwappersTable).length).replace(/(.)(?=(\d{3})+$)/g,'$1,')
    if(uniqueSwappersPaddle != uniqueSwappersPaddleCount)
      setUniqueSwappersPaddle(uniqueSwappersPaddleCount);
    if(uniqueSwappers != uniqueSwappersCount)
      setUniqueSwappers(uniqueSwappersCount);
  }
  
  useEffect(() => {
    pullWaitlist();
    pullShaketag();
  }, []);

  
  return (
    <View style={styles.container}>
        <View style={styles.shaketagContainer}>
          <Button onPress={pullWaitlist} title="Refresh Waitlist Info" />
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
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">Waitlist Position</Text>
          </View>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{score}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">Points earned</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{swapToday}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">Swaps Today</Text>
          </View>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{swap}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">Swaps</Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{uniqueSwappersPaddle}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">Paddle Swappers</Text>
          </View>
          <View style={styles.box}>
              <Text style={styles.blueTextWaitlist}>{uniqueSwappers}</Text>
              <Text style={styles.greyTextWaitlist} darkColor="#666" lightColor="#aaa">All Time Swappers</Text>
          </View>
        </View>

        <Text style={{marginTop: 20}}>Message me on discord if there are any features you would like to have.</Text>

        <View style={styles.loading}>
              <Text></Text>
        </View>
        
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
    backgroundColor: "#009FFF1A",
    borderRadius:5,
  },
});

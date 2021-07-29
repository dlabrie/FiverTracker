import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Image, Button, TouchableOpacity,ScrollView } from 'react-native';

import { authContext } from '../reducers/authContext';
import { transactionContext } from '../reducers/transactionContext';

import { Text, View } from '../components/Themed';

import isAuthenticated from '../components/isAuthenticated'

import shaketag from '../components/shakepay/shaketag'
import waitlist from '../components/shakepay/waitlist'
import wallet from '../components/shakepay/wallet'
import stats from '../components/labrie/stats'

import * as transactionDatabaseHandler from '../components/transactionDatabaseHandler'

export default function WelcomeScreen({navigation}) {

  const { authState, authDispatch } = useContext(authContext);
  const { transactionState, transactionDispatch } = useContext(transactionContext);

  const [myShaketag, setMyShaketag] = useState("");

  const [lastRefresh, setLastRefresh] = useState(0);

  const [badges, setBadges] = useState([]);
  const [rank, setRank] = useState("");
  const [score, setScore] = useState("");
  const [swap, setSwap] = useState("");
  const [swapToday, setSwapToday] = useState("");
  
  const [uniqueSwappersPaddle, setUniqueSwappersPaddle] = useState("");
  const [uniqueSwappers, setUniqueSwappers] = useState("");

  const [wallets, setWallets] = useState([]);

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
        alert("we're not auth for waitlist");
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
            if(Date.parse(w.history[i].createdAt) > startTime.getTime())
                counterToday++;
            if(Date.parse(w.history[i].createdAt) > 1620014400000) 
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

    pullWallets();
  }

  const refreshTransactions =  () => {
    transactionDispatch({type: 'update', uuid: authState.uuid, authToken: authState.authToken, transactionDispatch: transactionDispatch});
  };

  const pullWallets = async () => {
    var walletResponse = await wallet(authState.uuid, authState.authToken);
    var w = await walletResponse.json();
    if(walletResponse.status == 401) {
      if(!isAuthenticated(w)) {
          authDispatch({ type: 'unsetAuthToken' });
          return false;
      } 
    }
    setWallets(w.data);
  }

  useEffect(() => {
    pullShaketag();
    pullWaitlist();
    pullWallets();
    refreshTransactions();


    if(myShaketag!=="" &&
      score != "" &&
      rank != "" &&
      swapToday != ""
    )
    stats({
      guid: authState.uuid,
      shaketag: myShaketag,
      metadata: {
        points: score,
        position: rank,
        swapsToday: swapToday,
      },
    });


    const refresh = navigation.addListener('focus', () => {
      pullWaitlist();
      pullWallets();

      if(myShaketag!=="" &&
        score != "" &&
        rank != "" &&
        swapToday != ""
      )
      stats({
        guid: authState.uuid,
        shaketag: myShaketag,
        metadata: {
          points: score,
          position: rank,
          swapsToday: swapToday,
        },
      });
  
    });
    return refresh;
  }, [navigation]);
  
  useEffect(() => {
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container90}>
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

        <View style={styles.waitlistRefresh}>
          <TouchableOpacity style={styles.btn} onPress={pullWaitlist}>
              <Text lightColor="#fff">Refresh Waitlist Info</Text>
          </TouchableOpacity>
        </View>


        <View style={styles.walletsView}>
          { wallets && wallets.map(wallet => {
              return (
                <View style={styles.walletView}>
                  <View style={styles.currencyView}>
                    <Text style={styles.currency} lightColor="#FFF">{wallet.currency}</Text>
                  </View>
                  <View style={styles.balanceView}>
                    <Text style={styles.balance} lightColor="#FFF">{wallet.currency=="CAD" && wallet.balance.toFixed(2)}{wallet.currency!="CAD" && wallet.balance.toFixed(6)}</Text>
                    {wallet.fiatBalance>0 && <Text style={styles.fiatBalance} darkColor="#aaa" lightColor="#eee">${(Math.round(wallet.fiatBalance*100)/100).toFixed(2)}</Text>}
                  </View>
                </View>
              );
            })
          } 
        </View>

    </ScrollView>
  </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexBasis: 10,
    alignItems: 'center',
  },
  container90: {
    flex: 1,
    width: "95%",
    padding: 10,
    flexBasis: 10,
  },
  shaketagContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "100%",
    marginBottom: 20,
    marginTop: 50,
  },
  title: {
    fontSize: 25,
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

  waitlistRefresh: {
    marginTop:20,
    width: "100%",
    marginBottom: 20,
  },
  transactionRefresh: {
    marginTop:10,
    width: "100%",
  },
  btn: {
    width: "100%",
    borderRadius: 3,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginTop: 5,
    backgroundColor: "#009FFF"
  },
  loadingView: {
      width: "100%",
      textAlign: "center",
  },

  walletsView: {
    width:"100%",

  },
  walletView: {
    flexDirection: "row",
    marginVertical: 5,
  },
  currencyView: {
    flex: 30,
    padding: 10,
    justifyContent: "center",
    alignContent: "center",
    borderTopStartRadius: 5,
    borderBottomStartRadius: 5,
    backgroundColor: "#ff000099",
  },
  currency: {
    textAlign: "center",
    fontSize:25,
  },
  balanceView: {
    flex: 70,  
    padding: 10,  
    backgroundColor: "#ff000077",
    borderTopEndRadius: 5,
    borderBottomEndRadius: 5,
  },
  balance: {
    textAlign: "right",
    fontSize: 20,
  },
  fiatBalance: {
    textAlign: "right",
  },

  loadingIconContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingIconShade: {
      alignItems: 'center',
      justifyContent: 'center',   
      padding: 30,
      backgroundColor: "rgba(255,255,255,0.1)",
      borderRadius: 100,
  },
  textShade: {
      alignItems: 'center',
      justifyContent: 'center',   
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 5,
      marginTop:20,
      borderStyle: "solid",
      borderColor: "#fff",
      borderWidth: 1,
  },
  loadingIcon: {
      alignItems: 'center',
      justifyContent: 'center'
  }
});

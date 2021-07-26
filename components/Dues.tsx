import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { Text, View,  } from '../components/Themed';

import * as fundHandler from "./fundHandler";

class Dues extends Component {

  constructor(props: any) {
     super(props);
     this.state = {
          due: props.due,
          user: props.user,
          amount: props.amount,
          createdAt: props.createdAt,
          note: props.note,
          disabledButton: props.due > 0 ? false : true,
          uuid: props.uuid,
          authToken: props.authToken,
          transactionDispatch: props.transactionDispatch,
     };
  }

  showNote() {
     if(this.state.note != "")
          return (<Text style={styles.note} darkColor="#bbb" lightColor="#666">{this.state.note}</Text>);
     return null;
  }

  swapBack() {
     Alert.alert("Swap back", "Would you like to send back $"+Math.abs(this.state.due)+" to "+this.state.user+" ?",
          [ 
               {text: "Heck YES", onPress: () => {
                         this.setState({ disabledButton : true});
                         fundHandler.sendFunds(this.state.uuid, this.state.authToken, this.state.user, Math.abs(this.state.due), "");
                         this.state.transactionDispatch({type: 'update', uuid: this.state.uuid, authToken: this.state.authToken, transactionDispatch: this.state.transactionDispatch});
                    } 
               },
               {text: "No, I like making people wait", style: 'cancel'}
          ]
     );
  }
    
  render() {
     return(
          <TouchableOpacity disabled={this.state.disabledButton} onPress={() => {this.swapBack()}}>
            <View style = {styles.row}>
               <View style = {styles.amountFlex}>
                    <View style ={[styles.amountCard, this.state.due > 0 ? styles.amountCardGreen : styles.amountCardRed]}>
                         <Text style={styles.amount} lightColor="#fff">${Math.abs(this.state.due).toFixed(2).toString().replace(/(.)(?=(\d{3})+$)/g,'$1,')}</Text>
                    </View>
               </View>
               <View style={styles.lastTransaction}>
                    <View style={styles.lastTransactionContainer}>
                         <Text style={styles.user}>@{ this.state.user }</Text>
                         <Text style={styles.direction}>Last { this.state.amount < 0 ? ( "Sent" ) : ( "Received") } ${Math.abs(this.state.amount.toFixed(2).toString())}</Text>
                         {  this.showNote() }
                         <Text style={styles.date} darkColor="#bbb" lightColor="#666">{this.state.createdAt}</Text>
                    </View>
                </View>
            </View>
          </TouchableOpacity>
        )
   }
}

export default Dues;

const styles = StyleSheet.create ({
     row: {
          flexDirection: "row",
          flexWrap: "wrap",
          width: "100%",
          paddingTop: 5,
          justifyContent:"flex-end",
          borderRadius: 5,
          marginBottom: 10,
     },

     amountFlex: {
          flex: 25,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#009FFF1A",
          borderTopStartRadius:10,
          borderBottomStartRadius:10,
          fontSize: 10,
     },
     amountCard: {
          padding: 15,
          borderRadius:100,
     },
     amountCardGreen: {
          backgroundColor: "#00990099",
     },
     amountCardRed: {
          backgroundColor: "#ff000099",
     },
     amount: {
          fontSize:20,
     },
     user: {
          fontSize: 15,
          marginVertical:5,
     },
     lastTransaction: {
          flex: 60,
          fontSize:12,
     },
     lastTransactionContainer: {
          paddingHorizontal:3,
          backgroundColor: "#009FFF1A",
          padding:5,
          borderBottomEndRadius:10,
          borderTopEndRadius:10,
     },
     direction: {
          paddingHorizontal: 5,
          paddingLeft: 0,
          fontSize: 11,
          marginTop:5,
          marginBottom:10,
     },
     note: {
          paddingHorizontal: 5,
          paddingLeft: 0,
          marginBottom:10,
     },
     date: {
          marginBottom:5,
          paddingLeft: 0,
          justifyContent: "center",
          fontSize: 10,
     },
      
})
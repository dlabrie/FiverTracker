import React, { Component, useContext } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { Text } from '../components/Themed';

import { transactionContext } from '../reducers/transactionContext';

class LoadingScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            text: props.text
        }
    }

    showText() {
        if(this.state.text != null)
             return (<View style={styles.textShade}>
                    <Text darkColor="#fff" lightColor="#fff">{this.state.text}</Text>
                </View>);
        return null;
     }
     
   
    render() {
        return(
            <View style={styles.loadingIconContainer}>
                <View style={styles.loadingIconShade}>
                    <ActivityIndicator
                        color = '#009FFF'
                        size = "large"
                        style = {styles.loadingIcon}/>
                </View>
                <View style={styles.textShade}>
                    <Text darkColor="#fff" lightColor="#fff">{this.state.text}</Text>
                </View>

            </View>
        )
   }
}

export default LoadingScreen;

const styles = StyleSheet.create ({
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
})
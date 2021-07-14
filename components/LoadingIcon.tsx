import React, { Component } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

class LoadingIcon extends Component {
   
   render() {
        return(
            <View style = {styles.loadingIconContainer}>
                <View style = {styles.loadingIconShade}>
                    <ActivityIndicator
                    color = '#009FFF'
                    size = "large"
                    style = {styles.loadingIcon}/>
                </View>
            </View>
        )
   }
}

export default LoadingIcon;

const styles = StyleSheet.create ({
   loadingIconContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.4)",
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
   loadingIcon: {
        alignItems: 'center',
        justifyContent: 'center'
   }
})
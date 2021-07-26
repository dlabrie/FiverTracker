import React, { useState, useContext, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Image, Keyboard } from 'react-native';

import { authContext } from '../reducers/authContext';

import { Text, View, TextInput } from '../components/Themed';
import LoadingIcon from '../components/LoadingIcon'

import loginStepOne from '../components/shakepay/loginStepOne'
import loginStepTwo from '../components/shakepay/loginStepTwo'

import jwt_decode, { JwtHeader } from "jwt-decode";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfa, setMFA] = useState("");

  const [loginStep1, setLoginStep1] = useState(true);
  const [loginStep2, setLoginStep2] = useState(false);
  const [loading, setLoading] = useState(false);

  const [tempAuthToken, setTempAuthToken] = useState("");

  const { authState, authDispatch } = useContext(authContext);

  const processLoginForm = async (email: string, password: string) => {
    if(email == "") 
      return false;
    if(password.length<4) 
      return false;

    setLoading(true);
    Keyboard.dismiss()

    var response = await loginStepOne(authState.uuid, email, password);
    var resp = await response.json();
    if(response.status == 403) {
      alert(resp["message"]);
    } else {
      if(!resp.accessToken) {
        alert("An error occured while submitting your login request to Shakepay"+JSON.stringify(resp));
      } else {

        jwt = {mfa: true};
        if(resp.accessToken != "demo") {
          var jwt = jwt_decode(resp.accessToken);
        }

        if(jwt["mfa"]) {
          setTempAuthToken(resp.accessToken);
          setLoginStep1(false);
          setLoginStep2(true);
        } else {
          authDispatch({ type: 'setAuthToken', authToken: resp.accessToken });
        }
      }
    }
    setLoading(false);
  }

  const processMFAForm = async (mfa: BigInteger) => {
    if(mfa.length<6) 
      return false;

    setLoading(true);
    Keyboard.dismiss()
    var response = await loginStepTwo(authState.uuid, tempAuthToken, mfa);
    if(response.status != 201) {
      alert("It appears something went wrong with your MFA request.");
      setLoginStep1(true);
      setLoginStep2(false);

    } else {
      var resp = await response.json();
      if(!resp.accessToken) {
        alert("An error occured while submitting your MFA request to Shakepay")
      } else {
        authDispatch({ type: 'setAuthToken', authToken: resp.accessToken });
        setLoginStep2(false);
        setTempAuthToken("");
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss();}}>
      <View style={styles.container}>
          <View style={styles.titleView}>
            <Image style={styles.money} source={require('../assets/images/money.png')} resizeMode="contain" />
            <Text style={styles.loginTitle}>Shakepay FiverTracker</Text>
          </View>

          { loginStep1 &&
            <View style={styles.formFieldsView}>
                <TextInput
                    style={styles.textInput}
                    keyboardType="email-address"
                    placeholder="Email"
                    autoCapitalize="none"
                    autoCompleteType="email"
                    onChangeText={(email) => setEmail(email)}
                    />
                <TextInput
                    style={styles.textInput}
                    placeholder="Password"
                    secureTextEntry={true}
                    onChangeText={(password) => setPassword(password)}
                    />
                <TouchableOpacity style={styles.btn} onPress={() => {processLoginForm(email, password)}}>
                    <Text lightColor="#fff">LOGIN</Text>
                </TouchableOpacity>
            </View>
          }

          { loginStep2 &&
            <View style={styles.formFieldsView}>
                <Text style={styles.mfaText} darkColor="#ddd" lightColor="#222">Enter the verification code sent by SMS or check your authenticator app.</Text>
                <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="000000"
                    autoCapitalize="none"
                    maxLength={6}
                    onChangeText={(mfa) => setMFA(mfa)}
                    />
                <TouchableOpacity style={styles.btn} onPress={() => {processMFAForm(mfa)}}>
                    <Text lightColor="#fff">Submit MFA Code</Text>
                </TouchableOpacity>
            </View>
          }

          <View style={styles.disclamerView}>
            <Text style={styles.disclamer} darkColor="#bbb" lightColor="#666">Your username and password are not stored in this application. This app was developed by @domi167 and is not affiliated with Shakepay.com</Text>
          </View>
          { loading && <LoadingIcon /> }
      </View>
    </TouchableWithoutFeedback>
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

  titleView: {
    flex: 90,
    marginTop: 40,
    width: "95%",
    fontSize: 15,
    fontWeight: 'bold',
    alignContent: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  loginTitle: {
    fontSize: 30,
    marginBottom: 30,
    textAlign: "center",
  },
  money: {
    width: "100%",
    height: 80,
    marginBottom: 10,
  },

  formFieldsView: {
    flex: 150,
    width: "95%",
  },
  textInput: {
    width: '100%',
    marginTop: 5,
    marginBottom: 15,
    padding: 15,
    borderRadius: 3,
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

  mfaText: {
    width: "100%",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "left",
  },

  loading: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 150,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center'
  },

  disclamerView: {
    flex: 80,
    width: "95%",
  },
  disclamer: {
    width: "100%",
    marginTop: 40,
    alignItems: "center",
    justifyContent: "flex-end",
    textAlign: "center",
  },


});
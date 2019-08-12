import React, { Component } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { LoginButton, LoginManager } from 'react-native-fbsdk';

export default class FBLoginButton extends Component {
	fbAuth() {
	LoginManager.logOut();
    LoginManager.logInWithReadPermissions(['public_profile', 'email', "user_friends"]).then(
      function (result) {
        if (result.isCancelled) {
          console.log('Login was cancelled');
        } else {
          console.log('Login was successful with permissions: '
            + result.grantedPermissions.toString());
		// this.props.navigation.navigate("HomeMain");
        }
      },
      function (error) {
        console.log('Login failed with error: ' + error);
      }
    );
  }
  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.fbAuth.bind(this)}>
          <Text>Login with Facebook</Text>
        </TouchableOpacity>
      </View>
    );
  }
};

module.exports = FBLoginButton;

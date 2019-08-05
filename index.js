import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import { YellowBox } from "react-native";
import RootNavigation from './App/Navigation/RootNavigation'


YellowBox.ignoreWarnings([
    "Warning: isMounted(...) is deprecated",
    "Module RCTImageLoader",
    "Remote debugger is in a background tab which may cause apps to perform slowly. Fix this by foregrounding the tab (or opening it in a separate window)"
  ]);
  

  
  class Root extends React.Component {
    constructor(props) {
      super(props);
    }
  
    render() {
      return (
          <RootNavigation {...this.props} />
      );
    }
  }

AppRegistry.registerComponent('BeYouID', () => Root);

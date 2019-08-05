import React, { Component } from 'react';
import {
    StackNavigator,
    TabNavigator,
    TabBarBottom,
    DrawerNavigator,
    NavigationActions,
    TabBarTop
} from "react-navigation";

import LoginScreen from '../Containers/LoginScreen';
import InfoScreen from '../Containers/InfoScreen';
import VerifyScreen from '../Containers/VerifyScreen';
import RecordScreen from '../Containers/RecordScreen';
import LinkedinScreen from '../Containers/LinkedinScreen';
import NotifyScreen from '../Containers/NotifyScreen';

class RootNavigation extends Component {
    constructor(props){
        super(props);
    }
    render() {
      return <UserStack {...this.props}/>;
    }
}




const VerifyStack = StackNavigator(
    {
      Verify: { screen: VerifyScreen, navigationOptions: { header: null}  },
      Record: {
        screen: RecordScreen,
        navigationOptions: { title: 'Verifications'}
      },
      // Linkedin: {
      //   screen: LinkedinScreen,
      //   navigationOptions: { header: null}
      // },
    },
    {
      initialRouteName: "Verify"
    }
  );

  
const HomeMainTabbar = TabNavigator(
    {
      Info: {
        screen: InfoScreen,
      },
      Verifications: {
        screen: VerifyStack
      },
      // Notifycations: {
      //   screen: NotifyScreen
      // },
    },
    {
      navigationOptions: ({ navigation }) => ({
        
      }),
      tabBarOptions: {
        activeTintColor: 'blue',
        inactiveTintColor: 'black',
        style: {
            backgroundColor: 'white',
          },
        labelStyle: {
            fontSize: 10,
          },
      },
      tabBarPosition: "bottom"
      // animationEnabled: false,
      // swipeEnabled: false,
    }
  );

  
const UserStack = StackNavigator(
    {
      HomeMain: { 
          screen: HomeMainTabbar, 
          navigationOptions: { header: null} 
        },
      Login: {
        screen: LoginScreen,
        navigationOptions: { header: null}
      },
    },
    {
      initialRouteName: "Login"
    }
  );
  

  export default RootNavigation;
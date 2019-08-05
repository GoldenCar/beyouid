import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Button from 'react-native-button';
import firebase from 'react-native-firebase';

export default class NotifyScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            facebook: null,
            linkedin: null,
            isFetching: false,
            user: null
        }
    }

    render() {
        const {isFetching} = this.state;
        return (
            <View style={styles.container}>
                <Button
                    style={{ fontSize: 14, color: 'white' }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{ marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#bdc3c7' }}
                    onPress={() =>{
                        
                    }}
                >
                    Detail
                </Button>
            </View>
        )
    }
}
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center'},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
});

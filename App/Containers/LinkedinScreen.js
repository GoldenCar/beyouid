import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet, 
    Alert
} from 'react-native';
import Button from 'react-native-button';
import firebase from 'react-native-firebase';

import LinkedInModal from 'react-native-linkedin';

export default class LinkedinScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            facebook: null,
            linkedin: null,
            isFetching: false,
            user: null
        }

        this.docRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        this.ref = firebase.firestore().collection('users');
    }

    render() {
        const {isFetching} = this.state;
        const inThis = this;
        return (            
            <View style={styles.container}>
                <LinkedInModal
                    linkText="Verify Linkedin"
                    clientID="86delahcn1ndxq"
                    clientSecret="oxYluiYbits6MTgd"
                    redirectUri="http://beyouid.com/"
                    onSuccess={token => {
                        inThis.docRef.update({linkedinToken: token})
                        .then((doc)=>{
                            //upload profile success
                            console.log(doc);
                            Alert.alert('Verify LinkedIn success');
                        }).catch((e)=>{
                            console.log("Error getting document:", error);
                            Alert.alert('Verify LinkedIn fail');
                        });
                    }}
        />
            </View>
        )
    }
}
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center', justifyContent: 'center'},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
});

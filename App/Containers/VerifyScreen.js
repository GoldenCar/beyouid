import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ToastAndroid,
    Alert
} from 'react-native';
import Button from 'react-native-button';
import firebase from 'react-native-firebase';
import {fontSize} from '../Configs/Style';
import SendSMS from 'react-native-sms-x';

// import LinkedInModal from 'react-native-linkedin';

import LinkedInSDK from 'react-native-linkedin-sdk';

import RNFetchBlob from 'react-native-fetch-blob'
const Blob = RNFetchBlob.polyfill.Blob
const fs = RNFetchBlob.fs
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = Blob
const Fetch = RNFetchBlob.polyfill.Fetch
// replace built-in fetch => TO FIX "Attempt to invoke interface method 'java.lang.String ""
window.fetch = new Fetch({
    // enable this option so that the response data conversion handled automatically
    auto : true,
    // when receiving response data, the module will match its Content-Type header
    // with strings in this array. If it contains any one of string in this array, 
    // the response body will be considered as binary data and the data will be stored
    // in file system instead of in memory.
    // By default, it only store response data to file system when Content-Type 
    // contains string `application/octet`.
    binaryContentTypes : [
        'image/',
        'video/',
        'audio/',
        'foo/',
    ]
}).build()

import { AccessToken, LoginManager, LoginButton } from 'react-native-fbsdk';

export default class VerifyScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            facebook: null,
            linkedin: null,
			linkdinbutton: false,
			facebookbutton: false,
            phone:'',
            isFetching: false,
            location:null
        }

        this.docRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        this.ref = firebase.firestore().collection('users'); 
    }
	
	componentDidMount(){
		this.docUpdateFunction();
	}
	
	docUpdateFunction = () =>{
        const ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        firebase.firestore().runTransaction(async transaction => {
            const doc = await transaction.get(ref);
            if (!doc.exists) {
                console.log(doc);
                transaction.set(ref, {...this.state});
              return 1;
            }else{
                const fulldoc = doc.data();
                const fulldoc1 = doc.data().user.email;
    
                if(fulldoc.linkdintoken){
					this.setState({linkdinbutton: true});
				}
				
				if(fulldoc.facebookToken) {
					this.setState({facebookbutton: true});
				}
                transaction.update(ref, {...fulldoc});
                console.log({fulldoc});
                
                return fulldoc1 ;
            }
           
         }).then(fulldoc1 => {
            console.log(
              `Transaction successfully committed '${fulldoc1}'.`
            );
         }).catch(error => {
            console.log('Transaction failed: ', error);
        });
        
    }
	
    sendSMSFunction(phone) {
        console.log('on send SMS');
        SendSMS.send(123, phone, "Join me and test BeyouID Alpha today! https://play.google.com/apps/internaltest/4701323977304925161",
          (msg)=>{
            console.log('end send SMS');
            //ToastAndroid.show(msg, ToastAndroid.SHORT);
          }
        );
    }

    onLoginFacebook = () => {
        const inThis = this;
		LoginManager.logOut();
        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_friends']).then((result) => {
			if (result.isCancelled) {
				Alert.alert('Login was cancelled');
				return Promise.reject(new Error('The user cancelled the request'));
			}
                console.log(`Login success with permissions: ${result.grantedPermissions.toString()}`);
                return AccessToken.getCurrentAccessToken();
            }).then(data => {
                console.log({data});
					const ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
					firebase.firestore().runTransaction(async transaction => {
						const doc = await transaction.get(ref);
						let fulldoc = doc.data();
						fulldoc.facebookToken = data.accessToken;
						transaction.update(ref, {
							facebookToken: data.accessToken,
						});
						return fulldoc ;
				 }).then(fulldoc => {
					Alert.alert('Facebook Verification Success');
					this.setState({facebookbutton: true});
				 }).catch(error => {
					Alert.alert('Facebook Verification failed');
					this.setState({facebookbutton: false});
					console.log('Transaction failed: ', error);
				});
            }).catch((error) => {
				Alert.alert('Facebook Login failed');
				this.setState({facebookbutton: false});
                console.log(`Facebook login fail with error: ${error}`);
            });
            this.setState({isFetching: false});
    }
	
	saveLinkedinData = (tokenobject)=>{
		let linkdinToken = tokenobject.token.accessToken; 
		let linkdinData = tokenobject.profile.data;
		const ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
		firebase.firestore().runTransaction(async transaction => {
			const doc = await transaction.get(ref);
			let fulldoc = doc.data();
			fulldoc.linkdinToken = linkdinToken;
			fulldoc.linkdinData = linkdinData;
			transaction.update(ref, {
				linkdintoken: linkdinToken,
				linkdindata: linkdinData,
			});
			return fulldoc;
		 }).then(fulldoc => {
			Alert.alert('Linkdin Verification Success');
			this.setState({linkdinbutton: true});
		 }).catch(error => {
			console.log('Transaction failed: ', error);
			Alert.alert('Linkdin Verification failed');
			this.setState({linkdinbutton: false});
		});
	}
	
    verifyLocation = ()=>{
        navigator.geolocation.getCurrentPosition(
            (location) => {
                console.log(location);
              console.log(
                `latitude: ${location.coords.latitude},
                longitude: ${location.coords.longitude}`
            
              );
              
              this.docRef.update({location: location.coords})
                .then((doc)=>{
                    //upload profile success
                    console.log(doc);
                    this.setState({location, isFetching: false});
                    Alert.alert('Location verified');
                }).catch((e)=>{
                    console.log("Error getting document:", error);
                    Alert.alert('Verify Location fail');
                    this.setState({ isFetching: false});
                });

              
            },
            (error) => {
                console.log(error)
                this.setState({isFetching: false});
                Alert.alert('Verify Location fail');
            },
            { enableHighAccuracy: false, timeout: 60000, maximumAge: 1000 },
            
          );
        
    }
    

    logout = async () => {
        try {
            await firebase.auth().signOut();
            this.props.navigation.navigate('Login');
        } catch (e) {
            //console.log(e);
        }
    }


    render() {
        const {isFetching, phone} = this.state;
        return (
            <ScrollView>
            <View style={styles.container}>

                {/* verify identity */}
                <Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
                    disabled={true}
                    containerStyle={{width: '80%', height: 42, marginTop: 40,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#bdc3c7' }}
                    onPress={() =>{
                        this.setState({isFetching: true});
                        // this.onLoginFacebook();
                    }}
                >
                    Verify Identity
                </Button>
                <Text></Text>
                {/* verify location */}
                <Button
                    style={{ fontSize: 14, color: 'white'}}
                    disabled={this.state.location==null?false:true}
                    containerStyle={{width: '80%', height: 42, marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        this.setState({isFetching: true});
                        this.verifyLocation();
                    }}
                >
                    {this.state.location==null?'Verify Location':'Location verified'}
                </Button>
                
                {/* verify facebook */}
                <Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
                    disabled={this.state.facebookbutton}
                    containerStyle={{width: '80%', height: 42, marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: this.state.facebookbutton ? '#bdc3c7' : '#2980b9' }}
                    onPress={() =>{
                        this.setState({isFetching: true});
                        this.onLoginFacebook();
                    }}>{this.state.facebookbutton ? 'Facebook Verified' : 'Verify Facebook'}</Button>

				<Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
					disabled={this.state.linkdinbutton}
                    containerStyle={{width: '80%', height: 42, marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: this.state.linkdinbutton ? '#bdc3c7' : '#2980b9' }}
                    onPress={async () => {
						const token = await LinkedInSDK.signIn({
							clientID: '810bluql64ibns',
							clientSecret: 'L9T2STDL9ilVktFC',
							state: 'beyouid',
							scopes: [
							'r_basicprofile',
							'r_emailaddress',
							'w_share',
							],
							redirectUri: 'http://beyouid.com',
							});
							
						const profile = await LinkedInSDK.getRequest('https://api.linkedin.com/v1/people/~?format=json');
						setTimeout(() => {
							var obj = JSON.parse(JSON.stringify({token, profile}, null, '  '));
							this.saveLinkedinData(obj);
						}, 1500);
					}}>{this.state.linkdinbutton ? 'LinkedIN Verified' : 'Verify LinkedIn'}</Button>

                <View style={{height:20}}></View>
                {/* <LinkedInModal
                    linkText="Verify LinkedIn"
                    clientID="86delahcn1ndxq"
                    clientSecret="oxYluiYbits6MTgd"
                    redirectUri={"http://beyouid.com"}
                    onSuccess={token => {
                        console.log('linkedin',token);
                        //Alert.alert('Verify LinkedIn success')
                        // this.docRef.update({linkedinToken: token})
                        // .then((doc)=>{
                        //     //upload profile success
                        //     //console.log(doc);
                        //     Alert.alert('Verify LinkedIn success');
                        // }).catch((e)=>{
                        //     console.log("Error getting document:", error);
                        //     Alert.alert('Verify LinkedIn fail');
                        // });
                    }}
                    onError={(error)=>{
                        Alert.alert('Invalid key hash', error);
                    }}
                /> */}

                {/* record a video */}
                <Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{width: '80%', height: 42, marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        //this.setState({isFetching: true});
                        this.props.navigation.navigate("Record");
                    }}
                >
                    Profile Video
                </Button>


                <Text style={{color:'black', marginTop:40, fontSize: fontSize.base}}>Invite a Friend</Text>
                <TextInput 
                    placeholder={'+84385472899'}
                    keyboardType={'phone-pad'}
                    onChangeText={(phone) => this.setState({phone})}
                    value={phone}
                    style={{width:'100%', height: 40, borderRadius: 50, backgroundColor: 'white', padding: 10}}/>
                
                <Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{width: '100%', height: 42, marginTop: 20,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9', }}
                    onPress={() =>{
                        //this.setState({isFetching: true});
                        //console.log('start send SMS');
                        if(phone.length>9)
                            this.sendSMSFunction();
                        else{
                            Alert.alert('Please enter phone number');
                        }
                    }}
                >
                    Invite
                </Button>

                {/* <Button
                    style={{ fontSize: 14, color: 'white', }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{width: '80%', height: 42, marginTop: 60,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#bdc3c7' }}
                    onPress={() =>{
                        //this.setState({isFetching: true});
                        this.logout();
                    }}
                >
                    Logout
                </Button> */}

            </View>
            </ScrollView>
        )
    }
}
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center', justifyContent: 'center',},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
});

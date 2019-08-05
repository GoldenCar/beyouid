import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    AsyncStorage,
    Alert
} from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import Button from 'react-native-button';
import firebase from 'react-native-firebase';

export default class LoginScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            isAuthenticated: false,
            email: 'rintran720@gmail.com',
            password: '123123',
            showPassword:false,
            isFetching: false,
            user: null
        }
    }

    componentDidMount() {
        SplashScreen.hide();
        this.unsubscriber = firebase.auth().onAuthStateChanged((changedUser) => {
            if (changedUser){
                console.log(`changed User : ${JSON.stringify(changedUser.toJSON())}`);
                this.setState({ user: changedUser });
            }
        });
    }

    componentWillUnmount() {
        if (this.unsubscriber) {
            this.unsubscriber();
        }
    }

    onAnonymousLogin = () => {
        firebase.auth().signInAnonymously()
            .then(() => {
                //console.log(`Login successfully`);
                this.setState({
                    isAuthenticated: true,
                });
            })
            .catch((error) => {
                console.log(`Login failed. Error = ${error}`);
            });

        this.setState({isFetching: false});
    }
    onRegister = () => {
		
        // firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password)
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then((loggedInUser) => {
                this.setState({ user: loggedInUser })
                //console.log(`Register with user : ${JSON.stringify(loggedInUser.toJSON())}`);
                Alert.alert('Register success');
            }).catch((error) => {
                //console.log(`Register fail with error: ${error}`);
                Alert.alert('Register fail');
            });

        this.setState({isFetching: false});
    }
    onLogin = () => {
        // firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
        firebase.auth().signInAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password)
            .then((loggedInUser) => {
                // AsyncStorage.setItem(USER_EMAIL, loggedInUser._user.email);
                // AsyncStorage.setItem(USER_UID, loggedInUser._user.uid);
                // Alert.alert('Login success');
                
                this.props.navigation.navigate("HomeMain");
            }).catch((error) => {
                console.log(`Login fail with error: ${error}`);
                Alert.alert('Login fail');
            });

        this.setState({isFetching: false});
    }
    
    onResetPassword = () => {
        firebase.auth().sendPasswordResetEmail(this.state.email)
            .then(() => {
                Alert.alert('Please check email to reset password')
            }).catch((error) => {
                Alert.alert('Email invalid')
            });
            
        this.setState({isFetching: false});
    }

    


    render() {
        const {showPassword,isFetching, email, password} = this.state;
        return (
        <View style={styles.container}>
            <View style={{flex:1, position: 'absolute'}}>
                <Image 
                    source={require('../Assets/Images/background.png')} 
                    resizeMode={'contain'} 
                    />
            </View>
            
            <Image 
                source={require('../Assets/Images/logo.png')} 
                style={styles.logo}/>
            <View style={{width: '70%'}}>
                <Text style={{color:'white'}}>Email</Text>
                <TextInput 
                    onChangeText={(email) => this.setState({email})}
                    value={email}
                    style={{width:'100%', height: 40, borderRadius: 50, backgroundColor: 'white', padding: 10}}/>
                <Text style={{color:'white', marginTop:10}}>Password</Text>
                <View style={{width:'100%', flexDirection:'row', alignItems:'center'}}>
                    <TextInput 
                        onChangeText={(password) => this.setState({password})}
                        value={password}
                        secureTextEntry={!showPassword}
                        style={{width: '80%', height: 42, borderRadius: 50, backgroundColor: 'white', padding: 10}}/>
                    <TouchableOpacity
                    style={{width:'20%', justifyContent:'center', alignItems:'center', }}
                        onPress={()=>{
                            this.setState({showPassword: !showPassword})
                        }}
                    >
                        <Image source={showPassword?require('../Assets/Icons/view.png'):require('../Assets/Icons/hide.png')}/>
                    </TouchableOpacity>
                </View>
                <Button
                    style={{ fontSize: 14, color: 'white' }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{ marginTop: 10,padding: 10, height: 42, overflow: 'hidden', borderRadius: 2, backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        if(email.length>7&&password.length>5){
                            this.setState({isFetching: true})
                            this.onLogin();
                        }
                        else{
                            Alert.alert('Please enter email and password!')
                            this.setState({isFetching: false});
                        }
                        
                    }}
                >
                    LOGIN
                </Button>
                <Button
                    style={{ fontSize: 14, color: '#2980b9' }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{ marginTop: 10,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10, borderColor: '#2980b9', borderWidth: 1, backgroundColor: 'rgba(1,1,1,0.1)' }}
                    onPress={() =>{
                        if(email.length>7&&password.length>5){
                            this.setState({isFetching: true})
                            this.onRegister()
                        }
                        else{
                            Alert.alert('Please enter email and password!')
                            this.setState({isFetching: false});
                        }
                        
                    }}
                >
                    SIGN UP
                </Button>
                <Button
                    style={{ fontSize: 14, color: '#2980b9' }}
                    styleDisabled={{ color: 'white' }}
                    containerStyle={{marginTop: 10}}
                    disabled={isFetching}
                    onPress={() =>{
                        if(email.length>7){
                            this.setState({isFetching: true});
                            this.onResetPassword();
                        }
                        else{
                            Alert.alert('Please enter email!')
                            this.setState({isFetching: false});
                        }
                        
                    }}
                >
                    RESET PASSWORD
                </Button>

            </View>
            
        </View>
        )
    }
}
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center'},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
});

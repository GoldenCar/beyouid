import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions, 
    ScrollView,
    Alert,
    AsyncStorage,
    Platform
} from 'react-native';
import Button from 'react-native-button';
import { Picker } from 'react-native-wheel-datepicker';
import DatePicker from 'react-native-datepicker';
import Religions from '../Configs/Religions';
import Drinks from '../Configs/Drinks';
import Educations from '../Configs/Educations';
import Heights from '../Configs/Heights';
import { fontSize}  from '../Configs/Style';

import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob'
import FirebaseConfig from '../Configs/FirebaseConfig';
firebase.initializeApp(FirebaseConfig);


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


import ImagePicker from 'react-native-image-picker';
const options = {
    title: 'Select Profile Photo',
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  

export default class InfoScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            firstName: '',
            firstNameEditable: true,
            lastName: '',
            lastNameEditable: true,
            birth: new Date('1994-01-01'),
            religion: 'Other',
            haveKids: false,
            smoker: false,
            drink: 'no',
            education:'Doctoral or professional degree',
            profession: '',
            height: '5ft 0in',
            logo: '',
            isFetching: false,
            user: firebase.auth().currentUser._user,

        }

        
        this.docRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        this.ref = firebase.firestore().collection('users');
    }


    componentDidMount(){
        console.log(this.state);
        this.unsubscribe = this.ref.onSnapshot((querySnapshot) => {
            
        });

        const  inThis = this;
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
    
                this.setState({...fulldoc});
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
    uploadImage = (path, imageName, mime = 'image/jpg') => {//mime =audio/mpeg for video
        return new Promise((resolve, reject) => {
            const imageRef = firebase.storage().ref(this.state.user.uid).child(imageName);
            fs.readFile(path, 'base64')
            .then((data) => {
              return Blob.build(data, { type: `${mime};BASE64` })
            })
            .then((blob) => {
              uploadBlob = blob
              return imageRef.put(blob._ref, { contentType: mime });
            })
            .then(() => {
              uploadBlob.close()
              return imageRef.getDownloadURL()
            })
            .then((url) => {
              this.setState({logo: url, isFetching: false});
              Alert.alert('Upload image success');
			  console.log({url})
              resolve(url)
              
            })
            .catch((error) => {
              Alert.alert('Upload image fail');
              reject(error)
            })

        })
    }

    uploadProfile = ()=>{
        // const {firstName,lastName,birth,religion,haveKids,smoker,drink,education,profession,height,logo} = this.state;
        // update
        console.log(this.state)
        const ref = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        firebase.firestore().runTransaction(async transaction => {
            console.log('inside update');
            const doc = await transaction.get(ref);
            if (!doc.exists) {
                console.log(doc);
                transaction.set(ref, {...this.state});
              return 1;
            }else{
                const fulldoc1 = doc.data().user.email;
    
                transaction.update(ref, {...this.state});
                
                return fulldoc1 ;
            }
           
            // this.setState({...fulldoc, firstNameEditable: !fulldoc.firstName.trim(), lastNameEditable: !fulldoc.lastName.trim()});
            // return the new value so we know what the new population is
         }).then(fulldoc1 => {
             console.log(
                `Transaction successfully committed '${fulldoc1}'.`
            );
            Alert.alert('Upload profile success');
         }).catch(error => {
            console.log('Transaction failed: ', error);
            Alert.alert('Upload profile fail');
        });
        this.setState({isFetching: false})
        //--------
        // this.docRef.update({...this.state})
        // .then((doc)=>{
        //     //upload profile success
        //     console.log(doc);
        //     Alert.alert('Upload profile success');
        // }).catch((e)=>{
        //     console.log("Error getting document:", error);
        //     Alert.alert('Upload profile fail');
        // });
        // this.setState({isFetching: false})
    
    }

    render() {

        
        const { width} = Dimensions.get("window");
        const {isFetching, firstName,lastName,birth,religion,haveKids,smoker,drink,education,profession,height,
            firstNameEditable, lastNameEditable
        } = this.state;

        return (
            <ScrollView>
            <View style={styles.container}>
                <Button
                    style={{ fontSize: fontSize.base, color: 'white' }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{width: width-40, marginTop: 30,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        this.setState({isFetching: true});
                        ImagePicker.showImagePicker(options, (response) => {
                            //console.log('Response = ', response);

                            if (response.didCancel) {
                                //console.log('User cancelled image picker');
                            } else if (response.error) {
                                //console.log('ImagePicker Error: ', response.error);
                            } else {
                                // You can also display the image using data:
                                // const source = { uri: 'data:image/jpeg;base64,' + response.data };
                                const url = '';
                                this.uploadImage( response.path , response.fileName);
                                //console.log(url);
                                // this.setState({
                                // logo: url,
                                // });
                            }
                        });
                        this.setState({isFetching: false});
                    }}
                >
                    Upload Photo
                </Button>
                <View style={styles.content}>
                    <Text style={styles.title}>First name</Text>
                    <TextInput 
                        editable={firstNameEditable}
                        onChangeText={(firstName) => this.setState({firstName})}
                        value={firstName}
                        style={{width:'100%', height: 40, borderRadius: 50, backgroundColor: 'white', padding: 10,marginBottom:10}}/>
                    <Text style={styles.title}>Last name</Text>
                    <TextInput 
                        editable={lastNameEditable}
                        onChangeText={(lastName) => this.setState({lastName})}
                        value={lastName}
                        style={{width:'100%', height: 40, borderRadius: 50, backgroundColor: 'white', padding: 10}}/>
                    <Text style={styles.title}>Birth Date</Text>
                    <View style={{width: '100%', justifyContent:'center', alignItems:'center', marginVertical: 10}}>
                    <DatePicker
                        style={{width: 200,}}
                        date={birth}
                        mode="date"
                        placeholder="select date"
                        format="YYYY-MM-DD"
                        minDate="1990-01-01"
                        maxDate="2018-01-01"
                        confirmBtnText="Confirm"
                        cancelBtnText="Cancel"
                        showIcon={false}
                        customStyles={{
                        dateIcon: {
                            position: 'absolute',
                            left: 0,
                            top: 4,
                            marginLeft: 0
                        },
                        dateInput: {
                            marginLeft: 36
                        }
                        // ... You can check the source to find the other keys.
                        }}
                        onDateChange={(birth) => {this.setState({birth})}}
                    />
                    </View>
                    

                    <Text style={styles.title}>Religion</Text>
                    <Picker
                        style={{ width:width -40, height: 140,backgroundColor: 'white' }}
                        selectedValue={religion}
                        pickerData={Religions}
                        onValueChange={religion => this.setState({ religion })}
                        textSize={fontSize.base}
                    />

                        
                    <Text style={styles.title}>Have Kids?</Text>
                    <Picker
                        style={{ width:'50%', height: 140,backgroundColor: 'white' }}
                        selectedValue={haveKids?'yes':'no'}
                        pickerData={['yes','no']}
                        onValueChange={have => have=='yes'?this.setState({ haveKids:true }):this.setState({ haveKids:false })}
                        textSize={fontSize.base}    
                    />
                    
                    <View style={{flexDirection:'row', width:width -40}}>
                        <View style={{flex:1}}>
                            <Text style={styles.title}>Smoker</Text>
                            <Picker
                            style={{ width:'100%', height: 140,backgroundColor: 'white' }}
                            selectedValue={smoker?'yes':'no'}
                            pickerData={['yes','no']}
                            onValueChange={have => have=='yes'?this.setState({ haveKids:true }):this.setState({ haveKids:false })}
                            textSize={fontSize.base}
                            />
                        </View>
                        
                        
                        <View style={{flex:1}}>
                            <Text style={styles.title}>Drink</Text>
                            <Picker
                            style={{ width:'100%', height: 140,backgroundColor: 'white' }}
                            selectedValue={drink}
                            pickerData={Drinks}
                            onValueChange={drink => this.setState({ drink })}
                            textSize={fontSize.base}
                            />
                        </View>

                    </View>

                    <Text style={styles.title}>Educations</Text>
                    <Picker
                        style={{ width:'100%', height: 140,backgroundColor: 'white' , marginTop:20}}
                        selectedValue={education}
                        pickerData={Educations}
                        onValueChange={education => this.setState({ education})}
                        textSize={fontSize.base}
                    />

                    <Text style={{color:'black', marginTop:10, fontSize: fontSize.base}}>Profession</Text>
                    <TextInput 
                        onChangeText={(profession) => this.setState({profession})}
                        value={profession}
                        style={{width:'100%', height: 40, borderRadius: 50, backgroundColor: 'white', padding: 10}}/>

                    <Text style={styles.title}>Heights</Text>
                    <Picker
                        style={{ width:'100%', height: 140,backgroundColor: 'white' }}
                        selectedValue={height}
                        pickerData={Heights}
                        onValueChange={height => this.setState({height })}
                        textSize={fontSize.base}
                    />  

                    
                </View>

                <Button
                    style={{ fontSize: fontSize.base, color: 'white' }}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{width: width-40, marginTop: 30,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        this.setState({isFetching: true})
                        this.uploadProfile();
                    }}
                >
                    SAVE
                </Button>  
            </View>
            </ScrollView>
        )
    }
}
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center', backgroundColor: 'white'},
    content:{width: Dimensions.get('window').width, paddingHorizontal: 20, alignItems: 'flex-start', marginTop:10},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
    title:{color:'black', fontSize: fontSize.base}
});

import React, { Component } from 'react'
import { 
    View,
    Image,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    Alert
} from 'react-native';
import Button from 'react-native-button';

import firebase from 'react-native-firebase';
import RNFetchBlob from 'react-native-fetch-blob'

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

import Video from 'react-native-af-video-player'

import ImagePicker from 'react-native-image-picker';
const options = {
    title: 'Profile Video',
    mediaType: 'video',
    takePhotoButtonTitle: 'Take Video',
    chooseFromLibraryButtonTitle: 'Select Video from library',
    storageOptions: {
      skipBackup: true,
      path: 'videos',
    },
  };


export default class RecordScreen extends Component {

    constructor(props){
        super(props);
        this.unsubscriber = null;
        this.state={
            videos:[
            ],
            isFetching: false,
            user: null,
            videoLocals: [],
            currentVideo: '',
            user: firebase.auth().currentUser._user
            
        }

        this.docRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser._user.uid);
        this.ref = firebase.firestore().collection('users');
    }

    componentDidMount(){
        // const user = firebase.auth().currentUser._user
        console.log(this.state);
        // create new
        const  inThis = this;
        let fulldoc={};
        this.docRef.get().then(function(doc) {
            if (doc.exists) {
                if(doc.data().videos.length>0)
                inThis.setState({videos: doc.data().videos,currentVideo:doc.data().videos[0]});
                
            } else {
                console.log("No such document!", user);
                
            }
          }).catch(function(error) {
              console.log("Error getting document:", error);
          });
    


    }


    uploadVideo = (path, videoName, mime = 'audio/mpeg') => {//mime =audio/mpeg for video
        const inThis= this;
        console.log(videoName);
        return new Promise((resolve, reject) => {
            const videoRef = firebase.storage().ref(this.state.user.uid).child(videoName);
            fs.readFile(path, 'base64')
            .then((data) => {
              return Blob.build(data, { type: `${mime};BASE64` })
            })
            .then((blob) => {
              uploadBlob = blob
              return videoRef.put(blob._ref, { contentType: mime });
            })
            .then(() => {
              uploadBlob.close()
              return videoRef.getDownloadURL()
            })
            .then((url) => {
                let a = this.state.videos;
                a.push(url);
                this.setState({videos:[...a] });

                inThis.docRef.update({videos: a})
                    .then((doc)=>{
                        //upload profile success
                        console.log(doc);
                        Alert.alert('Upload video success');
                    }).catch((e)=>{
                        console.log("Error getting document:", error);
                        Alert.alert('Upload video fail');
                    });
              resolve(url)

              
            })
            .catch((error) => {
              reject(error)
            })

        })
    }

    makeid= (n) =>{
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      
        for (var i = 0; i < n; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      
        return text;
      }



    render() {
        console.log(this.state);
        const {isFetching} = this.state;
        return (
            <ScrollView style={{flex:1, backgroundColor: 'white'}}>
            <View style={styles.container}>
                <Button
                    style={{ fontSize: 14, color: 'white' , width: '80%'}}
                    styleDisabled={{ color: 'white' }}
                    disabled={isFetching}
                    containerStyle={{ marginTop: 10,padding: 10, height: 42, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#2980b9' }}
                    onPress={() =>{
                        this.setState({isFetching: true})
                        ImagePicker.showImagePicker(options, (response) => {
                            console.log('Response = ', response);

                            if (response.didCancel) {
                                //console.log('User cancelled image picker');
                            } else if (response.error) {
                                //console.log('ImagePicker Error: ', response.error);
                            } else {
                                // You can also display the image using data:
                                
                                // this.uploadImage( response.path , response.fileName);
                                // console.log(url);

                                let a = this.state.videoLocals;
                                a.push(response);
                                this.setState({
                                    videoLocals: [...a]
                                });
                                
                                const name = this.makeid(8);
                                this.uploadVideo(response.path, name);
                            }
                        });
                        this.setState({isFetching: false});
                        
                    }}
                >
                    Record Profile Video
                </Button>
                {/* Show Records */}
                <View style={{width:'100%', backgroundColor: 'white', marginTop: 20}}>
                        <Video url={this.state.currentVideo} /> 
                    <FlatList
                        contentContainerStyle={{height: 80, justifyContent:"center"}}
                        horizontal={true}
                        data={this.state.videos}
                        // extraData={this.state}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                    />
                </View>
            </View>
            </ScrollView>
        )
    }

    _keyExtractor = (item, index) => item.id;

    _renderItem = ({item, index}) => {
        // console.log(item, index, item.index);
        return (
            <Button
                    style={{ fontSize: 14, color: 'white' }}
                    styleDisabled={{ color: 'white' }}
                    // disabled={isFetching}
                    containerStyle={{ width: 100, margin : 5, height: 60, overflow: 'hidden', borderRadius: 10,  backgroundColor: '#bdc3c7', justifyContent: 'center', alignItems:'center' }}
                    onPress={() =>{
                        this.setState({currentVideo: this.state.videos[index]});
                    }}
                >
                    {index+1}
            </Button>
        
        )
    };
}



  
const styles= StyleSheet.create({
    container:{flex: 1, alignItems: 'center', backgroundColor:'white'},
    bgImage: {flex: 1, zIndex: -1},
    logo:{margin: 5, alignSelf: 'center', height: 100, width: 100},
});

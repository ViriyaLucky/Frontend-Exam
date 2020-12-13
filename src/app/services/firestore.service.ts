import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import "firebase/firestore";
import { Observable, of } from 'rxjs';
import { Friend } from '../models/Friend';
import { User } from '../models/User';

@Injectable({
  providedIn: "root",
})
export class FirestoreService {
  friendList;
  constructor(
    public firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  registerUser(
    email: string,
    fname: string,
    lname: string,
    extension,
    UID:string
  ) {
    var profileImageUrl = UID + "." + extension;
    fname = this.capitalizeWords(fname);
    lname = this.capitalizeWords(lname);
    return this.firestore.doc(`users/${UID}`).set({
      email,
      fname,
      lname,
      profileImageUrl
    });
  }
  capitalizeWords(text) {
    return text.replace(/(?:^|\s)\S/g, (res) => {
      return res.toUpperCase();
    });
  }
  getUserInfo(UID: string) {
    return this.firestore.doc(`users/${UID}`).ref.get();
  }
  updateProfile(
    nama: string,
    extension,
    UID: string
  ) {
    nama = this.capitalizeWords(nama);
    if (extension) {
      var profileImageUrl = UID + "." + extension;
    }
    var docRef = this.firestore.doc(`users/${UID}`);
    return docRef.ref
      .get()
      .then((doc) => {
        if (doc.exists) {
          //change image if extension exist
          if (extension) {
            docRef.update({
              nama,
              profileImageUrl,
            });
          } else {
            docRef.update({
              nama,
            });
          }
        }
      })
      .catch(function (error) {});
  }

  updateLastPosition(lat, lng, locationName, UID:string){
    var docRef = this.firestore.collection("users").doc(`${UID}`);
    var lastPosition = {
      "position" : {
        "lat": lat ,
        "lng": lng
      }
    }
    var lastPositionName = locationName;
    this.addToFeeds(lat, lng, locationName,UID );
    return docRef.ref
      .get()
      .then((doc) => {
        if (doc.exists) {
          //change image if extension exist
            docRef.update({
              lastPosition,
              lastPositionName
            });
        }
      })
      .catch(function (error) {});
  }

  getFeeds(UID):Observable<any>{
    var docRef = this.firestore.collection("users").doc(`${UID}`).collection("feeds");
    return docRef.valueChanges({idField: 'id'})
  }
  
  deleteFeed(UID, feedId){
    return this.firestore.doc(`users/${UID}/feeds/${feedId}`).delete()
  }

  addToFeeds(lat, lng, locationName,UID ){
    var lastPosition = {
      "position" : {
        "lat": lat ,
        "lng": lng
      }
    }
    var date = new Date();
    var id = this.makeid(5);
    var lastPositionName = locationName;
    return this.firestore.doc(`users/${UID}/feeds/${id}`).set({
      date,
      lastPosition,
      lastPositionName
    });
  }

  addFriend(friend_id, UID){
    var id = friend_id;
    const found = this.friendList.some(el => el.friend_id === friend_id);
    if (!found) {
      return this.firestore.doc(`users/${UID}/friends/${id}`).set({
        friend_id
      });
    }else{
      return {};
    }
  }

  deleteFriend(friend_id, UID){
      return this.firestore.doc(`users/${UID}/friends/${friend_id}`).delete()
  }

  getUserList(UID:string) {
    let datas=[];
    var docRef = this.firestore.collection(`users`);
    return docRef.ref.get().then((doc) => {
      if (!doc.empty) {
        let listUser = [];
        doc.docs.map((a) => {
          const fullname = a.data()["fname"] + " " +  a.data()["lname"];
          const profileImageUrl = a.data()["profileImageUrl"];
          const id = a.id;
            if(UID != id){
              const found = this.friendList.some(el => el.friend_id === id);
              if (!found)  listUser.push({ id, fullname, profileImageUrl});
            }else{
              return {}
            }
        });
        return listUser;
      }
    })
    .catch(function (error) {});
  }

  uploadProfileImage(profileImage: File, extension, uid: string) {
    const file = profileImage;
    const filePath = "profileImage/" + uid + "." + extension;
    const ref = this.storage.ref(filePath);
    const task = ref.put(file);
  }
  getProfileImageUrl(uid) {
    try {
      return this.storage
        .ref(`profileImage/${uid}`)
        .getDownloadURL()
        .toPromise();
    } catch (error) {
      console.log(error);
    }
  }

  getFriendList(UID:string):Observable<any>{
    var docRef = this.firestore.collection(`users/${UID}/friends`);
    return docRef.valueChanges()
  }

  getFriendLocation( id){
    return this.firestore.doc(`users/${id}`).ref
    .get()
    .then((doc) => {
      if (doc.exists) {
        return doc.data()
      }
    })
    .catch(function (error) {});
  }

  getFriendData(UID:string){
    return this.firestore.doc(`users/${UID}`).valueChanges();
  }

  

   makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

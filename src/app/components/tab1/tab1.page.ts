import { Component, OnInit } from '@angular/core';
import { QuerySnapshot } from '@angular/fire/firestore';
import { AlertController, ModalController } from '@ionic/angular';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { Friend } from 'src/app/models/Friend';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { SearchFriendComponent } from '../search-friend/search-friend.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  listFriend:Friend[] = [];
  listFriendBackup;
  uid = firebase.default.auth().currentUser.uid;
  profile;
  profileImageUrl = "../../../assets/user-placeholder.png";
  user;
  docLength;
  userData;
  constructor(private firestoreService:FirestoreService, 
    public authService:AuthService ,
    public modalController: ModalController,
    public alertCtrl:AlertController
    ) {
     
    }
  ngOnInit(){
    this.getFriends();
  }

  getFriends(){
    this.firestoreService.getFriendList(this.uid)
      .subscribe((doc) => {
        this.listFriend = []
        let temp = []
        let isRequest = true;
        doc.forEach((docs:any,index) => {
            temp.forEach((element, index) => {
            if(element.friend_id == docs.friend_id){
              isRequest = false;
              }
            });
            if(isRequest == false){
              isRequest = true;
              return
            }else{
            this.firestoreService.getFriendData(docs.friend_id).subscribe((doc:any) => {
            console.log("dipanggil nih" + docs.friend_id)
            let user = new User().deserialize(doc);
            let profileImage = user.profileImageUrl;
            user.profileImageUrl = "../../../assets/user-placeholder.png";
            let friend_id = docs.friend_id;
            let fr = new Friend().deserialize({ friend_id , user});
            temp.push(fr);

            this.firestoreService.getProfileImageUrl(profileImage).then((res)=>{
              fr.user.profileImageUrl =  res;   
              temp.forEach((element, index) => {
                if(element.friend_id == fr.friend_id){
                  temp[index] = fr
                }
              });
            }).catch((error)=>{
                // console.log(error);
            });
            temp.forEach((item, index) => {
              if (this.listFriend.findIndex(i => i.friend_id == item.friend_id) === -1) 
              {
                this.listFriend.push(item)
              }
          
            });
            this.listFriendBackup = this.listFriend;
            this.firestoreService.friendList = this.listFriend;
          })
       
          } 
        });
        
      })
     
  }
  
  async addFriend(){
    const modal = await this.modalController.create({
      component: SearchFriendComponent,
      componentProps: {
        "uid": this.uid,
      }
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
      }
    });

    return await modal.present();
  }

  getUserInfo(){
    this.firestoreService.getUserInfo(this.uid).then((doc) => {
      if(doc.exists){
        console.log(doc.data());
        this.profile = doc.data();
        this.firestoreService.getProfileImageUrl(this.profile.profileImageUrl).then((res)=>{
          this.profileImageUrl = res;
        }).catch((error)=>{
            console.log(error);
        });
      }else{
        // console.log('error getting document', doc)
      }
  }).catch(function (error){
    // console.log('error getting document', error)
  });
  }

  async deleteFriend(friend:Friend){
    console.log("deleting friend");
    let alert = await this.alertCtrl.create({
      message: 'Do you want to remove this friend?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Remove',
          handler: data => {
            this.listFriend = this.listFriend.filter(data=> data.friend_id != friend.friend_id)
            this.firestoreService.friendList = this.listFriend;
            this.firestoreService.deleteFriend(friend.friend_id, this.uid).then((result) => {
                // console.log(result);
            }).catch((err) => {
              
            });
          }
        }
      ]
    });
    alert.present();
    
  }
  async filterList(evt) {
    this.listFriend = this.listFriendBackup;
    const searchTerm = evt.srcElement.value;
    // console.log(searchTerm);
    if (!searchTerm) {
      return;
    }
  
    this.listFriend = this.listFriend.filter(currentUser => {
      if (currentUser.user && searchTerm) {
        return (currentUser.user.fname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 || currentUser.user.lname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1);
      }
    });
  }
}
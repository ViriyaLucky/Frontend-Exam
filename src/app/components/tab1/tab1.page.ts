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
  counter = 0;
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
        this.docLength = doc.length
        doc.forEach((docs:any,index) => {
            this.firestoreService.getFriendData(docs.friend_id).subscribe((doc:any) => {
            if(index+1 > this.docLength){
              return
            }
            let user = new User().deserialize(doc);
            let profileImage = user.profileImageUrl;
            user.profileImageUrl = "../../../assets/user-placeholder.png";
            let friend_id = docs.friend_id;
            let fr = new Friend().deserialize({ friend_id , user});
            temp.push(fr);

            let curr = this.counter;
            // this.getImageUrl(fr);
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
            this.counter++
          })
        });
        this.listFriend = temp;
        this.listFriend.forEach((data, index)=>{
          this.firestoreService.getProfileImageUrl(data.user.profileImageUrl).then((res)=>{
            this.listFriend[index].user.profileImageUrl = res
            console.log(res)
          }).catch((error)=>{
              // console.log(error);
          });
        })
        this.counter = 0;
        this.listFriendBackup = this.listFriend;
        this.firestoreService.friendList = this.listFriend;
      })
     
  }
  getImageUrl(fr){
    this.firestoreService.getProfileImageUrl(fr.user.profileImageUrl).then((res)=>{
      console.log(res)
      fr.user.profileImageUrl = res
    }).catch((error)=>{
        // console.log(error);
    });
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
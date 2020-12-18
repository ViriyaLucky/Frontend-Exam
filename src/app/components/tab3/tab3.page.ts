import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { Pipe, PipeTransform } from '@angular/core';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  feeds;
  profile;
  profileImageUrl = "../../../assets/user-placeholder.png";
  fullname = "";
  uid = firebase.default.auth().currentUser.uid;
  constructor(private auth:AuthService, private router: Router, 
    private loadingCtrl:LoadingController,
    private firestoreService:FirestoreService, public alertCtrl:AlertController) {
    this.uid = firebase.default.auth().currentUser ? firebase.default.auth().currentUser.uid : "";

  }
  logout(){
    this.auth.logoutUser()
  }
  ngOnInit(){
    this.firestoreService.getFeeds(this.uid).subscribe((data)=>{
      this.feeds = data;
      // this.feeds.reverse();
    })
    this.getUserInfo();
  }

  transform (values: any) {
    if (values) {
     return values.slice().reverse();
    }
  }

  changeProfileImage(){
    document.querySelectorAll('.imageUpload')[0].click()
  }

  async handle($event){
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...',
      duration: 10000
    });
    await loading.present();
    const file = $event.target.files[0];
    const extension = file.name.split('.')[1];
    // this.firestoreService.updateProfileImageUrl(extension, this.uid)
    this.firestoreService.uploadProfileImage(file, extension, this.uid);

    // this.profileImageUrl = noExtension + "." + extension
  }

  async deleteFeed(feed){
    let alert = await this.alertCtrl.create({
      message: 'Do you want to remove this feed?',
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
            this.firestoreService.deleteFeed(this.uid, feed.id);
          }
        }
      ]
    });
    alert.present();
    
  }
  getUserInfo(){
    this.firestoreService.getUserInfoObserve(this.uid).subscribe((doc) => {
      if(doc){
        // console.log(doc.data());
        this.profile = doc;
        this.fullname = this.profile.fname + " " + this.profile.lname
        this.firestoreService.getProfileImageUrl(this.profile.profileImageUrl).then((res)=>{
          this.profileImageUrl = res;
        }).catch((error)=>{
            // console.log(error);
        });
      }else{
        // console.log('error getting document', doc)
      }
  })
  }
}

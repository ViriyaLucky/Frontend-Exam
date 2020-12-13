import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AlertController } from '@ionic/angular';
import { Pipe, PipeTransform } from '@angular/core';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit{
  feeds;
  uid = firebase.default.auth().currentUser.uid;
  constructor(private auth:AuthService, private router: Router, private firestoreService:FirestoreService,    public alertCtrl:AlertController    ) {}
  logout(){
    this.auth.logoutUser()
  }
  ngOnInit(){
    this.firestoreService.getFeeds(this.uid).subscribe((data)=>{
      this.feeds = data.reverse();
      this.feeds.reverse();
    })
  }

  transform (values: any) {
    if (values) {
     return values.slice().reverse();
    }
  }

  changeImageProfile(){
    console.log("soon")
  }
  async deleteFeed(feed){
    let alert = await this.alertCtrl.create({
      message: 'Do you want to remove this feed?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            console.log('Cancel clicked');
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
}

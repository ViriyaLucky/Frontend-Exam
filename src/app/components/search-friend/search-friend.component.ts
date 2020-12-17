import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { ToastController } from '@ionic/angular';
import * as firebase from 'firebase';

@Component({
  selector: 'app-search-friend',
  templateUrl: './search-friend.component.html',
  styleUrls: ['./search-friend.component.scss'],
})
export class SearchFriendComponent implements OnInit {
  modalTitle: string;
  modelId: number;
  uid = firebase.default.auth().currentUser.uid;
  listUser = [];
  
  constructor(public firestoreService:FirestoreService,
    private modalController: ModalController,
    private alertController:AlertController,
    private navParams: NavParams,
    public toastController: ToastController
    ) { }

  ngOnInit() {
    this.uid = this.navParams.get("uid");
    this.getUserList();
  }
  getUserList(){
    this.firestoreService.getUserList(this.uid).then( (listUser:any[]) => {
      if(listUser.length != 0){
        this.listUser = listUser;
        this.listUser.forEach((element, i) =>{
          let profileImage = element.profileImageUrl;
          element.profileImageUrl = "../../../assets/user-placeholder.png"
          this.firestoreService.getProfileImageUrl(profileImage).then((res)=>{
            element.profileImageUrl = res;
            console.log(res);
          }).catch((error)=>{
              console.log(error);
          });
      });
      }
     
      // console.log(this.listFriend);
    })
  }
  async closeModal() {
    const onClosedData: string = "Wrapped Up!";
    await this.modalController.dismiss(onClosedData);
  }

  async addUser(user){
    let alert = await this.alertController.create({
      message: 'Do you want to add ' + user.fullname + '?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Add',
          handler: () => {
            this.firestoreService.addFriend(user.id, this.uid);
            this.listUser = this.listUser.filter(val => val.id != user.id);
            this.presentToast();
          }
        }
      ]
    });
    await alert.present();
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Friend added.',
      duration: 2000
    });
    toast.present();
  }

}

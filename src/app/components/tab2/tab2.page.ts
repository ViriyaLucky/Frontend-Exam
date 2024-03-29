import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  Platform, AlertController 
} from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import { google } from "google-maps";
import {googlemaps} from 'googlemaps'; 
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  lastPositionName;
  lat: number = 51.678418;
  lng: number = 7.809007;
  protected map: any;

  mapMarkerA: any = { lat: -6.170213, lng: 106.663115 };
  mapMarkerB: any = {lat: 40.04215, lng: 14.102552 };
  setAddress
  distance: number;
  height = 0;
  coordinates;
  listLocation = [];
  uid = firebase.default.auth().currentUser.uid;
  address;
  
  getAddressService(lat: number, lng: number, i?, markerMap?): Promise<any> {
    const  params = new  HttpParams().set('key', "pk.00975f229644c13b72fea1f97beba659").set('lat', lat.toString()).set('lon', lng.toString()).set("format", "json");

    return new Promise((resolve,reject)=>{ 
      this.http.get('  https://us1.locationiq.com/v1/reverse.php', {params}).subscribe((result:any)=>{    
        // let data : any = result.data;
        // let res : any= data.filter(dat=> dat.type == "street")
        let address = result.display_name
        if(i == undefined){
          this.address = address;
        }else{
          markerMap.address = address;
          this.listLocation[i] = markerMap;
        }
      })
    });
  }
 
  constructor(
    private http: HttpClient,
    public toastCtrl: ToastController,
    public firestoreService:FirestoreService,
    private platform: Platform,
    public authService:AuthService,
    public alertCtrl: AlertController 
    ) { 
      this.height = platform.height() - 120;
      // this.getAddress(this.mapMarkerA.lat,this.mapMarkerA.lng);
      let automaticCheckIn = () => {
        let lat : number= this.lat;
        let lng : number= this.lng;
        this.firestoreService.updateLastPosition(lat, lng, "Automatic Location", this.uid)   
      //  clearInterval(interval); // thanks @Luca D'Amico
      }
      const interval = setInterval(automaticCheckIn, 600000);
      // const interval = setInterval(automaticCheckIn, 3000);
    }

  ngOnInit() {
    // Since ngOnInit() is executed before `deviceready` event,
    // you have to wait the event.
    this.platform.ready();
    this.loadMap();
    this.firestoreService.getUserInfo(this.uid).then((data) =>{
      this.lastPositionName = data.data()['lastPositionName']
      try {
        if(typeof(data.data()['lastPosition'].position) != undefined){
          this.lat = data.data()['lastPosition'].position.lat
          this.lng = data.data()['lastPosition'].position.lng
          this.goToMyLocation();
        }
      } catch (error) {
        
      }
    
    });

    this.firestoreService.getFriendList(this.uid).subscribe((data)=>{
      this.listLocation = [];
      data.forEach((element, i) => {
        this.firestoreService.getUserInfo(element.friend_id).then((data)=>{
          let doc : any= data.data();
          var markerMap ={
            "position": {
              "lat": doc.lastPosition.position.lat,
              "lng": doc.lastPosition.position.lng
            },
            "name": doc.fname + " " + doc.lname + " @ " + doc.lastPositionName,
            "address": "-",
            "icon": "assets/markercluster/marker.png",
            "id" : i
          }
          // console.log("sebelom")
          this.setAddress = function() {
              setTimeout(function(){
                this.getAddressService(doc.lastPosition.position.lat, doc.lastPosition.position.lng, i, markerMap);
              }.bind(this), 3000);
          };
          this.setAddress()
          this.listLocation.push(markerMap);
          this.goToMyLocation();
        })

      });
    
    })

  }
 
  loadMap() {
    this.goToMyLocation()
    // this.calcDistance();
  }
   getPosition(): Observable<Position> {
    return Observable.create(
      (observer) => {
      navigator.geolocation.watchPosition((pos: Position) => {
        observer.next(pos);
      }),
      () => {
          // console.log('Position is not available');
      },
      {
        enableHighAccuracy: true
      };
    });
  }
  // private calcDistance(): void {
  //   this.distance = Math.trunc(Spherical.computeDistanceBetween(this.mapMarkerA, this.mapMarkerB));
  //   // console.log(`Distance approx. ${this.distance} meters`);
  //   this.showToast(`Distance approx. ${this.distance} meters`);    
  // }


  protected mapReady(map) {
    this.map = map;
  }

  public locationClicked = () => {
    if (this.map)
      this.map.panTo({ lat: this.lat, lng:this.lng });
      this.map.setZoom(14)
  }

  goToMyLocation() {
    this.getPosition().subscribe(
        (pos: Position) => {
            this.coordinates = {
              latitude:  + (pos.coords.latitude),
              longitude: + (pos.coords.longitude)
            };
            if(this.lat != pos.coords.latitude ||  this.lng != pos.coords.longitude){
              this.lat = pos.coords.latitude;
              this.lng = pos.coords.longitude
              this.getAddressService(pos.coords.latitude,pos.coords.longitude )
            }
           
        });
  }
  
 

  async showToast(message: string) {
    let toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'middle'
    });
    toast.present();
  }

  async checkInLocation(){
    const alert = this.alertCtrl.create({
      message: 'Check-in Location',
      inputs: [
        {
          name: 'locationName',
          placeholder: 'Where am I?'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Check-in',
          handler: data => {
            this.lastPositionName = data.locationName
            this.firestoreService.updateLastPosition(this.lat, this.lng, data.locationName, this.uid)
            this.showToast("Check in recorded!");
          }
        }
      ]
    });
    (await alert).present();

  }
}
import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  Platform, AlertController 
} from '@ionic/angular';
import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  Marker,
  GoogleMapsAnimation,
  Geocoder,
  MyLocation, MarkerCluster, Spherical, LatLng, GeocoderResult
} from '@ionic-native/google-maps';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';
import * as firebase from 'firebase';
import { HTTP } from '@ionic-native/http/ngx';


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  location: MyLocation;
  map: GoogleMap;
  address:string;
  mapMarkerA: any = { lat: -6.170213, lng: 106.663115 };
  mapMarkerB: any = {lat: 40.04215, lng: 14.102552 };
  lat;
  lng;
  distance: number;
  listFriend = [];
  listLocation = [
    // {
    //   "position": {
    //     "lat": -6.232454,
    //     "lng": 106.634731
    //   },
    //   "name": "Teman 1",
    //   "address": "Aiea Shopping Center_99-115\nAiea Heights Drive #125_Aiea, Hawaii 96701",
    //   "icon": "assets/markercluster/marker.png"
    // },

  ];
  uid = firebase.default.auth().currentUser.uid;
  profile;
  
  getAddress(lat: number, lng: number): Promise<any> {
    return new Promise((resolve,reject)=>{ 
      this.http.get('http://api.positionstack.com/v1/reverse', {access_key:"850fadfe5a7d52ff86fc06bbc2053bf2",query:`${lat}, ${lng}`, output:"json" }, {})
        .then(data => {
          resolve(data.data); 
        })
        .catch(error => {
          reject(error); 
        });
    }); 
  }
 
  constructor(
    private http: HTTP,
    public toastCtrl: ToastController,
    public firestoreService:FirestoreService,
    private platform: Platform,
    public authService:AuthService,
    public alertCtrl: AlertController 
    ) { 
      this.getAddress(this.mapMarkerA.lat,this.mapMarkerA.lng);
      let automaticCheckIn = () => {
        let lat : number= this.lat | 0;
        let lng : number= this.lng | 0;
        this.firestoreService.updateLastPosition(lat, lng, "Automatic Location", this.uid)   
      //  clearInterval(interval); // thanks @Luca D'Amico
      }
      const interval = setInterval(automaticCheckIn, 600000);
    }

  ngOnInit() {
    // Since ngOnInit() is executed before `deviceready` event,
    // you have to wait the event.
    this.platform.ready();
    this.loadMap();

    this.firestoreService.getFriendList(this.uid).subscribe((data)=>{
      if(data.length == 0){
        if(this.map != undefined){
          this.map.clear()
        }
        this.goToMyLocation();
      }
      this.listLocation = [];
      data.forEach((element, i) => {
        this.firestoreService.getUserInfo(element.friend_id).then((data)=>{
          // console.log(data.data());
          let doc : any= data.data();
          var markerMap ={
            "position": {
              "lat": doc.lastPosition.position.lat,
              "lng": doc.lastPosition.position.lng
            },
            "name": doc.fname + " " + doc.lname + " @ " + doc.lastPositionName,
            "address": "Aiea Shopping Center_99-115\nAiea Heights Drive #125_Aiea, Hawaii 96701",
            "icon": "assets/markercluster/marker.png",
            "id" : i
          }
          this.getAddress(doc.lastPosition.position.lat, doc.lastPosition.position.lng)
            .then((result) => {
              let data = JSON.parse(result);
              data= data.data;
              let res : any= data.filter(dat=> dat.type == "street")
              let address = res[0].name
              markerMap.address = address;
              this.listLocation[i] = markerMap;
              this.addCluster(this.listLocation);
              this.goToMyLocation();
            }).catch((err) => {
            
          });
          this.listLocation.push(markerMap);
          console.log(this.listLocation);
          this.addCluster(this.listLocation);
          this.goToMyLocation();
        })

      });
    
    })

  }
 
  loadMap() {
    this.map = GoogleMaps.create('map_canvas', {
      'camera': {
        'target': {
          "lat": 21.382314,
          "lng": -157.933097
        },
        'zoom': 10
      }
    });
    this.goToMyLocation()
    // this.calcDistance();
  }

  private calcDistance(): void {
    this.distance = Math.trunc(Spherical.computeDistanceBetween(this.mapMarkerA, this.mapMarkerB));
    // console.log(`Distance approx. ${this.distance} meters`);
    this.showToast(`Distance approx. ${this.distance} meters`);    
  }
  goToMyLocation(){
    // Get the location of you
    if(this.map != undefined){
      this.map.getMyLocation().then((location: MyLocation) => {
        console.log(JSON.stringify(location, null ,2));

        this.lat = location.latLng.lat;
        this.lng = location.latLng.lng;

        // Move the map camera to the location with animation
        this.map.animateCamera({
          target: location.latLng,
          zoom: 17,
          duration: 5000
        });

        //add a marker
        let marker: Marker = this.map.addMarkerSync({
          title: 'Your Location',
          snippet: 'Here is your location!',
          position: location.latLng,
          animation: GoogleMapsAnimation.BOUNCE
        });

        //show the infoWindow
        marker.showInfoWindow();


        //If clicked it, display the alert
        marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {
          // this.showToast('clicked!');
        });

        this.map.on(GoogleMapsEvent.MAP_READY).subscribe(
          (data) => {
              // console.log("Click MAP",data);
          }
        );
      })
      .catch(err => {
        //this.loading.dismiss();
        this.showToast(err.error_message);
      });
    }
  }
  
  addCluster(data) {
    if(this.map != undefined){
      this.map.clear()

    }
    if(data != undefined && this.map != undefined){
      let markerCluster: MarkerCluster = this.map.addMarkerClusterSync({
        markers: data,
        icons: [
          {
            min: 1,
            max: 9,
            url: "./assets/markercluster/small.png",
            label: {
              color: "white"
            }
          },
          {
            min: 10,
            url: "./assets/markercluster/large.png",
            label: {
              color: "white"
            }
          }
        ]
      })
      markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
        let marker: Marker = params[1];
        marker.setTitle(marker.get("name"));
        marker.setSnippet(marker.get("address"));
        marker.showInfoWindow();
      })

    }
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
            this.firestoreService.updateLastPosition(this.lat, this.lng, data.locationName, this.uid)
            this.showToast("Check in recorded!");
          }
        }
      ]
    });
    (await alert).present();

  }

  
  // dummyData() {
  //   var zz ={
  //     "position": {
  //       "lat": -6.232470,
  //       "lng": 106.634731
  //     },
  //     "name": "Teman 1",
  //     "address": "Aiea Shopping Center_99-115\nAiea Heights Drive #125_Aiea, Hawaii 96701",
  //     "icon": "assets/markercluster/marker.png"
  //   }
  //    var ddd= 
  //    [
  //     {
  //       "position": {
  //         "lat": -6.232454,
  //         "lng": 106.634731
  //       },
  //       "name": "Teman 1",
  //       "address": "Aiea Shopping Center_99-115\nAiea Heights Drive #125_Aiea, Hawaii 96701",
  //       "icon": "assets/markercluster/marker.png"
  //     },
 
  //   ];
  //   let aaa = this.listFriend;

  //   ddd.push(zz)
  //   // var ddd= 
  //   //  [
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.232454,
  //   //       "lng": 106.634731
  //   //     },
  //   //     "name": "Teman 1",
  //   //     "address": "Aiea Shopping Center_99-115\nAiea Heights Drive #125_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.232299,
  //   //       "lng": 106.635718
  //   //     },
  //   //     "name": "Teman 2",
  //   //     "address": "Pearlridge Center_98-125\nKaonohi Street_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.231867,
  //   //       "lng": 106.634511
  //   //     },
  //   //     "name": "Teman 3",
  //   //     "address": "Pearlridge Center_98-125\nKaonohi Street_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.231847,
  //   //       "lng": 106.635831
  //   //     },
  //   //     "name": "Teman 4",
  //   //     "address": "Pearlridge Center_98-125\nKaonohi Street_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.232684,
  //   //       "lng": 106.635777
  //   //     },
  //   //     "name": "Teman 5",
  //   //     "address": "Pearlridge Center_98-125\nKaonohi Street_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   //   {
  //   //     "position": {
  //   //       "lat": -6.233090,
  //   //       "lng": 106.635606
  //   //     },
  //   //     "name": "Teman 6",
  //   //     "address": "Pearlridge Center_98-125\nKaonohi Street_Aiea, Hawaii 96701",
  //   //     "icon": "assets/markercluster/marker.png"
  //   //   },
  //   // ];
  //   return ddd;
  // }
}

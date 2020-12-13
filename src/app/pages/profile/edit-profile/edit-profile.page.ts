import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from  "@angular/router";
import { LoadingController, NavController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  profile = null;
  uid;
  nama= "";
  tglLahir= "";
  alamat= "";
  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  imageFilePath ='';
  file: File;
  fileExtension = '';
  profileImageUrl;
  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private  router:  Router,
    private firestoreService : FirestoreService,
    public loadingCtrl: LoadingController,
  ) { }



  validation_messages = {
    'nama': [
      { type: 'required', message: 'Nama is required.' },
    ],
    'tglLahir': [
      { type: 'required', message: 'Tanggal Lahir is required.' },
    ],
    'alamat': [
      { type: 'required', message: 'Alamat is required.' },
    ],
    'profilePic': [
    ]
  };

 
  ngOnInit() {
    this.authService.userDetails().subscribe(res => {
      if(res !== null){
        this.uid = res.uid;
        this.getUserInfo();
       
      } else {
        this.uid = '';
      }
    }, err => {
      console.log(err);
      // this.router.navigateByUrl('/login');
    });
    this.validations_form = this.formBuilder.group({
      nama: new FormControl('', Validators.compose([
        Validators.required
      ])),
      tglLahir: new FormControl('', Validators.compose([
        Validators.required
      ])),
      alamat: new FormControl('', Validators.compose([
        Validators.required
      ])),
      profilePic: new FormControl('', Validators.compose([
      ])),
    });

  }
 
  getUserInfo(){
    console.log(this.uid);
    this.firestoreService.getUserInfo(this.uid).then((doc) => {
      if(doc.exists){
        console.log(doc.data());
        this.profile = doc.data();
        this.nama = this.profile.nama;
        this.tglLahir= this.profile.tglLahir;
        this.alamat= this.profile.alamat;
        this.firestoreService.getProfileImageUrl(this.profile.profileImageUrl).then((res)=>{
          this.profileImageUrl = res;
          console.log(res)
        }).catch((error)=>{
            console.log(error);
        });
      }else{
        console.log('tidak ada document', doc)
      }
  }).catch(function (error){
    console.log('error getting document', error)
  });
  }
  async editProfile(value) {
    // console.log(value);
    const loading = await this.loadingCtrl.create();
    if(this.fileExtension){
      this.uploadProfileImage();
    }
   
    this.firestoreService.updateProfile(
      value.nama,
      this.fileExtension, this.uid).then(
        () => {
          loading.dismiss().then(() => {
            this.router.navigateByUrl('/index');
          });
        },
        error => {
          loading.dismiss().then(() => {
            console.error(error);
          });
        }
      ), err => {
    console.log(err);
    this.errorMessage = err.message;
    this.successMessage = "";
  }
    return await loading.present();
  }

  goLoginPage() {
    this.navCtrl.navigateBack('');
  }
  changelistener(event) : void {
    console.log("masuk changelistener");
    console.log(event.target.files[0].name);
    if(event.target.files[0]){
      this.fileExtension = this.getFileExtension(event.target.files[0].name);
      this.file = event.target.files[0];
      const reader = new FileReader();
        reader.readAsDataURL(this.file);
        reader.onload = event => {
          console.log(reader.result)
          this.profileImageUrl = reader.result;
        };
    }
   
  }

  uploadProfileImage(){
    console.log("uploadProfileImage");
    this.firestoreService.uploadProfileImage(this.file, this.fileExtension, this.uid);
  }
  getFileExtension(filename){
    return filename.split('.').pop();

  }
}


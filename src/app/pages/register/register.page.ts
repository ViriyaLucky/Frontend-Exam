import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from  "@angular/router";
import { LoadingController, NavController } from '@ionic/angular';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})


export class RegisterPage implements OnInit {
  imageFilePath = '';
  file: File;
  fileExtension = '';
  validations_form: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ],
    'nama': [
      { type: 'required', message: 'Nama is required.' },
    ],
    'tglLahir': [
      { type: 'required', message: 'Tanggal Lahir is required.' },
    ],
    'telepon': [
      { type: 'required', message: 'Nomor Telepon is required.' },
      { type: 'pattern', message: 'Nomor Telepon is not valid.' },
    ],
    'alamat': [
      { type: 'required', message: 'Alamat is required.' },
    ],
    'profilePic': [
      { type: 'required', message: 'Profile Picture is required.' },
    ]
  };
  dataTest;
 
  constructor(
    private navCtrl: NavController,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private  router:  Router,
    private firestoreService : FirestoreService,
    public loadingCtrl: LoadingController,
  ) {

   }


  ngOnInit() {
    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
      cpassword: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required,
      ])),
      fname: new FormControl('', Validators.compose([
        Validators.required
      ])),
      lname: new FormControl('', Validators.compose([
        Validators.required
      ])),
      profilePic: new FormControl('', Validators.compose([
        Validators.required
      ])),
    }, {validator: this.checkPasswords });


  }

  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.get('password').value;
    let confirmPass = group.get('cpassword').value;
    return pass === confirmPass ? null : { notSame: true }     
  }

  async tryRegister(value) {
    // console.log(value);
    const loading = await this.loadingCtrl.create();
   
    this.authService.registerUser(value)
      .then(res => {
        // console.log("disini");
        // console.log(res);
        this.errorMessage = "";
        this.successMessage = "Your account has been created. Please log in.";
        this.uploadProfileImage(res.user.uid);
        this.firestoreService.registerUser( value.email,
          value.fname,
          value.lname,
          this.fileExtension,
          res.user.uid).then(
            () => {
              loading.dismiss().then(() => {
                this.router.navigate(["/"]);
              });
            },
            error => {
              loading.dismiss().then(() => {
                console.error(error);
              });
            }
          );
      }, err => {
        console.log(err);
        this.errorMessage = err.message;
        this.successMessage = "";
        loading.dismiss().then(() => {
          console.error(err);
        });
      })
    return await loading.present();

  }

  goLoginPage() {
    this.navCtrl.navigateBack('');
  }
  changelistener(event) : void {
    console.log("masuk changelistener");
    console.log(event.target.files[0].name);
    this.fileExtension = this.getFileExtension(event.target.files[0].name);
    this.file = event.target.files[0];
  }

  uploadProfileImage(uid:string){
    console.log("uploadProfileImage");
    this.firestoreService.uploadProfileImage(this.file, this.fileExtension,uid);
    // let fileRef = firebase.storage().ref('profileImages/' + this.uid + ".jpg");
    // fileRef.put(this.file).then(function(snapshot) {
    //   console.log('Uploaded a blob or file!');
    // });
  }
  getFileExtension(filename){
    return filename.split('.').pop();

  }
}
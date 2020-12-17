import { Component, OnInit } from '@angular/core';
import { Router } from  "@angular/router";
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  validations_form: FormGroup;
  errorMessage: string = '';
  validation_messages = {
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Please enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' }
    ]
  };
  constructor(private authService: AuthService, private loadCtrl:LoadingController ,private router: Router, private formBuilder: FormBuilder, private firestore:FirestoreService) { }

  ngOnInit() {

    this.authService.userDetails().subscribe(res => {
      if(res === null){}
      else {
        this.router.navigateByUrl('/');
      } 
    }, err => {
      console.log(err);
      // this.router.navigateByUrl('/login');
    });

    this.validations_form = this.formBuilder.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required
      ])),
    });
  }
  
  async loginUser(value){
    const loading = await this.loadCtrl.create({
      message: 'Please wait...',
      duration: 2000
    });
    await loading.present();

    this.authService.loginUser(value)
      .then(res => {
        this.router.navigate(["/"]);
        loading.dismiss()
      }, err => {
        this.errorMessage = err.message;
        loading.dismiss()
      });
    this.validations_form.reset();

  }
  goToRegisterPage(){
    this.router.navigate(["/register"]);
  }
}

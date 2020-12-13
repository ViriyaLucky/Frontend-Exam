import { Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState: any;
  uid = "";
  private _credentials: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public readonly credentials$: Observable<any> = this._credentials.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router
  ) { 
    this.afAuth.authState.subscribe((user) => {

    });
  }

  registerUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.createUserWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err))
    })

  }

  loginUser(value) {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.signInWithEmailAndPassword(value.email, value.password)
        .then(
          res => resolve(res),
          err => reject(err))
    })
  }

  logoutUser() {
    return new Promise((resolve, reject) => {
      this.afAuth.signOut()
        .then(() => {
          console.log("LOG Out");
          this.router.navigate(['/']);
          resolve();
        }).catch((error) => {
          reject();
        });
    })
  }

  userDetails() {
    return this.afAuth.user
  }
  getUser() {
    // Return the observable. DO NOT subscribe here.
    return this.afAuth.user
    // Hint: you could also transform the value before returning it:
    // return this.af.auth.map(authData => new User({name: authData.name}));
  }
  getUid(){
    this.userDetails().subscribe(res => {
      if(res !== null){
        this.uid = res.uid;
      } else {
        this.uid = '';
      }
    }, err => {
      console.log(err);
      // this.router.navigateByUrl('/login');
    });
  }

  credentials(): any {
    return this._credentials.value;
  }
  isAuthenticated(){
    return this.afAuth.authState !== null;
  }
}
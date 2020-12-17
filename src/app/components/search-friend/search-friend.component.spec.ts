import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { IonicModule, NavController, NavParams, Platform } from '@ionic/angular';
import { environment } from 'src/environments/environment';

import { SearchFriendComponent } from './search-friend.component';

describe('SearchFriendComponent', () => {
  let component: SearchFriendComponent;
  let fixture: ComponentFixture<SearchFriendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchFriendComponent ],
      providers: [
        NavController, Platform, NavParams
      ],
      imports: [IonicModule.forRoot(),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFirestoreModule,]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFriendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

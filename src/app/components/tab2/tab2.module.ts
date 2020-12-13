import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab2Page } from './tab2.page';

import { Tab2PageRoutingModule } from './tab2-routing.module';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab2PageRoutingModule,HttpClientModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCASREX3DvG_6gUdqZsZW0q0f82ZHQawMs'
    }),
  ],
  declarations: [Tab2Page],
  providers: [
    NativeGeocoder,
  ]
})
export class Tab2PageModule {}

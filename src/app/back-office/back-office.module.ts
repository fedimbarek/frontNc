import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BackOfficeRoutingModule } from './back-office-routing.module';
import { BackOfficeComponent } from './back-office.component';
import { SidebarComponent } from './back-layout/sidebar/sidebar.component';
import { HeaderComponent } from './back-layout/header/header.component';


import { NgChartsModule } from 'ng2-charts';



@NgModule({
  declarations: [
    BackOfficeComponent,
    SidebarComponent,
    HeaderComponent,
    
   
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BackOfficeRoutingModule,
    NgChartsModule,
    
  ],
  exports: [
    HeaderComponent,
    SidebarComponent
  ]
})
export class BackOfficeModule { }
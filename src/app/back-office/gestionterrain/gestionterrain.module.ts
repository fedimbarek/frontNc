import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { GestionterrainRoutingModule } from './gestionterrain-routing.module';
import { GestionterrainComponent } from './gestionterrain.component';


@NgModule({
  declarations: [
    GestionterrainComponent
  ],
  imports: [
    CommonModule,
    GestionterrainRoutingModule,
    ReactiveFormsModule 
  ]
})
export class GestionterrainModule { }

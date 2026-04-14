import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestiontournoisRoutingModule } from './gestiontournois-routing.module';
import { GestiontournoisComponent } from './gestiontournois.component';
import { TournoiFormComponent } from './tournoi-form/tournoi-form.component';

@NgModule({
  declarations: [
    GestiontournoisComponent,
    TournoiFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GestiontournoisRoutingModule
  ]
})
export class GestiontournoisModule {}
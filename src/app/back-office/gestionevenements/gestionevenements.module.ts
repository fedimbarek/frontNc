import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestionevenementsRoutingModule } from './gestionevenements-routing.module';
import { GestionevenementsComponent } from './gestionevenements.component';
import { EventFormComponent } from './event-form/event-form.component';

@NgModule({
  declarations: [
    GestionevenementsComponent,
    EventFormComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GestionevenementsRoutingModule
  ]
})
export class GestionevenementsModule {}

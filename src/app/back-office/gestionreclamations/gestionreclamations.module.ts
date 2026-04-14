import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GestionreclamationsRoutingModule } from './gestionreclamations-routing.module';
import { GestionreclamationsComponent } from './gestionreclamations.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    GestionreclamationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    GestionreclamationsRoutingModule,
    NgChartsModule
  ]
})
export class GestionreclamationsModule {}

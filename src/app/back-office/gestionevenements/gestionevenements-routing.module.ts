import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionevenementsComponent } from './gestionevenements.component';

const routes: Routes = [
  { path: '', component: GestionevenementsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionevenementsRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestiontournoisComponent } from './gestiontournois.component';

const routes: Routes = [
  { path: '', component: GestiontournoisComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestiontournoisRoutingModule {}
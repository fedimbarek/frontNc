import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionterrainComponent } from './gestionterrain.component';

const routes: Routes = [{ path: '', component: GestionterrainComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GestionterrainRoutingModule { }

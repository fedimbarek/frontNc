import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BackOfficeComponent } from './back-office.component';


const routes: Routes = [
  {
    path: '',
    component: BackOfficeComponent,
    children: [
     
      {
        path: 'gestionchatprive',
        loadChildren: () =>
          import('./gestionchatprive/gestionchatprive.module')
            .then(m => m.GestionchatpriveModule)
      },
      

      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      { path: 'gestionterrain', loadChildren: () => import('./gestionterrain/gestionterrain.module').then(m => m.GestionterrainModule) },
      { path: 'reservation', loadChildren: () => import('./reservation/reservation.module').then(m => m.ReservationModule) },
      { path: 'gestionevenements', loadChildren: () => import('./gestionevenements/gestionevenements.module').then(m => m.GestionevenementsModule) },
      { path: 'gestiontournois', loadChildren: () => import('./gestiontournois/gestiontournois.module').then(m => m.GestiontournoisModule) },
      { path: 'gestionreclamations', loadChildren: () => import('./gestionreclamations/gestionreclamations.module').then(m => m.GestionreclamationsModule) },
      { path: 'recruitment', loadComponent: () => import('./admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'recruitment/users', loadComponent: () => import('./user-management.component').then(m => m.UserManagementComponent) }
    ]
  },
 
  
 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BackOfficeRoutingModule { }

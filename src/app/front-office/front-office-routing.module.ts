import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FrontOfficeComponent } from './front-office.component';
import { LoginComponent } from './login/login.component';
import { FirstloginComponent } from './pages/Reset/firstlogin/firstlogin.component';
import { ForgotpasswordComponent } from './pages/Reset/forgotpassword/forgotpassword.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { PublicJobsComponent } from './pages/public-jobs/public-jobs.component';
import { EvenementsComponent } from './pages/evenements/evenements.component';
import { TournoisComponent } from './pages/tournois/tournois.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';

const routes: Routes = [
  { path: '', component: FrontOfficeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotpasswordComponent },
  { path: 'first-login', component: FirstloginComponent },
  { path: 'inscription', component: InscriptionComponent },
  { path: 'jobs', component: PublicJobsComponent },
  { path: 'evenements', component: EvenementsComponent },
  { path: 'tournois', component: TournoisComponent },
  { path: 'reclamations', component: ReclamationsComponent }

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontOfficeRoutingModule { }

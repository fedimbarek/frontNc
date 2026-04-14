import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FrontOfficeRoutingModule } from './front-office-routing.module';
import { FrontOfficeComponent } from './front-office.component';

import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './layout/header/header.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ScrollAnimationComponent } from './layout/scroll-animation/scroll-animation.component';
import { ReactiveFormsModule } from '@angular/forms'; // ←
import { FeatureComponent } from './pages/feature/feature.component';
import { HeroComponent } from './pages/hero/hero.component';
import { PricingComponent } from './pages/pricing/pricing.component';
import { TestimoniComponent } from './pages/testimoni/testimoni.component';
import { HomeComponent } from './pages/home/home.component';
import { ForgotpasswordComponent } from './pages/Reset/forgotpassword/forgotpassword.component';
import { FirstloginComponent } from './pages/Reset/firstlogin/firstlogin.component';
import { InscriptionComponent } from './inscription/inscription.component';
import { PublicJobsComponent } from './pages/public-jobs/public-jobs.component';
import { EvenementsComponent } from './pages/evenements/evenements.component';
import { TournoisComponent } from './pages/tournois/tournois.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';
import { FilterByStatusPipe } from './pages/reclamations/filter-by-status.pipe';






@NgModule({
  declarations: [
    FrontOfficeComponent,
    LoginComponent,
    HeaderComponent,
    FooterComponent,
    FeatureComponent,
    ScrollAnimationComponent,
    HeroComponent,
    PricingComponent,
    TestimoniComponent,
    HomeComponent,
    ForgotpasswordComponent,
    FirstloginComponent,
    InscriptionComponent,
    PublicJobsComponent,
    EvenementsComponent,
    TournoisComponent,
    ReclamationsComponent,
    FilterByStatusPipe
  ],
  imports: [
    CommonModule,
    FrontOfficeRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class FrontOfficeModule { }

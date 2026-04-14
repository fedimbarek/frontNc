import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PublicUserService } from '../../services/public-user.service';

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class InscriptionComponent {

userForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private keycloakUserService: PublicUserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    console.log('🚀 Tentative de soumission du formulaire');
    
    if (this.userForm.invalid) {
      console.warn('⚠️ Formulaire invalide');
      this.markFormGroupTouched(this.userForm);
      return;
    }

    console.log('✅ Formulaire valide, envoi des données...');
    
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = this.userForm.value;
    console.log('📋 Données du formulaire:', formData);

    this.keycloakUserService.createUser(formData).subscribe({
      next: (response) => {
        console.log('🎉 Succès de la création:', response);
        this.loading = false;
        this.successMessage = response.message || 'Utilisateur créé avec succès (rôle USER ajouté automatiquement) ✅';
        this.userForm.reset();
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('💥 Échec de la création:', error);
        this.loading = false;
        this.errorMessage = error.error?.error || 'Erreur lors de la création de l\'utilisateur';
        setTimeout(() => this.errorMessage = '', 8000);
      }
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}

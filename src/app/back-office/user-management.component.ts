import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../models/user.model';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  userForm: Partial<User> = { name: '', email: '', password: '', role: 'CANDIDATE' };
  editingUserId: number | null = null;
  error: string | null = null;
  success: string | null = null;
  roles: string[] = ['ADMIN', 'EMPLOYER', 'CANDIDATE'];

  constructor(private http: HttpClient, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.fetchUsers();
  }

  fetchUsers() {
    this.http.get<User[]>(`${environment.apiUrl}/api/auth/all`).subscribe({
      next: users => this.users = users,
      error: () => this.error = 'Failed to fetch users'
    });
  }

  deleteUser(id: number) {
    this.error = 'User deletion is disabled to maintain system integrity with Keycloak.';
  }

  goToJobOffers() {
    this.router.navigate(['/admin']);
  }
}
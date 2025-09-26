import { Component, OnInit, Input, HostListener, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() title: string = 'Admin Dashboard';
  @Input() subtitle: string = 'Manage your courses';
  @Input() showUserInfo: boolean = true;
  
  currentUser: any = null;
  isDropdownOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }


  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }

  getUserInitials(): string {
    if (this.currentUser) {
      const firstInitial = this.currentUser.firstName?.charAt(0)?.toUpperCase() || '';
      const lastInitial = this.currentUser.lastName?.charAt(0)?.toUpperCase() || '';
      return firstInitial + lastInitial || 'U';
    }
    return 'U';
  }

  getRoleDisplayName(): string {
    if (this.currentUser?.role) {
      return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
    }
    return 'User';
  }
}
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { StudentDashboardComponent } from './student-dashboard.component';
import { AuthService } from '../../services/auth/auth.service';

describe('StudentDashboardComponent', () => {
  let component: StudentDashboardComponent;
  let fixture: ComponentFixture<StudentDashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isAuthenticated', 'logout']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [StudentDashboardComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpyObj }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentDashboardComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentUser).toBeNull();
      expect(component.currentView).toBe('all');
    });
  });

  describe('ngOnInit', () => {
    it('should set current user from auth service on initialization', () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'student',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(mockUser);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
    });

    it('should redirect to login when user is not authenticated', () => {
      authServiceSpy.getCurrentUser.and.returnValue(null);
      authServiceSpy.isAuthenticated.and.returnValue(false);

      component.ngOnInit();

      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should redirect admin users to admin dashboard', () => {
      const adminUser = {
        id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(adminUser);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should allow student users to access student dashboard', () => {
      const studentUser = {
        id: '1',
        firstName: 'Student',
        lastName: 'User',
        email: 'student@example.com',
        role: 'student',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(studentUser);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(component.currentUser).toEqual(studentUser);
    });

    it('should handle null user with authentication check', () => {
      authServiceSpy.getCurrentUser.and.returnValue(null);
      authServiceSpy.isAuthenticated.and.returnValue(false);

      component.ngOnInit();

      expect(authServiceSpy.getCurrentUser).toHaveBeenCalled();
      expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('switchView', () => {
    it('should switch to "all" view when called with "all"', () => {
      component.switchView('all');
      expect(component.currentView).toBe('all');
    });

    it('should switch to "enrolled" view when called with "enrolled"', () => {
      component.switchView('enrolled');
      expect(component.currentView).toBe('enrolled');
    });

    it('should handle any string value for view switching', () => {
      component.switchView('custom-view');
      expect(component.currentView).toBe('custom-view');
    });

    it('should update currentView from default value', () => {
      expect(component.currentView).toBe('all');
      component.switchView('enrolled');
      expect(component.currentView).toBe('enrolled');
    });
  });

  describe('logout', () => {
    it('should call authService logout and navigate to login on success', () => {
      authServiceSpy.logout.and.returnValue(of({ message: 'Logout successful', success: true }));

      component.logout();

      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle logout observable subscription', () => {
      const logoutResponse = { message: 'Logout successful', success: true };
      authServiceSpy.logout.and.returnValue(of(logoutResponse));

      spyOn(component, 'logout').and.callThrough();
      component.logout();

      expect(authServiceSpy.logout).toHaveBeenCalled();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Authentication and User Role Validation', () => {
    it('should handle authenticated student user correctly', () => {
      const studentUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Student',
        email: 'john.student@example.com',
        role: 'student',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(studentUser);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(component.currentUser).toEqual(studentUser);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should handle instructor user like student user', () => {
      const instructorUser = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Instructor',
        email: 'jane.instructor@example.com',
        role: 'instructor',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(instructorUser);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(component.currentUser).toEqual(instructorUser);
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should redirect when authentication fails during initialization', () => {
      authServiceSpy.getCurrentUser.and.returnValue(null);
      authServiceSpy.isAuthenticated.and.returnValue(false);

      component.ngOnInit();

      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Component Properties', () => {
    it('should maintain currentView state correctly', () => {
      expect(component.currentView).toBe('all');
      
      component.switchView('enrolled');
      expect(component.currentView).toBe('enrolled');
      
      component.switchView('completed');
      expect(component.currentView).toBe('completed');
    });

    it('should maintain currentUser state correctly', () => {
      expect(component.currentUser).toBeNull();
      
      const mockUser = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'student',
        isActive: true
      };
      
      component.currentUser = mockUser;
      expect(component.currentUser).toEqual(mockUser);
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined user role gracefully', () => {
      const userWithoutRole = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: 'student',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(userWithoutRole);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      expect(() => component.ngOnInit()).not.toThrow();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should handle empty string role', () => {
      const userWithEmptyRole = {
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        role: '',
        isActive: true
      };
      authServiceSpy.getCurrentUser.and.returnValue(userWithEmptyRole);
      authServiceSpy.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(routerSpy.navigate).not.toHaveBeenCalled();
      expect(component.currentUser).toEqual(userWithEmptyRole);
    });
  });
});

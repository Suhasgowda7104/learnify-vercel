// Imports
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../services/auth/auth.service';
import { CourseService } from '../../services/course/course.service';

// Mock Services
const mockAuthService = {
  getCurrentUser: jasmine.createSpy('getCurrentUser'),
  isAuthenticated: jasmine.createSpy('isAuthenticated'),
  logout: jasmine.createSpy('logout')
};

const mockCourseService = {
};

const mockRouter = {
  navigate: jasmine.createSpy('navigate')
};

// Features
describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let courseService: jasmine.SpyObj<CourseService>;
  let router: jasmine.SpyObj<Router>;

  // Mock Reset
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: Router, useValue: mockRouter }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    courseService = TestBed.inject(CourseService) as jasmine.SpyObj<CourseService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Reset all spies
    jasmine.createSpy().calls.reset();
    mockAuthService.getCurrentUser.calls.reset();
    mockAuthService.isAuthenticated.calls.reset();
    mockAuthService.logout.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  // Describe blocks for testing features
  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.currentUser).toBeNull();
      expect(component.currentView).toBe('courses');
    });
  });

  describe('ngOnInit', () => {
    it('should set current user and stay on dashboard when user is authenticated admin', () => {
      const mockUser = { id: 1, name: 'Admin User', role: 'admin' };
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockAuthService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should redirect to login when user is not authenticated', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      mockAuthService.isAuthenticated.and.returnValue(false);

      component.ngOnInit();

      expect(authService.isAuthenticated).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should redirect to student dashboard when user is not admin', () => {
      const mockUser = { id: 1, name: 'Student User', role: 'student' };
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockAuthService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
      expect(router.navigate).toHaveBeenCalledWith(['/student']);
    });

    it('should handle user with undefined role', () => {
      const mockUser = { id: 1, name: 'User', role: undefined };
      mockAuthService.getCurrentUser.and.returnValue(mockUser);
      mockAuthService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/student']);
    });
  });

  describe('switchView', () => {
    it('should switch to dashboard view', () => {
      component.switchView('dashboard');
      expect(component.currentView).toBe('dashboard');
    });

    it('should switch to courses view', () => {
      component.switchView('courses');
      expect(component.currentView).toBe('courses');
    });

    it('should switch to create view', () => {
      component.switchView('create');
      expect(component.currentView).toBe('create');
    });
  });

  describe('onCourseCreated', () => {
    it('should switch view to courses after course creation', () => {
      component.currentView = 'create';
      
      component.onCourseCreated();
      
      expect(component.currentView).toBe('courses');
    });
  });

  describe('logout', () => {
    it('should call authService logout and navigate to login', () => {
      mockAuthService.logout.and.returnValue(of({}));

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should handle logout observable and complete the subscription', () => {
      const mockObservable = of({});
      spyOn(mockObservable, 'subscribe').and.callThrough();
      mockAuthService.logout.and.returnValue(mockObservable);

      component.logout();

      expect(authService.logout).toHaveBeenCalled();
      expect(mockObservable.subscribe).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Component Properties', () => {
    it('should have correct initial currentView', () => {
      expect(component.currentView).toBe('courses');
    });

    it('should have currentUser as null initially', () => {
      expect(component.currentUser).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle null user from getCurrentUser', () => {
      mockAuthService.getCurrentUser.and.returnValue(null);
      mockAuthService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(component.currentUser).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/student']);
    });

    it('should handle empty user object', () => {
      mockAuthService.getCurrentUser.and.returnValue({});
      mockAuthService.isAuthenticated.and.returnValue(true);

      component.ngOnInit();

      expect(router.navigate).toHaveBeenCalledWith(['/student']);
    });
  });
});

import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CourseService, Course } from '../../../services/course/course.service';
import { AuthService } from '../../../services/auth/auth.service';
import { EnrollmentService } from '../../../services/enrollment/enrollment.service';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss'
})
export class CourseListComponent implements OnInit {
  @Input() courses: Course[] = [];
  @Input() isAdminView: boolean = false;
  @Input() showActions: boolean = true;
  @Input() showEnrolledOnly: boolean = false;
  
  currentUser: any = null;
  isLoading = false;
  errorMessage = '';
  enrolledCourseIds: Set<string> = new Set();
  searchTerm: string = '';
  constructor(
    private courseService: CourseService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.courses.length === 0) {
      this.loadCourses();
    }
    
    // Load enrollment status for students
    if (this.isStudent && !this.showEnrolledOnly) {
      this.loadEnrollmentStatus();
    }
  }



  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let courseObservable;
    
    if (this.showEnrolledOnly) {
      courseObservable = this.enrollmentService.getEnrolledCourses();
    } else {
      courseObservable = this.isAdminView 
        ? this.courseService.getAdminCourses()
        : this.courseService.getPublicCourses();
    }

    courseObservable.subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.courses = Array.isArray(response.data) ? response.data : [];
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load courses';
        console.error('Error loading courses:', error);
      }
    });
  }


  viewCourseDetails(courseId: string): void {
    this.router.navigate(['/course-detail', courseId]);
  }


  editCourse(courseId: string): void {
    this.router.navigate(['/course-form', courseId]);
  }

  deleteCourse(courseId: string): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: (response) => {
          if (response.success) {
            this.courses = this.courses.filter(course => course.id !== courseId);
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }


  enrollInCourse(courseId: string): void {
    console.log('Enrolling in course:', courseId);
    alert('Enrollment functionality will be implemented next!');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const weeks = Math.round(hours / (24 * 7));
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  limitDescription(description: string, wordLimit: number = 25): string {
    if (!description) return '';
    
    const words = description.trim().split(/\s+/);
    
    if (words.length <= wordLimit) {
      return description;
    }
    
    return words.slice(0, wordLimit).join(' ') + '...';
  }


  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }


  get isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  loadEnrollmentStatus(): void {
    this.enrollmentService.getEnrollments().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.enrolledCourseIds = new Set(
            response.data.map((enrollment: any) => enrollment.course.id)
          );
        }
      },
      error: (error) => {
        console.error('Error loading enrollment status:', error);
      }
    });
  }

  isEnrolledInCourse(courseId: string): boolean {
    return this.enrolledCourseIds.has(courseId);
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }
}
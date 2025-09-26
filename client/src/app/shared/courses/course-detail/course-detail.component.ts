import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService, Course, CourseContent, EnrolledUser } from '../../../services/course/course.service';
import { AuthService } from '../../../services/auth/auth.service';
import { EnrollmentService } from '../../../services/enrollment/enrollment.service';

@Component({
  selector: 'app-course-detail',
  standalone: false,
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.scss'
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  currentUser: any = null;
  isLoading = true;
  errorMessage = '';
  courseId: string | null = null;
  isEnrolled = false;
  isEnrollmentLoading = false;
  enrollmentCount = 0;
  
  // Enrolled users modal properties
  showEnrolledUsersModal = false;
  enrolledUsers: EnrolledUser[] = [];
  isLoadingEnrolledUsers = false;
  enrolledUsersError = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private enrollmentService: EnrollmentService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.courseId = this.route.snapshot.paramMap.get('id');
    
    if (this.courseId) {
      this.loadCourseDetails(this.courseId);
      if (this.isStudent) {
        this.checkEnrollmentStatus(this.courseId);
      }
      if (this.isAdmin) {
        this.loadEnrollmentCount(this.courseId);
      }
    } else {
      this.errorMessage = 'Course ID not found';
      this.isLoading = false;
    }
  }

  loadCourseDetails(courseId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.courseService.getCourseById(courseId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && !Array.isArray(response.data)) {
          this.course = response.data;
        } else {
          this.errorMessage = 'Course not found';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load course details';
        console.error('Error loading course details:', error);
      }
    });
  }

  goBack(): void {
    if (this.currentUser?.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/student']);
    }
  }

  editCourse(): void {
    if (this.course?.id) {
      this.router.navigate(['/course-form', this.course.id]);
    }
  }

  deleteCourse(): void {
    if (this.course?.id && confirm('Are you sure you want to delete this course?')) {
      this.courseService.deleteCourse(this.course.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          console.error('Error deleting course:', error);
          alert('Failed to delete course');
        }
      });
    }
  }

  checkEnrollmentStatus(courseId: string): void {
    this.enrollmentService.isEnrolledInCourse(courseId).subscribe({
      next: (enrolled) => {
        this.isEnrolled = enrolled;
      },
      error: (error) => {
        console.error('Error checking enrollment status:', error);
        this.isEnrolled = false;
      }
    });
  }

  loadEnrollmentCount(courseId: string): void {
    this.courseService.getCourseEnrollmentCount(courseId).subscribe({
      next: (response) => {
        if (response.success) {
          this.enrollmentCount = response.data.enrollmentCount;
        }
      },
      error: (error) => {
        console.error('Error loading enrollment count:', error);
        this.enrollmentCount = 0;
      }
    });
  }

  enrollInCourse(): void {
    if (this.course?.id && !this.isEnrolled) {
      this.isEnrollmentLoading = true;
      
      this.enrollmentService.enrollInCourse(this.course.id).subscribe({
        next: (response) => {
          this.isEnrollmentLoading = false;
          if (response.success) {
            this.isEnrolled = true;
            alert('Successfully enrolled in the course!');
          } else {
            alert('Failed to enroll: ' + response.message);
          }
        },
        error: (error) => {
          this.isEnrollmentLoading = false;
          console.error('Error enrolling in course:', error);
          const errorMessage = error.error?.message || 'Failed to enroll in course';
          alert('Error: ' + errorMessage);
        }
      });
    }
  }

formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(price);
}

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDuration(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    
    if (days < 14) {
      return `${days} day${days === 1 ? '' : 's'}`;
    }
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  get isStudent(): boolean {
    return this.currentUser?.role === 'student';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getHeaderSubtitle(): string {
    return this.isAdmin ? 'Admin Dashboard' : 'Student Dashboard';
  }

  openContent(content: CourseContent): void {
    if (!content.filePath) {
      console.warn('No file path available for this content');
      return;
    }
    if (content.filePath.startsWith('http://') || content.filePath.startsWith('https://')) {
      window.open(content.filePath, '_blank', 'noopener,noreferrer');
    } else {
      const baseUrl = 'http://localhost:5000';
      const fullUrl = content.filePath.startsWith('/') 
        ? `${baseUrl}${content.filePath}` 
        : `${baseUrl}/${content.filePath}`;
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    }
  }
  getHeaderTitle(): string {
    return this.isAdmin ? 'Admin Dashboard' : 'Student Dashboard';
  }

  // Enrolled users modal methods
  showEnrolledUsers(): void {
    if (!this.courseId) return;
    
    this.showEnrolledUsersModal = true;
    this.loadEnrolledUsers();
  }

  closeEnrolledUsersModal(): void {
    this.showEnrolledUsersModal = false;
    this.enrolledUsers = [];
    this.enrolledUsersError = '';
  }

  loadEnrolledUsers(): void {
    if (!this.courseId) return;
    
    this.isLoadingEnrolledUsers = true;
    this.enrolledUsersError = '';
    
    this.courseService.getCourseEnrolledUsers(this.courseId).subscribe({
      next: (response) => {
        this.isLoadingEnrolledUsers = false;
        if (response.success) {
          this.enrolledUsers = response.data;
        } else {
          this.enrolledUsersError = response.message || 'Failed to load enrolled users';
        }
      },
      error: (error) => {
        this.isLoadingEnrolledUsers = false;
        this.enrolledUsersError = error.error?.message || 'Failed to load enrolled users';
        console.error('Error loading enrolled users:', error);
      }
    });
  }

  getUserInitials(userName: string): string {
    if (!userName || userName.trim() === '') return 'U';
    
    const names = userName.trim().split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    }
    return userName.charAt(0).toUpperCase();
  }
}
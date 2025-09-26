import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { map } from 'rxjs/operators';

export interface EnrollmentResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private apiUrl = 'http://localhost:5000/api/v1/enrollments';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  enrollInCourse(courseId: string): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<EnrollmentResponse>(
      `${this.apiUrl}/courses/${courseId}/enroll/`,
      {},
      { headers }
    );
  }

  getEnrolledCourses(): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    console.log('CourseService - Getting enrolled courses with headers:', headers);
    
    return this.http.get<any>('http://localhost:5000/api/v1/enrollments/enrollments', { headers })
      .pipe(
        map((response: any) => {
          console.log('CourseService - Enrolled courses response:', response);
          if (response.success && response.data) {
            // Transform enrollment data to course format
            const courses = response.data.map((enrollment: any) => enrollment.course);
            console.log('CourseService - Transformed courses:', courses);
            return {
              success: true,
              data: courses,
              message: response.message
            };
          }
          return response;
        })
      );
  }

  getEnrollments(): Observable<EnrollmentResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<EnrollmentResponse>(
      `${this.apiUrl}/enrollments`,
      { headers }
    );
  }


  isEnrolledInCourse(courseId: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.getEnrollments().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            const isEnrolled = response.data.some((enrollment: any) => 
              enrollment.course.id === courseId
            );
            observer.next(isEnrolled);
            observer.complete();
          } else {
            observer.next(false);
            observer.complete();
          }
        },
        error: (error) => {
          console.error('Error checking enrollment status:', error);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface CourseContent {
  id: string;
  title: string;
  contentType: 'pdf' | 'text';
  filePath: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  durationHours: number;
  isActive: boolean;
  created_at: string;
  updated_at: string;
  enrollmentCount?: number;
  contents?: CourseContent[];
}

export interface CourseResponse {
  success: boolean;
  message: string;
  data: Course | Course[];
  total?: number;
}

export interface CourseContentForm {
  title: string;
  contentType: 'pdf' | 'text';
  filePath: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  durationHours: number;
  isActive?: boolean;
  courseContent?: CourseContentForm[];
}

export interface CourseStats {
  total_courses: number;
  active_courses: number;
  total_enrollments: number;
  total_students: number;
}

export interface EnrolledUser {
  userId: string;
  userName: string;
  email: string;
  enrollmentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private adminApiUrl = 'http://localhost:5000/api/v1/admin';
  private publicApiUrl = 'http://localhost:5000/api/v1/courses';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createCourse(courseData: CreateCourseData): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.post<CourseResponse>(`${this.adminApiUrl}/courses`, courseData, { headers });
  }

  getAdminCourses(): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<CourseResponse>(`${this.publicApiUrl}/`, { headers });
  }


  updateCourse(courseId: string, courseData: Partial<CreateCourseData>): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.put<CourseResponse>(`${this.adminApiUrl}/courses/${courseId}`, courseData, { headers });
  }


  deleteCourse(courseId: string): Observable<CourseResponse> {
    const headers = this.getAuthHeaders();
    return this.http.delete<CourseResponse>(`${this.adminApiUrl}/courses/${courseId}`, { headers });
  }

  getPublicCourses(): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.publicApiUrl}`);
  }

  

  getCourseById(courseId: string): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.publicApiUrl}/${courseId}`);
  }

  getCourseEnrollmentCount(courseId: string): Observable<{success: boolean; data: {courseId: string; enrollmentCount: number}}> {
    const headers = this.getAuthHeaders();
    return this.http.get<{success: boolean; data: {courseId: string; enrollmentCount: number}}>(`${this.adminApiUrl}/courses/${courseId}/enrollment-count`, { headers });
  }

  getCourseEnrolledUsers(courseId: string): Observable<{success: boolean; data: EnrolledUser[]; message?: string}> {
    return this.http.get<{success: boolean; data: EnrolledUser[]; message?: string}>(`${this.adminApiUrl}/courses/${courseId}/users`, { headers: this.getAuthHeaders() });
  }
}

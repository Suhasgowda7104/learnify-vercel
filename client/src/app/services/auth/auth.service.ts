import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  message: string;
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/v1/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'learnify_token';

  constructor(private http: HttpClient) {
    this.checkExistingAuth();
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData, { headers })
      .pipe(
        tap(response => {
          console.log('AuthService - Raw registration response:', response);
          if (response.success && response.data) {
            console.log('AuthService - Setting auth data:', response.data);
            this.setAuthData(response.data.token, response.data.user);
          } else {
            console.warn('AuthService - Response missing data:', response);
          }
        }),
        catchError(error => {
          console.error('AuthService - Registration error:', error);
          throw error;
        })
      );
  }

  login(credentials: LoginData): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          if (response.success && response.data) {
            this.setAuthData(response.data.token, response.data.user);
          }
        })
      );
  }

  logout(): Observable<AuthResponse> {
    const headers = this.getAuthHeaders();
    
    return this.http.post<AuthResponse>(`${this.apiUrl}/logout`, {}, { headers })
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  private setAuthData(token: string, user: User): void {
    sessionStorage.setItem(this.tokenKey, token);
    sessionStorage.setItem('learnify_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    console.log('Session data stored successfully:', { token: token.substring(0, 20) + '...', user });
  }


  private clearAuthData(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem('learnify_user');
    this.currentUserSubject.next(null);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('Error checking token expiry:', error);
      return true;
    }
  }

  private checkExistingAuth(): void {
    const token = this.getToken();
    const userStr = sessionStorage.getItem('learnify_user');
    
    if (token && userStr && !this.isTokenExpired(token)) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        console.log('User session restored:', user);
      } catch (error) {
        console.warn('Error parsing stored user data:', error);
        this.clearAuthData();
      }
    } else {
      console.log('No valid session found');
      this.clearAuthData();
    }
  }
}
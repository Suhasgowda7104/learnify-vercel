import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { StudentDashboardComponent } from './student/student-dashboard/student-dashboard.component';
import { CourseFormComponent } from './admin/course-form/course-form.component';
import { CourseDetailComponent } from './shared/courses/course-detail/course-detail.component';
import { CourseListComponent } from './shared/courses/course-list/course-list.component';
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'student', component: StudentDashboardComponent },
  { path: 'course-form', component: CourseFormComponent },
  { path: 'course-form/:id', component: CourseFormComponent },
  { path: 'course-detail/:id', component: CourseDetailComponent },
  { path: 'course-list', component: CourseListComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
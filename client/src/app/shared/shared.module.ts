import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CourseListComponent } from './courses/course-list/course-list.component';
import { CourseDetailComponent } from './courses/course-detail/course-detail.component';
import { SearchPipe } from './pipes/search.pipe';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    CourseListComponent,
    CourseDetailComponent,
    SearchPipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    CourseListComponent,
    CourseDetailComponent
  ]
})
export class SharedModule { }

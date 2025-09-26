import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CourseService, CreateCourseData, CourseContentForm } from '../../services/course/course.service';

@Component({
  selector: 'app-course-form',
  standalone: false,
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.scss'
})
export class CourseFormComponent implements OnInit {
  @Output() courseCreated = new EventEmitter<void>();
  @Input() embedded = false;
  
  courseForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isEditMode = false;
  courseId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.courseId;
    
    if (this.isEditMode && this.courseId) {
      this.loadCourseData(this.courseId);
    }
  }

  private initializeForm(): void {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      durationHours: ['', [Validators.required]],
      isActive: [true],
      courseContent: this.fb.array([])
    });
  }


  private loadCourseData(courseId: string): void {
    this.courseService.getCourseById(courseId).subscribe({
      next: (response) => {
        if (response.success && !Array.isArray(response.data)) {
          const course = response.data;
          this.courseForm.patchValue({
            title: course.title,
            description: course.description,
            price: course.price,
            durationHours: this.formatDurationForEdit(course.durationHours),
            isActive: course.isActive
          });
          
          // Load course content if available
          if (course.contents && course.contents.length > 0) {
            const contentArray = this.courseContent;
            contentArray.clear();
            course.contents.forEach(content => {
              const contentGroup = this.fb.group({
                title: [content.title, [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
                contentType: [content.contentType, [Validators.required]],
                filePath: [content.filePath, [Validators.required, Validators.maxLength(500)]]
              });
              contentArray.push(contentGroup);
            });
          }
        }
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.errorMessage = 'Failed to load course data';
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const courseData: CreateCourseData = {
        title: this.courseForm.value.title,
        description: this.courseForm.value.description,
        price: parseFloat(this.courseForm.value.price),
        durationHours: this.parseDurationToHours(this.courseForm.value.durationHours),
        isActive: this.courseForm.value.isActive,
        courseContent: this.courseForm.value.courseContent || []
      };

      const operation = this.isEditMode && this.courseId
        ? this.courseService.updateCourse(this.courseId, courseData)
        : this.courseService.createCourse(courseData);

      operation.subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.successMessage = this.isEditMode 
              ? 'Course updated successfully!' 
              : 'Course created successfully!';
            
            if (!this.isEditMode) {
              this.courseForm.reset();
              this.courseForm.patchValue({ price: 0, durationHours: '', isActive: true });
            }
            
            this.courseCreated.emit();
            
            setTimeout(() => {
              if (this.isEditMode) {
                this.router.navigate(['/admin']);
              }
            }, 1500);
          } else {
            this.errorMessage = response.message || 'Operation failed';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'An error occurred while saving the course';
          console.error('Course operation error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }


  onCancel(): void {
    this.router.navigate(['/admin']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.courseForm.controls).forEach(key => {
      const control = this.courseForm.get(key);
      control?.markAsTouched();
    });
  }

  get title() {
    return this.courseForm.get('title');
  }

  get description() {
    return this.courseForm.get('description');
  }

  get price() {
    return this.courseForm.get('price');
  }

  get durationHours() {
    return this.courseForm.get('durationHours');
  }

  get isActive() {
    return this.courseForm.get('isActive');
  }

  get courseContent(): FormArray {
    return this.courseForm.get('courseContent') as FormArray;
  }

  createCourseContentFormGroup(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(255)]],
      contentType: ['text', [Validators.required]],
      filePath: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  addCourseContent(): void {
    this.courseContent.push(this.createCourseContentFormGroup());
  }

  removeCourseContent(index: number): void {
    this.courseContent.removeAt(index);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.courseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }


  getFieldError(fieldName: string): string {
    const field = this.courseForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} must not exceed ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors['min'].min}`;
      }
    }
    return '';
  }


  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      title: 'Course Name',
      description: 'Course Description',
      price: 'Price',
      durationHours: 'Duration'
    };
    return displayNames[fieldName] || fieldName;
  }

  private formatDurationForEdit(hours: number): string {
    if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    }
    const weeks = Math.round(hours / (24 * 7));
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }

  private parseDurationToHours(durationStr: string | number): number {
    if (typeof durationStr === 'number') {
      return durationStr;
    }

    const str = durationStr.toString().toLowerCase().trim();
    
    // Check if it's just a number (no units specified)
    const numberOnlyMatch = str.match(/^\d+$/);
    if (numberOnlyMatch) {
      return parseInt(numberOnlyMatch[0]);
    }
    
    const match = str.match(/\d+/);
    if (!match) return 1;
    
    const number = parseInt(match[0]);
    
    if (str.includes('week')) {
      return number * 24 * 7;
    } else if (str.includes('hour')) {
      return number;
    } else {
      // If no unit is specified but it's not just a number, default to hours
      return number;
    }
  }
}
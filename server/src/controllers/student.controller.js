import CourseService from '../services/course.service.js';
import studentService from '../services/student.service.js';
import db from '../models/index.js';

const { CourseContent } = db;

export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseService.getAllActiveCourses();
    res.status(200).json(courses);
  } catch (err) {
    console.error("Error fetching courses:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

export const getCourseById = async (req, res) => {
   const { id } = req.params;

  try {
    const course = await CourseService.getCourseById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};


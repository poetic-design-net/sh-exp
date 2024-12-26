import { Course, CreateCourseInput, UpdateCourseInput } from "types/course";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  getCourseBySlug,
  listCourses,
} from "app/actions/courses";

// Re-export server actions for client-side use
export {
  createCourse,
  updateCourse,
  deleteCourse,
  getCourse,
  getCourseBySlug,
  listCourses,
};
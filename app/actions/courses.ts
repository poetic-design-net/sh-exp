"use server";

import { revalidatePath } from "next/cache";
import { Course, CreateCourseInput, UpdateCourseInput, UserProgress, Certificate } from "types/course";
import {
  createCourse as createCourseServer,
  updateCourse as updateCourseServer,
  deleteCourse as deleteCourseServer,
  getCourse as getCourseServer,
  listCourses as listCoursesServer,
  getCourseBySlug as getCourseBySlugServer,
  updateUserProgress as updateUserProgressServer,
  getUserProgress as getUserProgressServer,
  listUserProgress as listUserProgressServer,
  createCertificate as createCertificateServer,
  getUserCertificates as getUserCertificatesServer,
  getCertificate as getCertificateServer,
  verifyCertificate as verifyCertificateServer,
} from "services/courses-server";

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const course = await createCourseServer(input);
  revalidatePath("/admin/courses");
  return course;
}

export async function updateCourse(
  id: string,
  input: UpdateCourseInput
): Promise<Course> {
  const course = await updateCourseServer(id, input);
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${id}`);
  return course;
}

export async function deleteCourse(id: string): Promise<void> {
  await deleteCourseServer(id);
  revalidatePath("/admin/courses");
}

export async function getCourse(id: string): Promise<Course | null> {
  return getCourseServer(id);
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return getCourseBySlugServer(slug);
}

export async function listCourses(): Promise<Course[]> {
  return listCoursesServer();
}

// Progress Tracking Actions
export async function updateUserProgress(
  userId: string,
  courseId: string,
  progress: Partial<UserProgress>
): Promise<UserProgress> {
  const currentProgress = await getUserProgressServer(userId, courseId) || {
    userId,
    courseId,
    completedItems: [],
    completedChapters: [],
    quizScores: [],
    isCompleted: false,
  };

  const updatedProgress = await updateUserProgressServer({
    ...currentProgress,
    ...progress,
  });

  revalidatePath(`/kurse/${courseId}`);
  return updatedProgress;
}

export async function getUserProgress(
  userId: string,
  courseId: string
): Promise<UserProgress | null> {
  return getUserProgressServer(userId, courseId);
}

export async function listUserProgress(userId: string): Promise<UserProgress[]> {
  return listUserProgressServer(userId);
}

// Zertifikat Actions
export async function createCertificate(
  userId: string,
  courseId: string,
  userName: string,
  courseName: string
): Promise<Certificate> {
  const certificate = await createCertificateServer(
    userId,
    courseId,
    userName,
    courseName
  );
  
  revalidatePath(`/kurse/${courseId}`);
  revalidatePath(`/profil/zertifikate`); // Angenommener Pfad für Zertifikate
  return certificate;
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  return getUserCertificatesServer(userId);
}

export async function getCertificate(id: string): Promise<Certificate | null> {
  return getCertificateServer(id);
}

export async function verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
  return verifyCertificateServer(certificateNumber);
}

// Helper function to check if a user can receive a certificate
export async function checkCertificateEligibility(
  userId: string,
  courseId: string
): Promise<boolean> {
  const progress = await getUserProgressServer(userId, courseId);
  const course = await getCourseServer(courseId);
  
  if (!progress || !course) {
    return false;
  }

  const requiredPercentage = course.requiredCompletionPercentage || 100;
  const totalItems = course.chapters.reduce(
    (sum, chapter) => sum + chapter.items.length,
    0
  );
  const completedItems = progress.completedItems.length;
  
  return (completedItems / totalItems) * 100 >= requiredPercentage;
}
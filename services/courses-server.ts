import { db } from "lib/firebase-admin-server";
import { Course, CreateCourseInput, UpdateCourseInput, UserProgress, Certificate } from "types/course";
import { generateSlug } from "lib/utils/slug";
import { customAlphabet } from 'nanoid';

const coursesRef = db.collection("courses");
const progressRef = db.collection("courseProgress");
const certificatesRef = db.collection("certificates");

// Generiere eindeutige Zertifikatsnummern
const generateCertificateNumber = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const now = new Date().toISOString();
  const slug = generateSlug(input.title);

  const course: Course = {
    ...input,
    id: coursesRef.doc().id,
    slug,
    createdAt: now,
    updatedAt: now,
  };

  await coursesRef.doc(course.id).set(course);
  return course;
}

export async function updateCourse(
  id: string,
  input: UpdateCourseInput
): Promise<Course> {
  const now = new Date().toISOString();
  const updates = {
    ...input,
    updatedAt: now,
    ...(input.title ? { slug: generateSlug(input.title) } : {}),
  };

  await coursesRef.doc(id).update(updates);
  
  const updatedDoc = await coursesRef.doc(id).get();
  if (!updatedDoc.exists) {
    throw new Error("Kurs nicht gefunden");
  }
  
  return updatedDoc.data() as Course;
}

export async function getCourse(id: string): Promise<Course | null> {
  const doc = await coursesRef.doc(id).get();
  return doc.exists ? (doc.data() as Course) : null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const snapshot = await coursesRef.where("slug", "==", slug).limit(1).get();
  return snapshot.empty ? null : (snapshot.docs[0].data() as Course);
}

export async function listCourses(): Promise<Course[]> {
  const snapshot = await coursesRef
    .orderBy("createdAt", "desc")
    .get();
  
  return snapshot.docs.map(doc => doc.data() as Course);
}

export async function deleteCourse(id: string): Promise<void> {
  await coursesRef.doc(id).delete();
}

// Progress Tracking Funktionen
export async function updateUserProgress(progress: Omit<UserProgress, "lastAccessedAt">): Promise<UserProgress> {
  const now = new Date().toISOString();
  const progressId = `${progress.userId}_${progress.courseId}`;
  
  const updatedProgress: UserProgress = {
    ...progress,
    lastAccessedAt: now,
  };

  await progressRef.doc(progressId).set(updatedProgress, { merge: true });
  return updatedProgress;
}

export async function getUserProgress(userId: string, courseId: string): Promise<UserProgress | null> {
  const progressId = `${userId}_${courseId}`;
  const doc = await progressRef.doc(progressId).get();
  return doc.exists ? (doc.data() as UserProgress) : null;
}

export async function listUserProgress(userId: string): Promise<UserProgress[]> {
  const snapshot = await progressRef
    .where("userId", "==", userId)
    .orderBy("lastAccessedAt", "desc")
    .get();
  
  return snapshot.docs.map(doc => doc.data() as UserProgress);
}

// Zertifikat Funktionen
export async function createCertificate(
  userId: string,
  courseId: string,
  userName: string,
  courseName: string
): Promise<Certificate> {
  const now = new Date().toISOString();
  
  const certificate: Certificate = {
    id: certificatesRef.doc().id,
    userId,
    courseId,
    userName,
    courseName,
    issueDate: now,
    completionDate: now,
    certificateNumber: generateCertificateNumber(),
  };

  await certificatesRef.doc(certificate.id).set(certificate);
  return certificate;
}

export async function getUserCertificates(userId: string): Promise<Certificate[]> {
  const snapshot = await certificatesRef
    .where("userId", "==", userId)
    .orderBy("issueDate", "desc")
    .get();
  
  return snapshot.docs.map(doc => doc.data() as Certificate);
}

export async function getCertificate(certificateId: string): Promise<Certificate | null> {
  const doc = await certificatesRef.doc(certificateId).get();
  return doc.exists ? (doc.data() as Certificate) : null;
}

export async function verifyCertificate(certificateNumber: string): Promise<Certificate | null> {
  const snapshot = await certificatesRef
    .where("certificateNumber", "==", certificateNumber)
    .limit(1)
    .get();
  
  return snapshot.empty ? null : (snapshot.docs[0].data() as Certificate);
}
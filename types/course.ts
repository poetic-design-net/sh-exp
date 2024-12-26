export type CourseContentType = "text" | "video-embed" | "image" | "image-grid" | "quiz";

export interface CourseContentItem {
  id: string;
  type: CourseContentType;
  title: string;
  content: string;
  order: number;
  images?: string[];
  questions?: {
    question: string;
    answers: string[];
    correctAnswer: number;
  }[];
}

export interface Chapter {
  id: string;
  title: string;
  description?: string;
  order: number;
  items: CourseContentItem[];
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedItems: string[]; // Array von CourseContentItem IDs
  completedChapters: string[]; // Array von Chapter IDs
  quizScores: {
    itemId: string;
    score: number;
    completedAt: string;
  }[];
  lastAccessedAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  userName: string;
  courseName: string;
  issueDate: string;
  completionDate: string;
  certificateNumber: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  chapters: Chapter[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
  certificateTemplate?: {
    enabled: boolean;
    customText?: string;
  };
  requiredCompletionPercentage?: number; // Prozentsatz der benötigten Completion für Zertifikat
}

export type CreateCourseInput = Omit<Course, "id" | "slug" | "createdAt" | "updatedAt">;
export type UpdateCourseInput = Partial<Omit<Course, "id" | "createdAt" | "updatedAt">>;
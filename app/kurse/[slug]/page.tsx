import { getCourseBySlug, getUserProgress } from "app/actions/courses";
import { notFound } from "next/navigation";
import { CourseView } from "./components/course-view";
import { auth } from "lib/firebase-admin-server";
import { cookies } from "next/headers";

interface CoursePageProps {
  params: {
    slug: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourseBySlug(params.slug);

  if (!course || !course.published) {
    notFound();
  }

  // Get the current user's session
  const sessionCookie = cookies().get("session")?.value;
  let userProgress = undefined;

  if (sessionCookie) {
    try {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      const progress = await getUserProgress(decodedClaims.uid, course.id);
      if (progress) {
        userProgress = progress;
      }
    } catch (error) {
      console.error("Error verifying session:", error);
    }
  }

  return (
    <div className="container py-6">
      <CourseView 
        course={course} 
        initialProgress={userProgress}
      />
    </div>
  );
}
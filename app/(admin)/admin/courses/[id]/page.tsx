import { getCourse } from "app/actions/courses";
import { CourseEditor } from "../components/course-editor";
import { notFound } from "next/navigation";

interface CoursePageProps {
  params: {
    id: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const course = await getCourse(params.id);

  if (!course) {
    notFound();
  }

  return (
    <div className="container py-6">
      <CourseEditor initialCourse={course} />
    </div>
  );
}
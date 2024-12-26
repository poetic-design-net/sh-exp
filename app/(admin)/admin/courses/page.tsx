import { Suspense } from "react";
import { CourseList } from "./components/course-list";
import { Button } from "components/ui/button";
import Link from "next/link";
import { listCourses } from "app/actions/courses";

export default async function CoursesPage() {
  const courses = await listCourses();

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Kurse</h1>
        <Button asChild>
          <Link href="/admin/courses/new">Neuen Kurs erstellen</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Lädt...</div>}>
        <CourseList courses={courses} />
      </Suspense>
    </div>
  );
}
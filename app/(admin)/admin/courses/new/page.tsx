import { redirect } from "next/navigation";
import { CourseEditor } from "../components/course-editor";
import { createCourse } from "app/actions/courses";
import { Course } from "types/course";

export default async function NewCoursePage() {
  const initialCourse: Course = {
    id: "",
    title: "",
    slug: "",
    description: "",
    thumbnail: "",
    chapters: [
      {
        id: crypto.randomUUID(),
        title: "Einführung",
        description: "",
        order: 0,
        items: []
      }
    ],
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    requiredCompletionPercentage: 100,
    certificateTemplate: {
      enabled: true,
      customText: "Hat erfolgreich den Kurs abgeschlossen"
    }
  };

  // Server Action zum Erstellen eines neuen Kurses
  const handleCreate = async () => {
    "use server";
    const course = await createCourse(initialCourse);
    redirect(`/admin/courses/${course.id}`);
  };

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Neuen Kurs erstellen</h1>
      <form action={handleCreate}>
        <CourseEditor initialCourse={initialCourse} />
      </form>
    </div>
  );
}
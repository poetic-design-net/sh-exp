"use client";

import { Course } from "types/course";
import { Button } from "components/ui/button";
import Link from "next/link";
import { formatDate } from "lib/utils";
import { ClientWrapper } from "components/admin/client-wrapper";
import { deleteCourse } from "app/actions/courses";
import { useRouter } from "next/navigation";
import { useToast } from "components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "components/ui/alert-dialog";

interface CourseListContentProps {
  courses: Course[];
}

function CourseListContent({ courses }: CourseListContentProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId);
      toast({
        title: "Kurs gelöscht",
        description: "Der Kurs wurde erfolgreich gelöscht.",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Fehler beim Löschen",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Noch keine Kurse erstellt</p>
        <Button asChild>
          <Link href="/admin/courses/new">Ersten Kurs erstellen</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <div
          key={course.id}
          className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center"
        >
          <div>
            <h3 className="font-medium">{course.title}</h3>
            <p className="text-sm text-gray-500">
              Erstellt am: {formatDate(course.createdAt)}
            </p>
            <p className="text-sm text-gray-500">
              Status: {course.published ? "Veröffentlicht" : "Entwurf"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/courses/${course.id}`}>Bearbeiten</Link>
            </Button>
            {course.published && (
              <Button asChild variant="outline">
                <Link href={`/kurse/${course.slug}`} target="_blank">
                  Ansehen
                </Link>
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Löschen</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Kurs löschen</AlertDialogTitle>
                  <AlertDialogDescription>
                    Möchten Sie diesen Kurs wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(course.id)}>
                    Löschen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CourseList({ courses }: { courses: Course[] }) {
  return (
    <ClientWrapper>
      <CourseListContent courses={courses} />
    </ClientWrapper>
  );
}
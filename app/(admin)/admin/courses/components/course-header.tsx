"use client";

import { Course } from "types/course";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { useRouter } from "next/navigation";
import { deleteCourse } from "app/actions/courses";
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

interface CourseHeaderProps {
  course: Course;
  isLoading: boolean;
  onUpdate: (updates: Partial<Course>) => void;
  onSave: () => void;
}

export function CourseHeader({ course, isLoading, onUpdate, onSave }: CourseHeaderProps) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await deleteCourse(course.id);
      toast({
        title: "Kurs gelöscht",
        description: "Der Kurs wurde erfolgreich gelöscht.",
      });
      router.push("/admin/courses");
    } catch (error) {
      toast({
        title: "Fehler beim Löschen",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
      <Input
        value={course.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Kurstitel eingeben"
        className="text-2xl font-bold"
      />
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => onUpdate({ published: !course.published })}
        >
          {course.published ? "Als Entwurf speichern" : "Veröffentlichen"}
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Speichert..." : "Speichern"}
        </Button>
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
              <AlertDialogAction onClick={handleDelete}>
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
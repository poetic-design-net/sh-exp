"use client";

import { Course } from "types/course";
import { Input } from "components/ui/input";
import { RichTextEditor } from "components/ui/rich-text-editor";

interface CourseSettingsProps {
  course: Course;
  onUpdate: (updates: Partial<Course>) => void;
}

export function CourseSettings({ course, onUpdate }: CourseSettingsProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <h2 className="text-lg font-semibold">Kurs-Einstellungen</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Benötigter Abschluss-Prozentsatz für Zertifikat
          </label>
          <Input
            type="number"
            min="0"
            max="100"
            value={course.requiredCompletionPercentage || 100}
            onChange={(e) => onUpdate({
              requiredCompletionPercentage: parseInt(e.target.value)
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Kursbeschreibung
          </label>
          <RichTextEditor
            value={course.description || ""}
            onChange={(value) => onUpdate({ description: value })}
          />
        </div>
      </div>
    </div>
  );
}
"use client";

import { Course } from "types/course";
import { ClientWrapper } from "components/admin/client-wrapper";
import { DragDropContext } from "@hello-pangea/dnd";
import { MediaPicker } from "components/ui/media-picker";
import { CourseHeader } from "./course-header";
import { ChapterList } from "./chapter-list";
import { CourseSettings } from "./course-settings";
import { useCourseState } from "../hooks/use-course-state";
import { handleDragEnd } from "../utils/drag-drop";

interface CourseEditorProps {
  initialCourse: Course;
}

function CourseEditorContent({ initialCourse }: CourseEditorProps) {
  const {
    course,
    isLoading,
    isMediaPickerOpen,
    editingItemId,
    mediaType,
    expandedChapters,
    selectedChapter,
    setIsMediaPickerOpen,
    setEditingItemId,
    setMediaType,
    setSelectedChapter,
    handleSave,
    handleAddChapter,
    handleUpdateChapter,
    handleDeleteChapter,
    handleAddContent,
    handleUpdateContent,
    handleDeleteContent,
    handleUpdateCourse,
    toggleChapter
  } = useCourseState(initialCourse);

  const onDragEnd = (result: any) => {
    const updatedCourse = handleDragEnd(result, course);
    if (updatedCourse) {
      handleUpdateCourse(updatedCourse);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-8">
        <CourseHeader
          course={course}
          isLoading={isLoading}
          onUpdate={handleUpdateCourse}
          onSave={handleSave}
        />

        <CourseSettings 
          course={course}
          onUpdate={handleUpdateCourse}
        />

        <ChapterList
          course={course}
          expandedChapters={expandedChapters}
          onToggleChapter={toggleChapter}
          onAddChapter={handleAddChapter}
          onUpdateChapter={handleUpdateChapter}
          onDeleteChapter={handleDeleteChapter}
          onAddContent={handleAddContent}
          onUpdateContent={handleUpdateContent}
          onDeleteContent={handleDeleteContent}
          setEditingItemId={setEditingItemId}
          setSelectedChapter={setSelectedChapter}
          setMediaType={setMediaType}
          setIsMediaPickerOpen={setIsMediaPickerOpen}
        />

        <MediaPicker
          open={isMediaPickerOpen}
          onSelect={(url) => {
            if (editingItemId && selectedChapter) {
              handleUpdateContent(selectedChapter, editingItemId, {
                content: url
              });
            }
            setIsMediaPickerOpen(false);
            setEditingItemId(null);
            setMediaType(null);
          }}
          onClose={() => {
            setIsMediaPickerOpen(false);
            setEditingItemId(null);
            setMediaType(null);
          }}
        />
      </div>
    </DragDropContext>
  );
}

export function CourseEditor({ initialCourse }: CourseEditorProps) {
  return (
    <ClientWrapper>
      <CourseEditorContent initialCourse={initialCourse} />
    </ClientWrapper>
  );
}
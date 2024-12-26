"use client";

import { Chapter, Course } from "types/course";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import { Droppable } from "@hello-pangea/dnd";
import { ChapterItem } from "./chapter-item";

interface ChapterListProps {
  course: Course;
  expandedChapters: string[];
  onToggleChapter: (chapterId: string) => void;
  onAddChapter: () => void;
  onUpdateChapter: (chapterId: string, updates: Partial<Chapter>) => void;
  onDeleteChapter: (chapterId: string) => void;
  onAddContent: (chapterId: string, type: "text" | "video-embed" | "image-grid" | "quiz") => void;
  onUpdateContent: (chapterId: string, itemId: string, updates: any) => void;
  onDeleteContent: (chapterId: string, itemId: string) => void;
  setEditingItemId: (id: string | null) => void;
  setSelectedChapter: (id: string | null) => void;
  setMediaType: (type: 'image-grid' | null) => void;
  setIsMediaPickerOpen: (isOpen: boolean) => void;
}

export function ChapterList({
  course,
  expandedChapters,
  onToggleChapter,
  onAddChapter,
  onUpdateChapter,
  onDeleteChapter,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  setEditingItemId,
  setSelectedChapter,
  setMediaType,
  setIsMediaPickerOpen,
}: ChapterListProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Kapitel</h2>
        <Button onClick={onAddChapter}>
          <Plus className="w-4 h-4 mr-2" />
          Kapitel hinzufügen
        </Button>
      </div>

      <Droppable droppableId="chapters-main">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-4"
          >
            {course.chapters
              .sort((a, b) => a.order - b.order)
              .map((chapter, index) => (
                <ChapterItem
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  isExpanded={expandedChapters.includes(chapter.id)}
                  onToggle={() => onToggleChapter(chapter.id)}
                  onUpdate={(updates) => onUpdateChapter(chapter.id, updates)}
                  onDelete={() => onDeleteChapter(chapter.id)}
                  onAddContent={(type) => onAddContent(chapter.id, type)}
                  onUpdateContent={(itemId, updates) => onUpdateContent(chapter.id, itemId, updates)}
                  onDeleteContent={(itemId) => onDeleteContent(chapter.id, itemId)}
                  setEditingItemId={setEditingItemId}
                  setSelectedChapter={setSelectedChapter}
                  setMediaType={setMediaType}
                  setIsMediaPickerOpen={setIsMediaPickerOpen}
                />
              ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
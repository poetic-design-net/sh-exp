"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "components/ui/use-toast";
import { Course, CourseContentItem, CourseContentType, Chapter } from "types/course";
import { generateSlug } from "lib/utils/slug";
import { updateCourse } from "app/actions/courses";
import { ClientWrapper } from "components/admin/client-wrapper";
import { DragDropContext } from "@hello-pangea/dnd";
import { MediaPicker } from "components/ui/media-picker";
import { RichTextEditor } from "components/ui/rich-text-editor";
import { Input } from "components/ui/input";
import { CourseHeader } from "./course-header";
import { ChapterList } from "./chapter-list";

interface CourseEditorProps {
  initialCourse: Course;
}

function CourseEditorContent({ initialCourse }: CourseEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course>(initialCourse);
  const [isLoading, setIsLoading] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image-grid' | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

  const handleSave = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await updateCourse(course.id, {
        ...course,
        slug: generateSlug(course.title)
      });
      toast({
        title: "Erfolgreich gespeichert",
        description: "Die Änderungen wurden erfolgreich gespeichert.",
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const [sourceType, sourceId] = result.source.droppableId.split('-');
    const [destType, destId] = result.destination.droppableId.split('-');

    if (sourceType === 'chapters') {
      const chapters = Array.from(course.chapters);
      const [removed] = chapters.splice(result.source.index, 1);
      chapters.splice(result.destination.index, 0, removed);
      
      const updatedChapters = chapters.map((chapter, index) => ({
        ...chapter,
        order: index
      }));

      setCourse(prev => ({ ...prev, chapters: updatedChapters }));
    } else if (sourceType === 'items' && destType === 'items' && sourceId === destId) {
      const chapter = course.chapters.find(c => c.id === sourceId);
      if (!chapter) return;

      const items = Array.from(chapter.items);
      const [removed] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, removed);

      const updatedItems = items.map((item, index) => ({
        ...item,
        order: index
      }));

      setCourse(prev => ({
        ...prev,
        chapters: prev.chapters.map(c =>
          c.id === sourceId
            ? { ...c, items: updatedItems }
            : c
        )
      }));
    }
  };

  const handleAddChapter = () => {
    const newChapter: Chapter = {
      id: crypto.randomUUID(),
      title: "Neues Kapitel",
      description: "",
      order: course.chapters.length,
      items: []
    };
    setCourse(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter]
    }));
    setExpandedChapters(prev => [...prev, newChapter.id]);
  };

  const handleUpdateChapter = (chapterId: string, updates: Partial<Chapter>) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === chapterId
          ? { ...chapter, ...updates }
          : chapter
      )
    }));
  };

  const handleDeleteChapter = (chapterId: string) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.filter(chapter => chapter.id !== chapterId)
    }));
    setExpandedChapters(prev => prev.filter(id => id !== chapterId));
  };

  const handleAddContent = (chapterId: string, type: CourseContentType) => {
    const chapter = course.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const newItem: CourseContentItem = {
      id: crypto.randomUUID(),
      type,
      title: '',
      content: '',
      order: chapter.items.length,
      ...(type === 'image-grid' ? { images: [] } : {}),
      ...(type === 'quiz' ? { questions: [] } : {})
    };

    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === chapterId
          ? { ...c, items: [...c.items, newItem] }
          : c
      )
    }));
    setEditingItemId(newItem.id);
  };

  const handleUpdateContent = (chapterId: string, itemId: string, updates: Partial<CourseContentItem>) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              items: chapter.items.map(item =>
                item.id === itemId
                  ? { ...item, ...updates }
                  : item
              )
            }
          : chapter
      )
    }));
  };

  const handleDeleteContent = (chapterId: string, itemId: string) => {
    setCourse(prev => ({
      ...prev,
      chapters: prev.chapters.map(chapter =>
        chapter.id === chapterId
          ? {
              ...chapter,
              items: chapter.items.filter(item => item.id !== itemId)
            }
          : chapter
      )
    }));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        <CourseHeader
          course={course}
          isLoading={isLoading}
          onUpdate={(updates) => setCourse(prev => ({ ...prev, ...updates }))}
          onSave={handleSave}
        />

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
                onChange={(e) => setCourse(prev => ({
                  ...prev,
                  requiredCompletionPercentage: parseInt(e.target.value)
                }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Kursbeschreibung
              </label>
              <RichTextEditor
                value={course.description || ""}
                onChange={(value) => setCourse(prev => ({ ...prev, description: value }))}
              />
            </div>
          </div>
        </div>

        <ChapterList
          course={course}
          expandedChapters={expandedChapters}
          onToggleChapter={(chapterId) => {
            setExpandedChapters(prev =>
              prev.includes(chapterId)
                ? prev.filter(id => id !== chapterId)
                : [...prev, chapterId]
            );
          }}
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
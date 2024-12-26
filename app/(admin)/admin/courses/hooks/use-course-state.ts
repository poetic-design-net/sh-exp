"use client";

import { useState } from "react";
import { Course, Chapter, CourseContentItem, CourseContentType } from "types/course";
import { generateSlug } from "lib/utils/slug";
import { updateCourse } from "app/actions/courses";
import { useRouter } from "next/navigation";
import { useToast } from "components/ui/use-toast";

export function useCourseState(initialCourse: Course) {
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

  const handleUpdateCourse = (updates: Partial<Course>) => {
    setCourse(prev => ({ ...prev, ...updates }));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  return {
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
  };
}
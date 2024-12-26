import { Course } from "types/course";

interface DragEndResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}

export function handleDragEnd(result: DragEndResult, course: Course): Course | null {
  if (!result.destination) {
    return null;
  }

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

    return { ...course, chapters: updatedChapters };
  }

  if (sourceType === 'items' && destType === 'items' && sourceId === destId) {
    const chapter = course.chapters.find(c => c.id === sourceId);
    if (!chapter) {
      return null;
    }

    const items = Array.from(chapter.items);
    const [removed] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, removed);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index
    }));

    return {
      ...course,
      chapters: course.chapters.map(c =>
        c.id === sourceId
          ? { ...c, items: updatedItems }
          : c
      )
    };
  }

  return null;
}
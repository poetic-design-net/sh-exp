"use client";

import { Chapter, CourseContentItem } from "types/course";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { RichTextEditor } from "components/ui/rich-text-editor";
import { GripVertical, ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { ContentEditor } from "./content-editor";

interface ChapterItemProps {
  chapter: Chapter;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Chapter>) => void;
  onDelete: () => void;
  onAddContent: (type: "text" | "video-embed" | "image-grid" | "quiz") => void;
  onUpdateContent: (itemId: string, updates: Partial<CourseContentItem>) => void;
  onDeleteContent: (itemId: string) => void;
  setEditingItemId: (id: string | null) => void;
  setSelectedChapter: (id: string | null) => void;
  setMediaType: (type: 'image-grid' | null) => void;
  setIsMediaPickerOpen: (isOpen: boolean) => void;
}

export function ChapterItem({
  chapter,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddContent,
  onUpdateContent,
  onDeleteContent,
  setEditingItemId,
  setSelectedChapter,
  setMediaType,
  setIsMediaPickerOpen,
}: ChapterItemProps) {
  return (
    <Draggable draggableId={`chapter-${chapter.id}`} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="border rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <div {...provided.dragHandleProps}>
              <GripVertical className="w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={onToggle}
              className="flex items-center gap-2 flex-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              <Input
                value={chapter.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="Kapiteltitel"
              />
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-4 pl-8 space-y-4">
              <RichTextEditor
                value={chapter.description || ""}
                onChange={(value) => onUpdate({ description: value })}
                placeholder="Kapitelbeschreibung"
              />

              <Droppable droppableId={`items-${chapter.id}`}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {chapter.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, itemIndex) => (
                        <Draggable
                          key={item.id}
                          draggableId={`item-${item.id}`}
                          index={itemIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-50 p-4 rounded-lg"
                            >
                              <ContentEditor
                                item={item}
                                onUpdate={(updates) => onUpdateContent(item.id, updates)}
                                onDelete={() => onDeleteContent(item.id)}
                                setEditingItemId={setEditingItemId}
                                setSelectedChapter={setSelectedChapter}
                                setMediaType={setMediaType}
                                setIsMediaPickerOpen={setIsMediaPickerOpen}
                                chapterId={chapter.id}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              <div className="flex gap-2">
                <Button
                  onClick={() => onAddContent('text')}
                  variant="outline"
                  size="sm"
                >
                  Text
                </Button>
                <Button
                  onClick={() => onAddContent('video-embed')}
                  variant="outline"
                  size="sm"
                >
                  Video
                </Button>
                <Button
                  onClick={() => {
                    setMediaType('image-grid');
                    onAddContent('image-grid');
                  }}
                  variant="outline"
                  size="sm"
                >
                  Bildergalerie
                </Button>
                <Button
                  onClick={() => onAddContent('quiz')}
                  variant="outline"
                  size="sm"
                >
                  Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
}
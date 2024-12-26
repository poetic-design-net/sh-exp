"use client";

import { CourseContentItem } from "types/course";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { RichTextEditor } from "components/ui/rich-text-editor";
import { Plus, X } from "lucide-react";

interface ContentEditorProps {
  item: CourseContentItem;
  onUpdate: (updates: Partial<CourseContentItem>) => void;
  onDelete: () => void;
  setEditingItemId: (id: string | null) => void;
  setSelectedChapter: (id: string | null) => void;
  setMediaType: (type: 'image-grid' | null) => void;
  setIsMediaPickerOpen: (isOpen: boolean) => void;
  chapterId: string;
}

export function ContentEditor({
  item,
  onUpdate,
  onDelete,
  setEditingItemId,
  setSelectedChapter,
  setMediaType,
  setIsMediaPickerOpen,
  chapterId,
}: ContentEditorProps) {
  switch (item.type) {
    case "text":
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Titel eingeben"
              className="mb-2"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <RichTextEditor
            value={item.content}
            onChange={(value) => onUpdate({ content: value })}
          />
        </div>
      );

    case "video-embed":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Titel eingeben"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={item.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Video-ID oder URL eingeben (YouTube oder Vimeo)"
            />
          </div>
        </div>
      );

    case "image-grid":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Titel eingeben"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {item.images?.map((imageUrl, imageIndex) => (
              <div key={imageIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    const newImages = item.images?.filter((_, i) => i !== imageIndex);
                    onUpdate({ images: newImages });
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            <Button
              onClick={() => {
                setEditingItemId(item.id);
                setSelectedChapter(chapterId);
                setMediaType('image-grid');
                setIsMediaPickerOpen(true);
              }}
              variant="outline"
              className="aspect-square flex flex-col items-center justify-center"
            >
              <Plus className="w-6 h-6 mb-2" />
              Bild hinzufügen
            </Button>
          </div>
        </div>
      );

    case "quiz":
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Input
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Titel eingeben"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-6">
            {item.questions?.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  value={question.question}
                  onChange={(e) =>
                    onUpdate({
                      questions: item.questions?.map((q, idx) =>
                        idx === questionIndex
                          ? { ...q, question: e.target.value }
                          : q
                      )
                    })
                  }
                  placeholder="Frage eingeben"
                />
                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answerIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={question.correctAnswer === answerIndex}
                        onChange={() =>
                          onUpdate({
                            questions: item.questions?.map((q, idx) =>
                              idx === questionIndex
                                ? { ...q, correctAnswer: answerIndex }
                                : q
                            )
                          })
                        }
                      />
                      <Input
                        value={answer}
                        onChange={(e) => {
                          const newAnswers = [...question.answers];
                          newAnswers[answerIndex] = e.target.value;
                          onUpdate({
                            questions: item.questions?.map((q, idx) =>
                              idx === questionIndex
                                ? { ...q, answers: newAnswers }
                                : q
                            )
                          });
                        }}
                        placeholder={`Antwort ${answerIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <Button
              onClick={() => {
                const newQuestion = {
                  question: '',
                  answers: ['', '', '', ''],
                  correctAnswer: 0
                };
                onUpdate({
                  questions: [...(item.questions || []), newQuestion]
                });
              }}
              variant="outline"
              className="w-full"
            >
              Frage hinzufügen
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
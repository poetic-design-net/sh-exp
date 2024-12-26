"use client";

import { Button } from "components/ui/button";
import { CourseContentType } from "types/course";

interface ContentTypeButtonsProps {
  onAddContent: (type: CourseContentType) => void;
  setMediaType: (type: 'image-grid' | null) => void;
}

export function ContentTypeButtons({
  onAddContent,
  setMediaType
}: ContentTypeButtonsProps) {
  return (
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
  );
}
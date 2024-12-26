import { useState } from 'react';
import { ContentBlock, ContentBlockType } from '@/types/page-template';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MediaPicker } from '@/components/ui/media-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContentBlockEditorProps {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
}

export function ContentBlockEditor({
  block,
  onChange,
  onDelete,
}: ContentBlockEditorProps) {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const updateBlock = (updates: Partial<ContentBlock>) => {
    onChange({
      ...block,
      ...updates,
    });
  };

  const updateContent = (updates: Partial<typeof block.content>) => {
    updateBlock({
      content: {
        ...block.content,
        ...updates,
      },
    });
  };

  const updateLayout = (updates: Partial<typeof block.layout>) => {
    updateBlock({
      layout: {
        ...block.layout,
        ...updates,
      },
    });
  };

  const handleMediaSelect = (url: string) => {
    if (block.type === 'gallery') {
      updateContent({
        mediaUrls: [...(block.content.mediaUrls || []), url],
      });
    } else {
      updateContent({ mediaUrl: url });
    }
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Select
          value={block.type}
          onValueChange={(value: ContentBlockType) =>
            updateBlock({ type: value })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Block-Typ auswählen" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="header">Überschrift</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="media">Medien</SelectItem>
            <SelectItem value="gallery">Galerie</SelectItem>
            <SelectItem value="download">Download</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="sm" onClick={onDelete}>
          Löschen
        </Button>
      </div>

      <div className="space-y-4">
        {/* Content Fields based on block type */}
        {block.type === 'header' && (
          <>
            <div className="space-y-2">
              <Label>Titel</Label>
              <Input
                value={block.content.title || ''}
                onChange={(e) => updateContent({ title: e.target.value })}
                placeholder="Hauptüberschrift eingeben"
              />
            </div>
            <div className="space-y-2">
              <Label>Untertitel</Label>
              <Input
                value={block.content.subtitle || ''}
                onChange={(e) => updateContent({ subtitle: e.target.value })}
                placeholder="Untertitel eingeben"
              />
            </div>
          </>
        )}

        {(block.type === 'text' || block.type === 'download') && (
          <div className="space-y-2">
            <Label>Text</Label>
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              placeholder="Text eingeben"
              rows={4}
            />
          </div>
        )}

        {(block.type === 'media' ||
          block.type === 'video' ||
          block.type === 'audio' ||
          block.type === 'download') && (
          <>
            <div className="space-y-2">
              <Label>Medien</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={block.content.mediaUrl || ''}
                  readOnly
                  placeholder="Keine Medien ausgewählt"
                />
                <Button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                >
                  Auswählen
                </Button>
              </div>
            </div>
            {block.content.mediaUrl && (
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Input
                  value={block.content.description || ''}
                  onChange={(e) =>
                    updateContent({ description: e.target.value })
                  }
                  placeholder="Medienbeschreibung eingeben"
                />
              </div>
            )}
          </>
        )}

        {block.type === 'gallery' && (
          <div className="space-y-2">
            <Label>Galerie Bilder</Label>
            <div className="grid grid-cols-3 gap-2">
              {block.content.mediaUrls?.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square border rounded"
                >
                  <img
                    src={url}
                    alt=""
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1"
                    onClick={() =>
                      updateContent({
                        mediaUrls: block.content.mediaUrls?.filter(
                          (_, i) => i !== index
                        ),
                      })
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                className="aspect-square"
                onClick={() => setIsMediaPickerOpen(true)}
              >
                + Bild hinzufügen
              </Button>
            </div>
          </div>
        )}
      </div>

      <MediaPicker
        open={isMediaPickerOpen}
        onSelect={handleMediaSelect}
        onClose={() => setIsMediaPickerOpen(false)}
      />
    </div>
  );
}

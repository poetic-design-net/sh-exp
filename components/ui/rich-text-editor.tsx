"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { Node } from '@tiptap/core';
import { useId, useState } from 'react';
import { Button } from './button';
import { MediaPicker } from './media-picker';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Undo,
  Redo,
  Image as ImageIcon,
  Table as TableIcon,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Highlighter,
  Palette,
  Save,
  Eraser,
  Plus
} from 'lucide-react';

import 'app/styles/rich-text-editor.css';

// Custom Vimeo extension
const Vimeo = Node.create({
  name: 'vimeo',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null
      },
      width: {
        default: '100%'
      },
      height: {
        default: '400'
      }
    }
  },
  parseHTML() {
    return [{
      tag: 'iframe[src*="vimeo.com"]'
    }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', { class: 'vimeo-wrapper' }, [
      'iframe', {
        ...HTMLAttributes,
        frameborder: '0',
        allowfullscreen: 'true',
        allow: 'autoplay; fullscreen; picture-in-picture'
      }
    ]]
  }
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minHeight?: number;
  placeholder?: string;
}

export function RichTextEditor({ 
  value, 
  onChange, 
  className = "", 
  minHeight = 300,
  placeholder = "Start writing..."
}: RichTextEditorProps) {
  const id = useId();
  const [localContent, setLocalContent] = useState(value);
  const [isDirty, setIsDirty] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full'
        }
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border hover:bg-gray-50'
        }
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border p-2'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border p-2 bg-gray-100 font-bold'
        }
      }),
      Vimeo,
    ],
    content: localContent,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setLocalContent(newContent);
      setIsDirty(true);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4 bg-white`,
        style: `min-height: ${minHeight}px`
      },
    }
  });

  if (!editor) {
    return null;
  }

  const handleSave = () => {
    onChange(localContent);
    setIsDirty(false);
  };

  const addLink = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleMediaSelect = (url: string) => {
    if (mediaType === 'image') {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (mediaType === 'video' && url.includes('vimeo.com')) {
      // Convert normal Vimeo URL to embed URL
      const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
      if (vimeoId) {
        editor.chain().focus().insertContent({
          type: 'vimeo',
          attrs: {
            src: `https://player.vimeo.com/video/${vimeoId}`
          }
        }).run();
      }
    }
    setIsMediaPickerOpen(false);
    setMediaType(null);
  };

  const openMediaPicker = (type: 'image' | 'video') => {
    setMediaType(type);
    setIsMediaPickerOpen(true);
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const setColor = () => {
    const color = window.prompt('Color (hex, rgb, or color name)', '#000000');
    if (color) {
      editor.chain().focus().setColor(color).run();
    }
  };

  const setHighlight = () => {
    const color = window.prompt('Highlight color (hex, rgb, or color name)', '#ffeb3b');
    if (color) {
      editor.chain().focus().setHighlight({ color }).run();
    }
  };

  const clearFormatting = () => {
    editor.chain()
      .focus()
      .unsetAllMarks() // Entfernt alle Textformatierungen (bold, italic, etc.)
      .clearNodes()    // Entfernt Block-Level Formatierungen (headings, lists, etc.)
      .setParagraph() // Setzt den Block zurück auf einen normalen Paragraphen
      .run();
  };

  return (
    <div className={`border rounded-md ${className}`}>
      <div className="border-b p-2 flex flex-wrap gap-1 bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <div className="flex gap-1">
          {([1, 2, 3, 4, 5, 6] as const).map((level) => (
            <Button
              key={level}
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
              data-active={editor.isActive('heading', { level })}
              className={editor.isActive('heading', { level }) ? 'bg-gray-200' : ''}
            >
              {level === 1 && <Heading1 className="h-4 w-4" />}
              {level === 2 && <Heading2 className="h-4 w-4" />}
              {level === 3 && <Heading3 className="h-4 w-4" />}
              {level === 4 && <Heading4 className="h-4 w-4" />}
              {level === 5 && <Heading5 className="h-4 w-4" />}
              {level === 6 && <Heading6 className="h-4 w-4" />}
            </Button>
          ))}
        </div>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          data-active={editor.isActive('underline')}
          className={editor.isActive('underline') ? 'bg-gray-200' : ''}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          data-active={editor.isActive('strike')}
          className={editor.isActive('strike') ? 'bg-gray-200' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={addLink}
          data-active={editor.isActive('link')}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFormatting}
          title="Formatierung entfernen"
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          data-active={editor.isActive({ textAlign: 'left' })}
          className={editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          data-active={editor.isActive({ textAlign: 'center' })}
          className={editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          data-active={editor.isActive({ textAlign: 'right' })}
          className={editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          data-active={editor.isActive({ textAlign: 'justify' })}
          className={editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const menu = document.createElement('div');
            menu.className = 'absolute bg-white shadow-lg rounded-md p-2 flex flex-col gap-2';
            menu.style.top = '100%';
            menu.style.left = '0';
            menu.innerHTML = `
              <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                <span class="w-4 h-4"><svg>...</svg></span>
                Bild
              </button>
              <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                <span class="w-4 h-4"><svg>...</svg></span>
                Video
              </button>
              <button class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-md">
                <span class="w-4 h-4"><svg>...</svg></span>
                Tabelle
              </button>
            `;
            
            const imageBtn = menu.children[0];
            const videoBtn = menu.children[1];
            const tableBtn = menu.children[2];
            
            imageBtn.addEventListener('click', () => openMediaPicker('image'));
            videoBtn.addEventListener('click', () => openMediaPicker('video'));
            tableBtn.addEventListener('click', addTable);
            
            document.body.appendChild(menu);
            
            const closeMenu = () => {
              document.body.removeChild(menu);
              document.removeEventListener('click', closeMenu);
            };
            
            setTimeout(() => {
              document.addEventListener('click', closeMenu);
            }, 0);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={setHighlight}
          data-active={editor.isActive('highlight')}
          className={editor.isActive('highlight') ? 'bg-gray-200' : ''}
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={setColor}
          data-active={editor.isActive('textStyle')}
          className={editor.isActive('textStyle') ? 'bg-gray-200' : ''}
        >
          <Palette className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          disabled={!isDirty}
          className="ml-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          Änderungen speichern
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[200px]" 
      />
      <MediaPicker
        open={isMediaPickerOpen}
        onSelect={handleMediaSelect}
        onClose={() => {
          setIsMediaPickerOpen(false);
          setMediaType(null);
        }}
      />
    </div>
  );
}

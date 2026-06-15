'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Highlighter,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Quote,
  Code,
  RemoveFormatting,
  Palette,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Unique key to force re-mount when content changes externally (e.g., template load) */
  contentKey?: string | number;
}

const TOOLBAR_BUTTON_CLASS =
  'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';
const ACTIVE_BUTTON_CLASS =
  'bg-brand-gold/10 text-brand-gold hover:bg-brand-gold/20 dark:bg-brand-gold/15 dark:text-brand-gold';

const DIVIDER = <div className="mx-1 h-6 w-px bg-gray-200 dark:bg-gray-700" />;

export function RichTextEditor({ value, onChange, placeholder, contentKey }: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const isInternalUpdate = useRef(false);
  const lastSyncedValue = useRef<string | null>(null);

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline.configure({
        HTMLAttributes: { class: 'underline' },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-500 underline' },
      }),
      Image,
      TextStyle,
      Color,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] px-4 py-3 text-sm',
        'data-placeholder': placeholder || 'Write your email here...',
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true;
      const html = editor.getHTML();
      lastSyncedValue.current = html;
      onChange(html);
      // Reset flag after a short delay
      setTimeout(() => {
        isInternalUpdate.current = false;
      }, 0);
    },
  });

  // Sync external value changes (from templates, forward, reply, etc.)
  useEffect(() => {
    if (!editor) return;
    // Skip if this was an internal update (user typing)
    if (isInternalUpdate.current) return;
    // Skip if we already synced this value
    if (lastSyncedValue.current === value) return;
    // Only update if value is different from current editor content
    const currentContent = editor.getHTML();
    if (value && value !== currentContent && value !== lastSyncedValue.current) {
      lastSyncedValue.current = value;
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const addLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const colors = [
    '#000000',
    '#434343',
    '#666666',
    '#999999',
    '#b7b7b7',
    '#cccccc',
    '#d9d9d9',
    '#efefef',
    '#f3f3f3',
    '#ffffff',
    '#980000',
    '#ff0000',
    '#ff9900',
    '#ffff00',
    '#00ff00',
    '#00ffff',
    '#4a86e8',
    '#0000ff',
    '#9900ff',
    '#ff00ff',
    '#e6b8af',
    '#f4cccc',
    '#fce5cd',
    '#fff2cc',
    '#d9ead3',
    '#d0e0e3',
    '#c9daf8',
    '#cfe2f3',
    '#d9d2e9',
    '#ead1dc',
  ];

  if (!editor) return null;

  return (
    <div className="dark:bg-brand-dark-surface overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-gray-100 bg-gray-50/50 px-2 py-1.5 dark:border-gray-800 dark:bg-gray-900/30">
        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={TOOLBAR_BUTTON_CLASS}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={TOOLBAR_BUTTON_CLASS}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Headings */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('heading', { level: 1 }) ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('heading', { level: 2 }) ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('bold') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('italic') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('underline') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('strike') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('highlight') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </button>

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className={TOOLBAR_BUTTON_CLASS}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 grid w-[220px] grid-cols-10 gap-1 rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run();
                    setShowColorPicker(false);
                  }}
                  className="h-5 w-5 rounded border border-gray-200 transition-transform hover:scale-110 dark:border-gray-600"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>

        {DIVIDER}

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('bulletList') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('orderedList') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Alignment */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive({ textAlign: 'left' }) ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive({ textAlign: 'center' }) ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive({ textAlign: 'right' }) ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Block Elements */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('blockquote') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('codeBlock') ? ACTIVE_BUTTON_CLASS : ''}`}
          title="Code Block"
        >
          <Code className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Link */}
        <div className="relative">
          <button
            onClick={() => {
              if (editor.isActive('link')) {
                editor.chain().focus().unsetLink().run();
              } else {
                setShowLinkInput(!showLinkInput);
              }
            }}
            className={`${TOOLBAR_BUTTON_CLASS} ${editor.isActive('link') ? ACTIVE_BUTTON_CLASS : ''}`}
            title="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          {showLinkInput && (
            <div className="absolute top-full left-0 z-50 mt-1 flex gap-1 rounded-lg border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                className="focus:border-brand-gold w-48 rounded-md border border-gray-200 bg-transparent px-2 py-1 text-xs focus:outline-none dark:border-gray-600 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                autoFocus
              />
              <button
                onClick={addLink}
                className="bg-brand-gold text-brand-navy rounded-md px-2 py-1 text-xs font-semibold hover:opacity-90"
              >
                Add
              </button>
            </div>
          )}
        </div>

        {/* Image */}
        <button onClick={addImage} className={TOOLBAR_BUTTON_CLASS} title="Insert Image">
          <ImageIcon className="h-4 w-4" />
        </button>

        {DIVIDER}

        {/* Clear Formatting */}
        <button
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className={TOOLBAR_BUTTON_CLASS}
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Placeholder styling and email content styles */}
      <style jsx global>{`
        .tiptap {
          min-height: 300px;
        }
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .tiptap table {
          border-collapse: collapse;
          margin: 0;
          width: 100%;
        }
        .tiptap td,
        .tiptap th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        .tiptap img {
          max-width: 100%;
          height: auto;
        }
        .tiptap a {
          color: #2563eb;
          text-decoration: underline;
        }
        .tiptap h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        .tiptap h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        .tiptap h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
        }
        .tiptap ul,
        .tiptap ol {
          padding-left: 2em;
          margin: 1em 0;
        }
        .tiptap blockquote {
          border-left: 3px solid #ddd;
          margin-left: 0;
          margin-right: 0;
          padding-left: 1em;
          color: #666;
        }
        .tiptap pre {
          background: #f4f4f4;
          border-radius: 4px;
          padding: 0.75em 1em;
          font-family: monospace;
        }
        .tiptap code {
          background: #f4f4f4;
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-family: monospace;
        }
        .tiptap mark {
          background-color: #fef08a;
          padding: 0.1em 0;
        }
      `}</style>
    </div>
  );
}

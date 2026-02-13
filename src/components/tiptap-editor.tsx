"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Unlink,
  CodeSquare,
  Send,
  Image as ImageIcon,
} from "lucide-react";
import { useCallback, useState, useRef } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "tiptap-editor-content";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  onSubmit?: (html: string, mediaFiles?: File[]) => void;
  placeholder?: string;
  storageKey?: string;
  submitLabel?: string;
  disabled?: boolean;
}

export default function TiptapEditor({
  content = "",
  onChange,
  onSubmit,
  placeholder = "Matn yozishni boshlang...",
  storageKey = STORAGE_KEY,
  submitLabel = "Jo'natish",
  disabled = false,
}: TiptapEditorProps) {
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<
    { url: string; type: "image" | "video" }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitialContent = () => {
    if (typeof window === "undefined") return content;
    const saved = localStorage.getItem(storageKey);
    return saved || content;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted p-2 rounded font-mono text-sm",
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-2",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
    ],
    content: getInitialContent(),
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      localStorage.setItem(storageKey, html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose dark:prose-invert focus:outline-none min-h-[300px] max-w-none",
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();

    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 10 tagacha cheklov
    if (mediaFiles.length + files.length > 10) {
      toast.error("Maksimum 10 ta fayl tanlash mumkin");
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: { url: string; type: "image" | "video" }[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} - 10 MB dan oshmasligi kerak`);
        continue;
      }
      validFiles.push(file);
      const isVideo = file.type.startsWith("video/");
      newPreviews.push({
        url: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setMediaFiles((prev) => [...prev, ...validFiles]);
    setMediaPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllMedia = () => {
    setMediaFiles([]);
    setMediaPreviews([]);
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    isDisabled = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    isDisabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`p-2 rounded-md transition-colors ${
        isActive
          ? "bg-primary text-primary-foreground"
          : "hover:bg-muted text-muted-foreground hover:text-foreground"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-6 bg-border mx-1" />;

  return (
    <div className="rounded-xl border border-border/60 bg-background/95 shadow-sm">
      {/* Toolbar */}
      <div className="border-b border-border/60 p-2 flex flex-wrap gap-1 items-center">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isDisabled={!editor.can().chain().focus().undo().run()}
          title="Bekor qilish (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isDisabled={!editor.can().chain().focus().redo().run()}
          title="Qaytarish (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Formatting - Telegram supported */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Qalin (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Kursiv (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Tagiga chiziq (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="O'chirilgan"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Belgilangan ro'yxat"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Raqamlangan ro'yxat"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Code & Quote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline kod"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Kod bloki"
        >
          <CodeSquare className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Iqtibos"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Link */}
        <div className="relative">
          <ToolbarButton
            onClick={() => setShowLinkInput(!showLinkInput)}
            isActive={editor.isActive("link")}
            title="Havola qo'shish"
          >
            <LinkIcon className="w-4 h-4" />
          </ToolbarButton>
          {showLinkInput && (
            <div className="absolute top-full left-0 mt-2 p-2 bg-popover border border-border rounded-lg shadow-lg z-50 flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="px-2 py-1 text-sm border border-border rounded bg-background"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
              <button
                onClick={setLink}
                className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded"
              >
                Qo'shish
              </button>
            </div>
          )}
        </div>
        {editor.isActive("link") && (
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            title="Havolani olib tashlash"
          >
            <Unlink className="w-4 h-4" />
          </ToolbarButton>
        )}

        <ToolbarDivider />

        {/* Image Upload */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          isActive={mediaFiles.length > 0}
          title="Media yuklash (10 tagacha)"
        >
          <ImageIcon className="w-4 h-4" />
          {mediaFiles.length > 0 && (
            <span className="ml-1 text-xs">{mediaFiles.length}</span>
          )}
        </ToolbarButton>
      </div>

      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="px-4 py-2 border-b border-border/60">
          <div className="flex flex-wrap gap-2">
            {mediaPreviews.map((preview, index) => (
              <div key={index} className="relative">
                {preview.type === "video" ? (
                  <video
                    src={preview.url}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                ) : (
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                )}
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
            {mediaFiles.length > 1 && (
              <button
                onClick={clearAllMedia}
                className="h-20 px-3 border border-dashed border-border rounded-lg text-xs text-muted-foreground hover:bg-muted transition-colors"
              >
                Barchasini
                <br />
                o'chirish
              </button>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="px-4 py-4">
        <EditorContent
          editor={editor}
          className="min-h-80 w-full rounded-md border border-border/60 bg-background px-4 py-3 text-base leading-7"
        />
      </div>

      {/* Footer */}
      <div className="border-t border-border/60 px-4 py-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex gap-4">
          <span>{editor.storage.characterCount.characters()} belgi</span>
          <span>{editor.storage.characterCount.words()} so'z</span>
        </div>
        <button
          type="button"
          onClick={() => onSubmit?.(editor.getHTML(), mediaFiles)}
          disabled={disabled}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
            disabled
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          }`}
        >
          <Send className="w-4 h-4" />
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

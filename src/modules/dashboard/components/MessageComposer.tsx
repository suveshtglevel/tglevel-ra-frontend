'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model';
import { selectAll } from '@tiptap/pm/commands';
import { TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Type,
  Smile,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Image as ImageIcon,
  Paperclip,
  Video,
  BarChart2,
  Zap,
  Undo2,
  Redo2,
  ChevronDown,
  Send,
  X,
  FileText,
  FileSpreadsheet,
  File as FileIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { whatsappToHtml } from '@/lib/whatsappMarkdown';
import { useHydrated } from '@/lib/hooks/useHydrated';
import dynamic from 'next/dynamic';
import type { EmojiClickData } from 'emoji-picker-react';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check } from 'lucide-react';
import type { CommunityVM, BundleVM } from '@/types/dashboard';
import type { MessageTypeOption } from '@/modules/dashboard/services/messages.service';
import type { SendOptions } from '@/modules/dashboard/hooks/useDashboard';

interface MessageComposerProps {
  communities: CommunityVM[];
  messageTypes: MessageTypeOption[];
  // Server-owned bundles (a bundle groups sub-communities of one parent
  // community). Created via onCreateBundle; the list refreshes after creation.
  bundles: BundleVM[];
  creatingBundle?: boolean;
  onCreateBundle?: (payload: { name: string; communityId: string; subIds: string[] }) => void;
  onSend?: (content: string, options?: SendOptions) => void;
  disabled?: boolean;
}

type FilePreview = NonNullable<SendOptions['attachment']> & {
  file: File;
};

const MessageComposer = ({ communities, messageTypes, bundles, creatingBundle, onCreateBundle, onSend, disabled = false }: MessageComposerProps) => {
  const [isEditorEmpty, setIsEditorEmpty] = React.useState(true);
  const [selectedBundleId, setSelectedBundleId] = React.useState<string | null>(null);
  const [selectedType, setSelectedType] = React.useState<MessageTypeOption | null>(null);
  const [notifyUsers, setNotifyUsers] = React.useState(false);
  // In-progress draft for the bundle builder (the saved list comes from props).
  const [bundleOpen, setBundleOpen] = React.useState(false);
  const [draftName, setDraftName] = React.useState('');
  const [draftCommunityId, setDraftCommunityId] = React.useState<string | null>(null);
  const [draftSubIds, setDraftSubIds] = React.useState<string[]>([]);
  const [filePreview, setFilePreview] = React.useState<FilePreview | null>(null);
  const [showFullPreview, setShowFullPreview] = React.useState(false);
  const mounted = useHydrated();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFullPreview) {
          setShowFullPreview(false);
        } else if (filePreview) {
          setFilePreview(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filePreview, showFullPreview]);

  // Only sendable communities that actually have sub-communities can be bundled
  // (the RA may not broadcast to communities it is not assigned to).
  const bundleableCommunities = communities.filter(
    (c) => c.sendable && (c.subCommunities?.length ?? 0) > 0
  );
  const selectedBundle = bundles.find((b) => b.id === selectedBundleId) ?? null;
  const messageTypeRequiredText = 'Select message type before sending';

  // Toggle a sub-community in the draft. A draft is locked to one parent
  // community — picking a sub from a different community is disallowed.
  const toggleDraftSub = (communityId: string, subId: string) => {
    if (draftCommunityId !== null && draftCommunityId !== communityId) return;
    setDraftCommunityId(communityId);
    setDraftSubIds((prev) =>
      prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId]
    );
  };

  const resetDraft = () => {
    setDraftCommunityId(null);
    setDraftSubIds([]);
    setDraftName('');
  };

  const saveBundle = () => {
    if (draftCommunityId === null || draftSubIds.length === 0) {
      toast.error('Pick at least one sub-community');
      return;
    }
    // Fall back to the joined sub-community names if no name was typed.
    const community = communities.find((c) => c.id === draftCommunityId);
    const subs = community?.subCommunities?.filter((s) => draftSubIds.includes(s.id)) ?? [];
    const name = draftName.trim() || subs.map((s) => s.name).join(', ');
    onCreateBundle?.({ name, communityId: draftCommunityId, subIds: [...draftSubIds] });
    resetDraft();
    setBundleOpen(false);
  };

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);
  // Holds the latest send handler so the editor's keydown (set up once) always
  // calls the current closure instead of a stale one.
  const handleSendRef = React.useRef<() => void>(() => {});
  // The capped, scrollable wrapper around the editor — used to keep the caret
  // visible as the message grows past the max height.
  const editorScrollRef = React.useRef<HTMLDivElement>(null);

  // Turn a picked/pasted/dropped file into the single attachment preview.
  // Defined before the editor (and stable) so the editor's paste/drop handlers
  // can call it. Only uses stable state setters, so an empty dep list is safe.
  const handleFileSelect = React.useCallback((file: File, type: 'image' | 'file' | 'video') => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const url = reader.result as string;
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      let fileType: 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'file' = 'file';
      if (type === 'image') fileType = 'image';
      else if (type === 'video') fileType = 'video';
      else if (ext === 'pdf') fileType = 'pdf';
      else if (['doc', 'docx'].includes(ext)) fileType = 'doc';
      else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'excel';

      const sizeKB = file.size / 1024;
      const size = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB.toFixed(1)} KB`;

      setFilePreview({ name: file.name, size, fileType, url, file });
      setShowFullPreview(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // Pull the first file out of a paste/drop and route it to the attachment
  // preview, picking the input kind from its MIME type. Returns true when a file
  // was handled (so the editor doesn't also try to insert it).
  const handleEditorFiles = React.useCallback((files: FileList | null | undefined): boolean => {
    const file = files?.[0];
    if (!file) return false;
    const kind = file.type.startsWith('image/')
      ? 'image'
      : file.type.startsWith('video/')
        ? 'video'
        : 'file';
    handleFileSelect(file, kind);
    return true;
  }, [handleFileSelect]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Type your message here...',
      }),
    ],
    // Disable TipTap's built-in markdown rules: its single-`*` rule maps to
    // italic, which conflicts with WhatsApp's single-`*` = bold. We handle the
    // WhatsApp conversion ourselves in handlePaste (and on send) instead.
    enableInputRules: false,
    enablePasteRules: false,
    content: '',
    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
      // Follow the caret as the message grows so the latest line stays visible
      // (e.g. when adding line breaks with Shift+Enter) instead of being hidden
      // below the scroll viewport.
      requestAnimationFrame(() => {
        const el = editorScrollRef.current;
        if (!el) return;
        const coords = editor.view.coordsAtPos(editor.state.selection.head);
        const box = el.getBoundingClientRect();
        if (coords.bottom > box.bottom) {
          el.scrollTop += coords.bottom - box.bottom + 8;
        } else if (coords.top < box.top) {
          el.scrollTop -= box.top - coords.top + 8;
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-full text-slate-700 font-medium text-[15px] leading-relaxed min-h-full',
      },
      // Enter sends the message; Shift+Enter falls through to a line break.
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          handleSendRef.current();
          return true;
        }
        // Ctrl/Cmd+A selects the whole message (TipTap doesn't bind this by
        // default, so the native behaviour is unreliable inside the editor).
        if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
          event.preventDefault();
          return selectAll(view.state, view.dispatch);
        }
        // Deleting a whole-document selection (e.g. after Ctrl+A) resets to one
        // empty paragraph so the placeholder shows and no blue gap cursor is left
        // behind.
        if (event.key === 'Backspace' || event.key === 'Delete') {
          const { state } = view;
          const { selection } = state;
          const wholeDoc =
            !selection.empty &&
            selection.from <= 1 &&
            selection.to >= state.doc.content.size - 1;
          if (wholeDoc) {
            event.preventDefault();
            const paragraph = state.schema.nodes.paragraph.createAndFill();
            const tr = state.tr.replaceWith(0, state.doc.content.size, paragraph ?? []);
            tr.setSelection(TextSelection.create(tr.doc, 1));
            view.dispatch(tr.scrollIntoView());
            return true;
          }
        }
        return false;
      },
      // Pasting an image/file (e.g. a screenshot) attaches it. Pasting plain text
      // that uses WhatsApp markdown (*bold*, _italic_, ~strike~) is converted so
      // it shows formatted (asterisks hidden) — matching how it renders after
      // sending. Rich HTML pastes fall through to TipTap's default handling.
      handlePaste: (view, event) => {
        if (handleEditorFiles(event.clipboardData?.files)) {
          event.preventDefault();
          return true;
        }
        const clipboard = event.clipboardData;
        const htmlData = clipboard?.getData('text/html') ?? '';
        const textData = clipboard?.getData('text/plain') ?? '';
        // Real formatting in the clipboard HTML (bold/italic/…) — paste it as-is.
        const hasRichFormatting = /<(strong|b|em|i|s|del|u)\b/i.test(htmlData);
        if (!hasRichFormatting && /[*_~]/.test(textData)) {
          const container = document.createElement('div');
          container.innerHTML = whatsappToHtml(textData);
          const slice = ProseMirrorDOMParser.fromSchema(view.state.schema).parseSlice(container, {
            preserveWhitespace: 'full',
            context: view.state.selection.$from,
          });

          event.preventDefault();
          view.dispatch(
            view.state.tr
              .replaceSelection(slice)
              .scrollIntoView()
              .setMeta('paste', true)
              .setMeta('uiEvent', 'paste')
          );
          return true;
        }
        return false;
      },
      // Dropping a file onto the editor attaches it instead of opening it.
      handleDrop: (_view, event) => {
        if (handleEditorFiles((event as DragEvent).dataTransfer?.files)) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  const handleSend = () => {
    if (!editor) return;
    if (!selectedType) {
      toast.error(messageTypeRequiredText);
      return;
    }
    const content = editor.getHTML();
    const hasContent = !editor.isEmpty && content !== '<p></p>';
    // Allow sending an attachment on its own (image/doc with no caption); only
    // block a completely empty send (no text and no file).
    if (!hasContent && !filePreview) return;

    const sendOptions: SendOptions = {
      messageType: selectedType.name,
      messageTypeId: selectedType.id,
      group: selectedBundle?.name,
      notifyUsers,
      targetCommunityIds: selectedBundle?.subIds,
    };

    if (filePreview) {
      sendOptions.file = filePreview.file;
      sendOptions.fileType = filePreview.fileType;
      sendOptions.attachment = {
        name: filePreview.name,
        size: filePreview.size,
        fileType: filePreview.fileType,
        url: filePreview.url,
      };
    }

    onSend?.(hasContent ? content : '', sendOptions);
    editor.commands.clearContent();
    setIsEditorEmpty(true);
    setSelectedBundleId(null);
    setSelectedType(null);
    setNotifyUsers(false);
    setFilePreview(null);
    setShowFullPreview(false);
  };
  // Keep the editor's static keydown handler pointed at the latest closure
  // without writing to the ref during render.
  useEffect(() => {
    handleSendRef.current = handleSend;
  });

  // Dynamically toggle tip-tap editor editability based on the disabled prop
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // TipTap initialises asynchronously; render nothing until the editor is ready.
  // Placed after the hooks above so hook order stays stable across renders.
  if (!editor) {
    return null;
  }

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor.chain().focus().toggleBulletList().run();
  const toggleHeading = () => {
    if (editor.isActive('heading', { level: 2 })) {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    }
  };
  const setAlign = (align: 'left' | 'center' | 'right' | 'justify') =>
    editor.chain().focus().setTextAlign(align).run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const insertChart = () => {
    editor.chain().focus().insertContent(
      '<p>📊 <strong>Market Analysis Chart</strong></p><p>Nifty: 24,250 (+0.8%) | Bank Nifty: 52,100 (+1.2%)</p>'
    ).run();
  };

  const insertQuickTrade = () => {
    editor.chain().focus().insertContent(
      '<p>⚡ <strong>QUICK TRADE ALERT</strong></p><p>Symbol: ___</p><p>Entry: ___</p><p>SL: ___</p><p>Target: ___</p>'
    ).run();
  };

  const addEmoji = (emojiData: EmojiClickData) => {
    // Insert without focusing the editor: stealing focus would move it out of
    // the popover and make Radix auto-close the picker after each selection.
    editor.chain().insertContent(emojiData.emoji).run();
  };

  const renderPreviewModal = () => {
    if (!filePreview || !mounted || !showFullPreview) return null;

    const modalContent = (
      <div className="fixed inset-0 z-[9999] bg-[#0b141a] text-white flex flex-col select-none animate-in fade-in duration-200">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 bg-[#0b141a] border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setShowFullPreview(false);
              }}
              className="p-2 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
            <span className="font-semibold text-lg text-[#e9edef]">Preview</span>
          </div>
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-[#8696a0] max-w-[200px] truncate" title={filePreview.name}>
              {filePreview.name}
            </span>
            <span className="text-[10px] text-[#8696a0] mt-0.5">
              {filePreview.size}
            </span>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto bg-[#0b141a]/95">
          {filePreview.fileType === 'image' ? (
            <div className="relative max-h-[65vh] max-w-[85vw] flex items-center justify-center">
              <Image
                src={filePreview.url}
                alt={filePreview.name}
                width={800}
                height={600}
                className="max-h-[65vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/5"
                unoptimized
              />
            </div>
          ) : filePreview.fileType === 'video' ? (
            <div className="relative max-h-[65vh] max-w-[85vw] flex items-center justify-center">
              <video
                src={filePreview.url}
                controls
                autoPlay
                className="max-h-[65vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/5"
              />
            </div>
          ) : (
            <div className="bg-[#111b21] border border-white/15 p-10 rounded-2xl max-w-md w-full flex flex-col items-center gap-6 text-center shadow-2xl">
              <div className="w-24 h-24 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {filePreview.fileType === 'pdf' && <FileText className="w-12 h-12 text-[#EF4444]" />}
                {filePreview.fileType === 'doc' && <FileIcon className="w-12 h-12 text-[#3B82F6]" />}
                {filePreview.fileType === 'excel' && <FileSpreadsheet className="w-12 h-12 text-[#10B981]" />}
                {filePreview.fileType === 'file' && <FileIcon className="w-12 h-12 text-[#AEBAC1]" />}
              </div>
              <div className="px-4">
                <h3 className="text-lg font-semibold text-[#e9edef] break-all leading-snug">{filePreview.name}</h3>
                <p className="text-sm text-[#8696a0] mt-2 uppercase tracking-wide font-medium">
                  {filePreview.fileType === 'file' ? 'Document' : `${filePreview.fileType} file`} &bull; {filePreview.size}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  return (
    <Card
      className={cn(
        "w-full max-w-[1100px] bg-white border-slate-200 shadow-sm rounded-[14px] overflow-hidden flex flex-col transition-all duration-300 focus-within:border-emerald-300/50 focus-within:ring-4 focus-within:ring-emerald-500/5 opacity-100 rotate-0 border-[1px]",
        filePreview ? "min-h-[360px] h-auto" : isEditorEmpty ? "min-h-[150px] h-auto" : "min-h-[200px] h-auto max-h-[330px]",
        disabled && "opacity-50 pointer-events-none bg-slate-50/50"
      )}
    >
      {/* Top Control Bar */}
      <div className="px-3 sm:px-5 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl border-slate-200 bg-white text-slate-600 gap-2 font-bold px-4 hover:bg-slate-50 transition-colors shadow-none cursor-pointer max-w-[220px]",
                  selectedBundle && "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:text-white"
                )}
              >
                <span className="truncate">{selectedBundle ? selectedBundle.name : "Select Group"}</span>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0", selectedBundle && "text-white/70")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto min-w-[160px] max-w-[300px] p-0 bg-[#FDFDFD] border-[1.97px] border-[#E2E8F0] text-[11.75px] rounded-[6.73px] shadow-lg overflow-hidden"
              align="start"
              side="bottom"
              sideOffset={8}
              avoidCollisions={false}
            >
              <div className="flex flex-col py-0 max-h-[260px] overflow-y-auto">
                {bundles.length === 0 ? (
                  <div className="px-3 py-3 text-[11.5px] text-slate-400 font-medium text-center">
                    No bundles yet.<br />Create one with <span className="font-bold text-emerald-600">+ Bundle</span>.
                  </div>
                ) : (
                  bundles.map((bundle) => (
                    <button
                      key={bundle.id}
                      onClick={() => setSelectedBundleId(bundle.id)}
                      className={cn(
                        "w-full text-left px-[12px] py-[7px] text-[11.75px] font-medium transition-colors border-b border-[#E2E8F0] last:border-none hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer",
                        selectedBundleId === bundle.id ? "bg-[#CFDCE8] text-[#0F172A]" : "text-[#0F172A]"
                      )}
                    >
                      {selectedBundleId === bundle.id && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                      <span className="truncate">{bundle.name}</span>
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl border-slate-200 bg-white text-slate-600 gap-2 font-bold px-4 hover:bg-slate-50 transition-colors shadow-none cursor-pointer",
                  selectedType && "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:text-white"
                )}
              >
                {selectedType?.name || "Select Message Type"} <ChevronDown className={cn("w-4 h-4 text-slate-400", selectedType && "text-white/70")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto min-w-[142.88px] max-w-[300px] p-0 bg-[#FDFDFD] border-[1.97px] border-[#E2E8F0] rounded-[6.73px] shadow-lg overflow-hidden"
              align="start"
              side="bottom"
              sideOffset={8}
              avoidCollisions={false}
            >
              <div className="flex flex-col py-0">
                {messageTypes.length === 0 ? (
                  <div className="px-3 py-3 text-[11.5px] text-slate-400 font-medium text-center">
                    No message types available
                  </div>
                ) : (
                  messageTypes.map((type) => (
                    <button
                      key={type._id}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "w-full text-left px-[12px] py-[5.38px] text-[11.75px] font-normal transition-colors border-b border-[#E2E8F0] last:border-none hover:bg-slate-50 flex items-center whitespace-nowrap cursor-pointer",
                        selectedType?._id === type._id ? "bg-[#CFDCE8] text-[#0F172A]" : "text-[#0F172A]"
                      )}
                      style={{ height: '23.77px' }}
                    >
                      {type.name}
                    </button>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
          <div className="hidden sm:block h-6 w-[1px] bg-slate-100 mx-1.5" />
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} className="data-[state=checked]:bg-emerald-500 cursor-pointer" />
            <span className="text-[13px] font-bold text-slate-500 tracking-tight whitespace-nowrap">Notify Users</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Popover open={bundleOpen} onOpenChange={(open) => { setBundleOpen(open); if (!open) resetDraft(); }}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="font-bold rounded-xl px-4 h-9 transition-colors cursor-pointer text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
              >
                + Bundle
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[280px] p-0 bg-white border-[1.5px] border-[#E2E8F0] rounded-xl shadow-xl overflow-hidden"
              align="end"
              side="top"
              sideOffset={8}
              avoidCollisions={false}
            >
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50">
                <p className="text-[12px] font-bold text-slate-700">Create a bundle</p>
                <p className="text-[10.5px] text-slate-400 font-medium">Pick sub-communities from one community.</p>
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Bundle name (optional)"
                  className="mt-2 w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[12px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>
              <div className="max-h-[280px] overflow-y-auto py-1">
                {bundleableCommunities.map((c) => {
                  const locked = draftCommunityId !== null && draftCommunityId !== c.id;
                  return (
                    <div key={c.id} className="px-2 py-1">
                      <p className={cn("px-2 py-1 text-[11px] font-bold uppercase tracking-wide", locked ? "text-slate-300" : "text-slate-500")}>
                        {c.name}
                      </p>
                      <div className="flex flex-col">
                        {c.subCommunities!.map((s) => {
                          const checked = draftSubIds.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              disabled={locked}
                              onClick={() => toggleDraftSub(c.id, s.id)}
                              className={cn(
                                "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors text-left",
                                locked ? "text-slate-300 cursor-not-allowed" : "text-slate-700 hover:bg-slate-50 cursor-pointer",
                                checked && "bg-emerald-50"
                              )}
                            >
                              <span className={cn(
                                "w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                                checked ? "border-emerald-500 bg-emerald-500" : locked ? "border-slate-200" : "border-slate-300"
                              )}>
                                {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                              </span>
                              <span className="flex-1">{s.name}</span>
                              <span className={cn("text-[10px] font-semibold", locked ? "text-slate-300" : "text-slate-400")}>{s.type}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-slate-100 bg-slate-50">
                <button
                  type="button"
                  onClick={resetDraft}
                  disabled={draftSubIds.length === 0}
                  className={cn(
                    "text-[11.5px] font-bold transition-colors",
                    draftSubIds.length === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-slate-700 cursor-pointer"
                  )}
                >
                  Clear
                </button>
                <Button
                  size="sm"
                  onClick={saveBundle}
                  disabled={draftSubIds.length === 0 || creatingBundle}
                  className={cn(
                    "h-8 rounded-lg px-4 font-bold text-[12px] bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer",
                    (draftSubIds.length === 0 || creatingBundle) && "opacity-50 cursor-not-allowed hover:bg-emerald-500"
                  )}
                >
                  {creatingBundle ? 'Saving…' : `Save bundle (${draftSubIds.length})`}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <div
            className="inline-flex"
            onClick={() => {
              if (!selectedType) toast.error(messageTypeRequiredText);
            }}
            title={!selectedType ? messageTypeRequiredText : undefined}
          >
            <Button
              className={cn(
                "bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-4 sm:px-6 font-bold h-10 gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
                !selectedType && "opacity-50"
              )}
              onClick={handleSend}
              disabled={!selectedType}
            >
              Send <Send className="w-4 h-4 fill-current" />
            </Button>
          </div>
        </div>
      </div>

      {/* Middle Toolbar */}
      <div className="px-3 sm:px-5 py-1.5 flex items-center gap-2 bg-slate-50/30 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto">
          <ToolbarButton onClick={toggleBold} active={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleItalic} active={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleStrike} active={editor.isActive('strike')}><Strikethrough className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleUnderline} active={editor.isActive('underline')}><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleHeading} active={editor.isActive('heading', { level: 2 })}><Type className="h-4 w-4" /></ToolbarButton>
          <Popover>
            <PopoverTrigger asChild>
              <ToolbarButton>
                <Smile className="h-4 w-4" />
              </ToolbarButton>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none shadow-none w-auto" side="top" align="start" sideOffset={8}>
              <EmojiPicker
                onEmojiClick={addEmoji}
                height={420}
                width={340}
                lazyLoadEmojis
                searchPlaceHolder="Search emoji"
              />
            </PopoverContent>
          </Popover>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={() => setAlign('left')} active={editor.isActive({ textAlign: 'left' })}><AlignLeft className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => setAlign('center')} active={editor.isActive({ textAlign: 'center' })}><AlignCenter className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => setAlign('right')} active={editor.isActive({ textAlign: 'right' })}><AlignRight className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => setAlign('justify')} active={editor.isActive({ textAlign: 'justify' })}><AlignJustify className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleBulletList} active={editor.isActive('bulletList')}><List className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={() => { imageInputRef.current?.click(); }}><ImageIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => { fileInputRef.current?.click(); }}><Paperclip className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => { videoInputRef.current?.click(); }}><Video className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={insertChart}><BarChart2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={insertQuickTrade}><Zap className="h-4 w-4" /></ToolbarButton>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <ToolbarButton onClick={undo} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={redo} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></ToolbarButton>
        </div>
      </div>

      {renderPreviewModal()}

      {/* Editor Area */}
      <div
        className={cn(
          "px-3 sm:px-5 pt-3 pb-6 overflow-y-auto cursor-pointer",
          filePreview ? "min-h-[190px]" : isEditorEmpty ? "flex-1" : "min-h-[80px]"
        )}
        onClick={() => editor.commands.focus()}
        onDoubleClick={() => editor.commands.focus()}
      >
        {/* Small File Preview — shown above the caption input so the image is
            on top and the message can be typed underneath it. */}
        {filePreview && !showFullPreview && (
          <div className="mb-3 max-w-[420px] rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setFilePreview(null);
              }}
              className="float-right ml-3 p-1.5 rounded-full bg-white text-slate-400 border border-slate-200 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-colors cursor-pointer"
              title="Remove selected file"
            >
              <X className="w-4 h-4" />
            </button>
            <div
              onClick={(event) => {
                event.stopPropagation();
                setShowFullPreview(true);
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              {filePreview.fileType === 'image' ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-white shrink-0">
                  <Image
                    src={filePreview.url}
                    alt={filePreview.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : filePreview.fileType === 'video' ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center shrink-0">
                  <Video className="w-9 h-9 text-white/60" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg border border-slate-200 bg-white flex items-center justify-center shrink-0">
                  {filePreview.fileType === 'pdf' && <FileText className="w-9 h-9 text-red-500" />}
                  {filePreview.fileType === 'doc' && <FileIcon className="w-9 h-9 text-blue-500" />}
                  {filePreview.fileType === 'excel' && <FileSpreadsheet className="w-9 h-9 text-green-500" />}
                  {filePreview.fileType === 'file' && <FileIcon className="w-9 h-9 text-slate-400" />}
                </div>
              )}
              <div className="min-w-0 pr-2">
                <p
                  className="text-sm font-bold text-slate-800 truncate"
                  title={filePreview.name}
                >
                  {filePreview.name}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">{filePreview.size}</p>
                <p className="text-[11px] font-semibold text-emerald-600 mt-3">Click to preview</p>
              </div>
            </div>
          </div>
        )}

        {/* Cap the typing area's height; once the text exceeds it the editor
            scrolls internally instead of growing the composer further. */}
        <div ref={editorScrollRef} className="composer-scroll max-h-[180px] overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .composer-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .composer-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .composer-scroll::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 9999px;
        }
        .composer-scroll::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
        .composer-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .tiptap {
          /* Keep the text caret black instead of the browser's default/accent
             colour (which can render blue). */
          caret-color: #0f172a;
        }
        /* If a gap cursor ever appears, draw it black (its default line can
           render in the browser/theme accent colour). */
        .tiptap .ProseMirror-gapcursor:after {
          border-top-color: #0f172a;
        }
        .tiptap p {
          margin: 0;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
          font-weight: 500;
        }
        .tiptap:focus {
          outline: none;
        }
        .tiptap strong {
          font-weight: 700;
        }
        .tiptap em {
          font-style: italic;
        }
        .tiptap u {
          text-decoration: underline;
        }
        .tiptap s {
          text-decoration: line-through;
        }
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .tiptap h2 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0;
        }
        .tiptap hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 0.5rem 0;
        }
      `}</style>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'image');
          e.target.value = '';
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'file');
          e.target.value = '';
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, 'video');
          e.target.value = '';
        }}
      />
    </Card>
  );
};

const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    children: React.ReactNode;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    className?: string;
  }
>(({ children, onClick, active = false, disabled = false, className }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-lg cursor-pointer",
      active && "text-slate-800",
      className
    )}
  >
    {children}
  </Button>
));
ToolbarButton.displayName = "ToolbarButton";

export default MessageComposer;

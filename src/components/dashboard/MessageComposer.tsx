'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Type,
  Smile,
  AlignLeft,
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
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageComposerProps {
  onSend?: (content: string, options?: { messageType?: string; group?: string; notifyUsers?: boolean }) => void;
  onSendFile?: (attachment: { name: string; size: string; fileType: 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'file'; url: string }, caption?: string) => void;
}

const MessageComposer = ({ onSend, onSendFile }: MessageComposerProps) => {
  const [isEditorEmpty, setIsEditorEmpty] = React.useState(true);
  const [selectedGroup, setSelectedGroup] = React.useState<string | null>(null);
  const [selectedMessageType, setSelectedMessageType] = React.useState<string | null>(null);
  const [notifyUsers, setNotifyUsers] = React.useState(false);
  const [showBundle, setShowBundle] = React.useState(false);
  const [bundleMessages, setBundleMessages] = React.useState<string[]>([]);
  const [filePreview, setFilePreview] = React.useState<{
    name: string;
    size: string;
    fileType: 'image' | 'video' | 'pdf' | 'doc' | 'excel' | 'file';
    url: string;
  } | null>(null);
  const [caption, setCaption] = React.useState('');
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && filePreview) {
        setFilePreview(null);
        setCaption('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [filePreview]);

  const groups = [
    "Nifty free -[NF1, NF2]",
    "Nifty free -[NF1, NP1]",
    "Community free -[CF1, CF2]",
    "Swing free -[SF1, SF2]",
    "Equity -[EF1, EF2]",
  ];

  const messageTypes = [
    "Trade",
    "Promotional",
    "Follow up",
    "Feedback",
    "Flaunt",
  ];

  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoInputRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Type your message here...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setIsEditorEmpty(editor.isEmpty);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none max-w-full text-slate-700 font-medium text-[15px] leading-relaxed min-h-full',
      },
    },
  });

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
  const toggleAlign = () => {
    // Insert a horizontal rule as a visual separator
    editor.chain().focus().setHorizontalRule().run();
  };
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const handleFileSelect = (file: File, type: 'image' | 'file' | 'video') => {
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

      setFilePreview({ name: file.name, size, fileType, url });
      setCaption('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileConfirmSend = () => {
    if (filePreview) {
      onSendFile?.(filePreview, caption || undefined);
      setFilePreview(null);
      setCaption('');
    }
  };

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

  const addEmoji = (emojiData: any) => {
    editor.chain().focus().insertContent(emojiData.emoji).run();
  };

  const renderPreviewModal = () => {
    if (!filePreview || !mounted) return null;

    const modalContent = (
      <div className="fixed inset-0 z-[9999] bg-[#0b141a] text-white flex flex-col select-none animate-in fade-in duration-200">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 shrink-0 bg-[#0b141a] border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setFilePreview(null);
                setCaption('');
              }}
              className="p-2 rounded-full hover:bg-white/10 text-[#aebac1] hover:text-white transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center"
              title="Cancel and close"
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
              <img
                src={filePreview.url}
                alt={filePreview.name}
                className="max-h-[65vh] max-w-[85vw] object-contain rounded-lg shadow-2xl border border-white/5"
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

        {/* Footer caption & send area */}
        <div className="bg-[#111b21] border-t border-white/5 py-5 px-6 shrink-0 flex items-center justify-center">
          <div className="w-full max-w-[800px] flex items-center gap-4">
            <div className="flex-1 bg-[#2a3942] rounded-xl flex items-center px-4 py-1.5 border border-white/5 focus-within:border-emerald-500/30 transition-all">
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFileConfirmSend();
                }}
                autoFocus
                className="flex-1 bg-transparent border-none text-[#e9edef] placeholder-[#8696a0] focus:outline-none focus:ring-0 text-[15px] py-1.5"
              />
            </div>
            <button
              type="button"
              onClick={handleFileConfirmSend}
              className="bg-[#00a884] hover:bg-[#008f72] active:scale-95 text-white rounded-full p-4 flex items-center justify-center shadow-lg transition-all cursor-pointer shrink-0 border-none"
              title="Send"
            >
              <Send className="w-6 h-6 fill-current translate-x-[2px] text-white" />
            </button>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  };

  return (
    <Card 
      className={cn(
        "w-full max-w-[1100px] bg-white border-slate-200 shadow-sm rounded-[14px] overflow-hidden flex flex-col transition-all duration-300 focus-within:border-emerald-300/50 focus-within:ring-4 focus-within:ring-emerald-500/5 opacity-100 rotate-0 border-[1px]",
        isEditorEmpty ? "h-[160px]" : "min-h-[200px] h-auto max-h-[85vh]"
      )}
    >
      {/* Top Control Bar */}
   <div className="px-5 py-2 flex items-center justify-between border-b border-[#E2E8F0] shrink-0 bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-9 rounded-xl border-slate-200 bg-white text-slate-600 gap-2 font-bold px-4 hover:bg-slate-50 transition-colors shadow-none cursor-pointer",
                  selectedGroup && "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:text-white"
                )}
              >
                {selectedGroup || "Select Group"} <ChevronDown className={cn("w-4 h-4 text-slate-400", selectedGroup && "text-white/70")} />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto min-w-[142.88px] max-w-[300px] p-0 bg-[#FDFDFD] border-[1.97px] border-[#E2E8F0] text-[11.75px] rounded-[6.73px] shadow-lg overflow-hidden" 
              align="start"
              side="bottom"
              sideOffset={8}
              avoidCollisions={false}
            >
              <div className="flex flex-col py-0">
                {groups.map((group, index) => (
                  <button
                    key={group}
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      "w-full text-left px-[12px] py-[5.38px] text-[11.75px] font-normal transition-colors border-b border-[#E2E8F0] last:border-none hover:bg-slate-50 flex items-center whitespace-nowrap cursor-pointer",
                      selectedGroup === group ? "bg-[#CFDCE8] text-[#0F172A]" : "text-[#0F172A]"
                    )}
                    style={{ height: group === "Nifty free -[NF1, NP1]" ? "29.77px" : "23.77px" }}
                  >
                    {group}
                  </button>
                ))}
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
                  selectedMessageType && "bg-[#0F172A] text-white border-[#0F172A] hover:bg-[#1E293B] hover:text-white"
                )}
              >
                {selectedMessageType || "Select Message Type"} <ChevronDown className={cn("w-4 h-4 text-slate-400", selectedMessageType && "text-white/70")} />
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
                {messageTypes.map((type, index) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMessageType(type)}
                    className={cn(
                      "w-full text-left px-[12px] py-[5.38px] text-[11.75px] font-normal transition-colors border-b border-[#E2E8F0] last:border-none hover:bg-slate-50 flex items-center whitespace-nowrap cursor-pointer",
                      selectedMessageType === type ? "bg-[#CFDCE8] text-[#0F172A]" : "text-[#0F172A]"
                    )}
                    style={{ height: '23.77px' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <div className="h-6 w-[1px] bg-slate-100 mx-1.5" />
          <div className="flex items-center gap-2.5">
            <Switch checked={notifyUsers} onCheckedChange={setNotifyUsers} className="data-[state=checked]:bg-emerald-500 cursor-pointer" />
            <span className="text-[13px] font-bold text-slate-500 tracking-tight">Notify Users</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "font-bold rounded-xl px-4 h-9 transition-colors cursor-pointer",
              showBundle
                ? "text-white bg-emerald-600 hover:bg-emerald-700"
                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            )}
            onClick={() => {
              if (showBundle) {
                // Send all bundled messages
                bundleMessages.forEach((msg) => {
                  onSend?.(msg, { messageType: selectedMessageType ?? undefined, group: selectedGroup ?? undefined, notifyUsers });
                });
                setBundleMessages([]);
                setShowBundle(false);
              } else {
                setShowBundle(true);
              }
            }}
          >
            {showBundle ? `Send Bundle (${bundleMessages.length})` : '+ Bundle'}
          </Button>
          <Button
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold h-10 gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            onClick={() => {
              const content = editor.getHTML();
              if (content !== '<p></p>') {
                if (showBundle) {
                  setBundleMessages((prev) => [...prev, content]);
                  editor.commands.clearContent();
                  setIsEditorEmpty(true);
                } else {
                  onSend?.(content, { messageType: selectedMessageType ?? undefined, group: selectedGroup ?? undefined, notifyUsers });
                  editor.commands.clearContent();
                  setIsEditorEmpty(true);
                  setSelectedGroup(null);
                  setSelectedMessageType(null);
                  setNotifyUsers(false);
                }
              }
            }}
          >
            {showBundle ? 'Add to Bundle' : 'Send'} <Send className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>

      {/* Middle Toolbar */}
      <div className="px-5 py-1.5 flex items-center justify-between bg-slate-50/30 border-b border-[#E2E8F0] shrink-0">
        <div className="flex items-center gap-0.5">
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
            <PopoverContent className="p-0 border-none shadow-none w-auto" side="bottom" align="start" avoidCollisions={false}>
              <EmojiPicker onEmojiClick={addEmoji} />
            </PopoverContent>
          </Popover>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={toggleAlign}><AlignLeft className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleBulletList} active={editor.isActive('bulletList')}><List className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={() => { imageInputRef.current?.click(); }}><ImageIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => { fileInputRef.current?.click(); }}><Paperclip className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={() => { videoInputRef.current?.click(); }}><Video className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton onClick={insertChart}><BarChart2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={insertQuickTrade}><Zap className="h-4 w-4" /></ToolbarButton>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={undo} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={redo} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></ToolbarButton>
        </div>
      </div>

      {renderPreviewModal()}

      {/* Editor Area */}
      <div
        className={cn(
          "px-5 pt-3 pb-6 overflow-y-auto cursor-pointer",
          isEditorEmpty ? "flex-1" : "min-h-[80px]"
        )}
        onClick={() => editor.commands.focus()}
        onDoubleClick={() => editor.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
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
      active && "text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm",
      className
    )}
  >
    {children}
  </Button>
));
ToolbarButton.displayName = "ToolbarButton";

export default MessageComposer;

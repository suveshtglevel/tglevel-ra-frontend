'use client';

import React from 'react';
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
  Send
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
  onSend?: (content: string) => void;
}

const MessageComposer = ({ onSend }: MessageComposerProps) => {
  const [isEditorEmpty, setIsEditorEmpty] = React.useState(true);

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
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const addEmoji = (emojiData: any) => {
    editor.chain().focus().insertContent(emojiData.emoji).run();
  };

  return (
    <Card 
      className={cn(
        "w-full max-w-[991px] bg-white border-slate-200 shadow-sm rounded-[14px] overflow-hidden flex flex-col transition-all duration-300 focus-within:border-emerald-300/50 focus-within:ring-4 focus-within:ring-emerald-500/5 opacity-100 rotate-0 border-[1px]",
        isEditorEmpty ? "h-[175.5px]" : "min-h-[175.5px] h-auto max-h-[85vh]"
      )}
    >
      {/* Top Control Bar */}
      <div className="px-5 py-2 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 gap-2 font-bold px-4 hover:bg-slate-50 transition-colors">
            Select Group <ChevronDown className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 gap-2 font-bold px-4 hover:bg-slate-50 transition-colors">
            Select Message Type <ChevronDown className="w-4 h-4 text-slate-400" />
          </Button>
          <div className="h-6 w-[1px] bg-slate-100 mx-1.5" />
          <div className="flex items-center gap-2.5">
            <Switch className="data-[state=checked]:bg-emerald-500" />
            <span className="text-[13px] font-bold text-slate-500 tracking-tight">Notify Users</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="sm" className="text-emerald-600 font-bold bg-emerald-50 hover:bg-emerald-100 rounded-xl px-4 h-9 transition-colors">
            + Bundle
          </Button>
          <Button 
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold h-10 gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            onClick={() => {
              const content = editor.getHTML();
              if (content !== '<p></p>') {
                onSend?.(content);
                editor.commands.clearContent();
                setIsEditorEmpty(true);
              }
            }}
          >
            Send <Send className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </div>

      {/* Middle Toolbar */}
      <div className="px-5 py-1.5 flex items-center justify-between bg-slate-50/30 border-b border-slate-50 shrink-0">
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={toggleBold} active={editor.isActive('bold')}><Bold className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleItalic} active={editor.isActive('italic')}><Italic className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleStrike} active={editor.isActive('strike')}><Strikethrough className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleUnderline} active={editor.isActive('underline')}><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton><Type className="h-4 w-4" /></ToolbarButton>
          <Popover>
            <PopoverTrigger asChild>
              <ToolbarButton>
                <Smile className="h-4 w-4" />
              </ToolbarButton>
            </PopoverTrigger>
            <PopoverContent className="p-0 border-none shadow-none w-auto" side="top" align="start">
              <EmojiPicker onEmojiClick={addEmoji} />
            </PopoverContent>
          </Popover>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton><AlignLeft className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={toggleBulletList} active={editor.isActive('bulletList')}><List className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton><ImageIcon className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton><Paperclip className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton><Video className="h-4 w-4" /></ToolbarButton>
          <div className="h-5 w-[1px] bg-slate-200 mx-2" />
          <ToolbarButton><BarChart2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton><Zap className="h-4 w-4" /></ToolbarButton>
        </div>
        <div className="flex items-center gap-0.5">
          <ToolbarButton onClick={undo} disabled={!editor.can().undo()}><Undo2 className="h-4 w-4" /></ToolbarButton>
          <ToolbarButton onClick={redo} disabled={!editor.can().redo()}><Redo2 className="h-4 w-4" /></ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div 
        className={cn(
          "px-5 pt-3 pb-6 overflow-y-auto cursor-text",
          isEditorEmpty ? "flex-1" : "min-h-[80px]"
        )} 
        onClick={() => editor.commands.focus()}
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
      `}</style>
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
      "h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all rounded-lg",
      active && "text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm",
      className
    )}
  >
    {children}
  </Button>
));
ToolbarButton.displayName = "ToolbarButton";

export default MessageComposer;

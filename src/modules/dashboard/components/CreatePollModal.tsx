'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Circle,
  CheckSquare,
  SlidersHorizontal,
  Smile,
  Plus,
  Trash2,
  GripVertical,
  Shapes,
  ListChecks,
  BarChart2,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import type { ComposerPoll, PollType } from '@/modules/dashboard/hooks/useDashboard';

interface CreatePollModalProps {
  open: boolean;
  onClose: () => void;
  // Publish the draft. The parent decides whether the popup closes (it stays
  // open on a validation/scope failure so the draft isn't lost).
  onPublish: (poll: ComposerPoll) => void;
}

const MAX_OPTIONS = 5;
const MAX_EMOJIS = 5;
const MIN_EMOJIS = 2;

// Emoji palette with search keywords. Searching matches these keywords.
const EMOJI_PALETTE: { e: string; k: string }[] = [
  { e: '😀', k: 'grin happy smile' },
  { e: '😃', k: 'happy smile joy' },
  { e: '😄', k: 'happy laugh smile' },
  { e: '😁', k: 'grin beaming' },
  { e: '😆', k: 'laugh haha' },
  { e: '😅', k: 'sweat laugh nervous' },
  { e: '😂', k: 'lol tears joy laugh' },
  { e: '🤣', k: 'rofl rolling laugh' },
  { e: '🙂', k: 'slight smile' },
  { e: '🙃', k: 'upside down silly' },
  { e: '😉', k: 'wink' },
  { e: '😊', k: 'blush smile happy' },
  { e: '😇', k: 'angel innocent halo' },
  { e: '🥰', k: 'love hearts adore' },
  { e: '😍', k: 'love heart eyes' },
  { e: '🤩', k: 'star struck wow amazing' },
  { e: '😘', k: 'kiss love' },
  { e: '😋', k: 'yum tasty' },
  { e: '😜', k: 'wink tongue silly' },
  { e: '🤪', k: 'zany crazy' },
  { e: '🤔', k: 'think hmm' },
  { e: '🤨', k: 'skeptical brow doubt' },
  { e: '😐', k: 'neutral meh' },
  { e: '😑', k: 'expressionless blank' },
  { e: '😶', k: 'no mouth speechless' },
  { e: '😏', k: 'smirk' },
  { e: '😒', k: 'unamused annoyed' },
  { e: '🙄', k: 'eye roll' },
  { e: '😬', k: 'grimace awkward' },
  { e: '😌', k: 'relieved calm' },
  { e: '😔', k: 'sad pensive down' },
  { e: '😴', k: 'sleep tired zzz' },
  { e: '🤤', k: 'drool' },
  { e: '😷', k: 'mask sick' },
  { e: '🤒', k: 'sick fever ill' },
  { e: '🥵', k: 'hot heat sweat' },
  { e: '🥶', k: 'cold freeze' },
  { e: '😵', k: 'dizzy ko' },
  { e: '🤯', k: 'mind blown shocked' },
  { e: '🥳', k: 'party celebrate' },
  { e: '😎', k: 'cool sunglasses' },
  { e: '🤓', k: 'nerd geek' },
  { e: '😕', k: 'confused unsure' },
  { e: '😟', k: 'worried concerned' },
  { e: '🙁', k: 'frown slight sad' },
  { e: '😮', k: 'wow surprised' },
  { e: '😲', k: 'astonished shocked' },
  { e: '😳', k: 'flushed embarrassed' },
  { e: '🥺', k: 'pleading puppy beg' },
  { e: '😨', k: 'fear scared' },
  { e: '😰', k: 'anxious sweat nervous' },
  { e: '😢', k: 'cry sad tear' },
  { e: '😭', k: 'sob cry bawl' },
  { e: '😱', k: 'scream shock fear' },
  { e: '😞', k: 'disappointed sad' },
  { e: '😩', k: 'weary frustrated' },
  { e: '😫', k: 'tired exhausted' },
  { e: '😤', k: 'triumph huff determined' },
  { e: '😡', k: 'angry rage mad' },
  { e: '😠', k: 'mad angry' },
  { e: '🤬', k: 'cursing swearing angry' },
  { e: '💀', k: 'skull dead' },
  { e: '👍', k: 'thumbs up yes good like' },
  { e: '👎', k: 'thumbs down no bad dislike' },
  { e: '👏', k: 'clap applause' },
  { e: '🙌', k: 'raise hands celebrate' },
  { e: '👌', k: 'ok perfect' },
  { e: '✌️', k: 'peace victory' },
  { e: '🤞', k: 'fingers crossed luck' },
  { e: '🤝', k: 'handshake deal agree' },
  { e: '🙏', k: 'pray thanks please' },
  { e: '💪', k: 'strong muscle power' },
  { e: '👋', k: 'wave hi hello bye' },
  { e: '❤️', k: 'heart love red' },
  { e: '🧡', k: 'orange heart' },
  { e: '💛', k: 'yellow heart' },
  { e: '💚', k: 'green heart' },
  { e: '💙', k: 'blue heart' },
  { e: '💜', k: 'purple heart' },
  { e: '💔', k: 'broken heart sad' },
  { e: '✨', k: 'sparkle shine' },
  { e: '⭐', k: 'star rate' },
  { e: '🌟', k: 'glowing star' },
  { e: '🔥', k: 'fire hot lit' },
  { e: '💯', k: 'hundred perfect score' },
  { e: '✅', k: 'check yes correct done' },
  { e: '❌', k: 'cross no wrong x' },
  { e: '⚠️', k: 'warning caution' },
  { e: '❓', k: 'question doubt' },
  { e: '❗', k: 'exclaim important' },
  { e: '💰', k: 'money cash profit' },
  { e: '📈', k: 'chart up profit gain bull' },
  { e: '📉', k: 'chart down loss bear' },
  { e: '🚀', k: 'rocket moon up' },
  { e: '🎯', k: 'target goal bullseye' },
  { e: '🏆', k: 'trophy win champion' },
  { e: '🎉', k: 'party celebrate tada' },
  { e: '👀', k: 'eyes look watch' },
];

const DEFAULT_EMOJIS = ['😡', '😕', '😐', '🙂', '😍'];

const POLL_TYPES: { value: PollType; label: string; icon: React.ElementType; hint: string }[] = [
  { value: 'single', label: 'Single Choice', icon: Circle, hint: 'Voters pick one option' },
  { value: 'multiple', label: 'Multiple Choice', icon: CheckSquare, hint: 'Voters can pick several options' },
  { value: 'slider', label: 'Slider', icon: SlidersHorizontal, hint: 'Voters pick a value on a scale' },
  { value: 'emoji', label: 'Emoji', icon: Smile, hint: 'Voters react with an emoji' },
];

const DURATIONS = [
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 360, label: '6 hours' },
  { value: 720, label: '12 hours' },
  { value: 1440, label: '1 day' },
  { value: 4320, label: '3 days' },
  { value: 10080, label: '1 week' },
  { value: 43200, label: '1 month' },
  { value: 0, label: 'No expiry' },
];

// Stable per-row identity so list keys survive reordering/removal (the values
// themselves can be blank or duplicated, so they can't serve as keys).
const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

type OptionItem = { id: string; value: string };
type EmojiItem = { id: string; emoji: string };
const makeOption = (value = ''): OptionItem => ({ id: uid(), value });
const makeEmoji = (emoji: string): EmojiItem => ({ id: uid(), emoji });

// Compact labelled section (icon + title + optional right slot).
const SectionLabel = ({ icon: Icon, title, right }: {
  icon: React.ElementType;
  title: string;
  right?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-emerald-600" />
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{title}</span>
    </div>
    {right}
  </div>
);

// False during SSR and the first client render, true thereafter — so the portal
// (which needs document.body) only renders on the client, without a hydration
// mismatch and without setting state from a mount effect.
const subscribe = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

// The dialog only mounts while `open` is true, so each open starts with a fresh
// draft — no reset effect that would flash stale values on a prop change.
export default function CreatePollModal({ open, onClose, onPublish }: CreatePollModalProps) {
  const isClient = useIsClient();

  if (!open || !isClient) return null;

  return createPortal(<PollDialog onClose={onClose} onPublish={onPublish} />, document.body);
}

function PollDialog({ onClose, onPublish }: {
  onClose: () => void;
  onPublish: (poll: ComposerPoll) => void;
}) {
  const [question, setQuestion] = React.useState('');
  const [pollType, setPollType] = React.useState<PollType>('single');
  const [options, setOptions] = React.useState<OptionItem[]>(() => [makeOption(), makeOption()]);
  const [durationMinutes, setDurationMinutes] = React.useState(10080);
  const [sliderMin, setSliderMin] = React.useState(0);
  const [sliderMax, setSliderMax] = React.useState(10);
  const [minLabel, setMinLabel] = React.useState('');
  const [maxLabel, setMaxLabel] = React.useState('');
  const [emojis, setEmojis] = React.useState<EmojiItem[]>(() => DEFAULT_EMOJIS.map(makeEmoji));
  // Index of the emoji chip selected for replacement (null = none → palette adds).
  const [activeEmoji, setActiveEmoji] = React.useState<number | null>(null);
  const [emojiSearch, setEmojiSearch] = React.useState('');
  const dragIndex = React.useRef<number | null>(null);
  const questionRef = React.useRef<HTMLTextAreaElement>(null);

  // Move focus to the question field on open (replaces autoFocus, which steals
  // focus on page load and disorients assistive tech).
  React.useEffect(() => {
    questionRef.current?.focus();
  }, []);

  // Close on Escape. onClose is wrapped so the listener isn't re-bound when the
  // parent hands down a new callback identity.
  const onCloseEvent = React.useEffectEvent(onClose);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseEvent();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const setOption = (i: number, v: string) =>
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, value: v } : o)));
  const addOption = () =>
    setOptions((prev) => (prev.length >= MAX_OPTIONS ? prev : [...prev, makeOption()]));
  const removeOption = (i: number) =>
    setOptions((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));

  const removeEmoji = (i: number) => {
    setEmojis((prev) => (prev.length <= MIN_EMOJIS ? prev : prev.filter((_, idx) => idx !== i)));
    setActiveEmoji(null);
  };

  // Palette tap: replace the selected chip if one is active, else append.
  const pickEmoji = (e: string) => {
    if (activeEmoji !== null) {
      setEmojis((prev) => prev.map((x, idx) => (idx === activeEmoji ? { ...x, emoji: e } : x)));
      return;
    }
    setEmojis((prev) => (prev.length >= MAX_EMOJIS ? prev : [...prev, makeEmoji(e)]));
  };

  // Reorder via drag-and-drop.
  const dropEmoji = (to: number) => {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === to) return;
    setEmojis((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setActiveEmoji(null);
  };

  const publish = () => {
    if (!question.trim()) {
      toast.error('Add a poll question');
      return;
    }
    if (pollType === 'single' || pollType === 'multiple') {
      const filled = options.flatMap((o) => {
        const t = o.value.trim();
        return t ? [t] : [];
      });
      if (filled.length < 2) {
        toast.error('Add at least two options');
        return;
      }
    }
    if (pollType === 'slider' && sliderMin >= sliderMax) {
      toast.error('Maximum value must be greater than minimum');
      return;
    }
    if (pollType === 'emoji' && emojis.length < MIN_EMOJIS) {
      toast.error('Add at least two emojis');
      return;
    }

    const expiresAt =
      durationMinutes > 0
        ? new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
        : undefined;

    onPublish({
      question: question.trim(),
      pollType,
      options: options.map((o) => o.value),
      expiresAt,
      slider: { min: sliderMin, max: sliderMax, minLabel: minLabel.trim() || undefined, maxLabel: maxLabel.trim() || undefined },
      emojis: emojis.map((e) => e.emoji),
    });
  };

  const inputClass =
    'w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-300';

  return (
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] max-h-[88vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-emerald-600" />
            </span>
            <h2 className="text-[16px] font-bold text-slate-900">Create Poll</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Question */}
          <div>
            <SectionLabel icon={ListChecks} title="Question" />
            <textarea
              ref={questionRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              aria-label="Poll question"
              rows={2}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-300 resize-none"
            />
          </div>

          {/* Poll Type */}
          <div>
            <SectionLabel icon={Shapes} title="Poll Type" />
            <div className="grid grid-cols-4 gap-2">
              {POLL_TYPES.map((t) => {
                const Icon = t.icon;
                const active = pollType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setPollType(t.value)}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1.5 h-[64px] rounded-xl border-[1.5px] transition-all cursor-pointer',
                      active
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                    )}
                  >
                    <Icon className={cn('w-4 h-4', active ? 'text-emerald-600' : 'text-slate-400')} />
                    <span className={cn('text-[11px] text-center leading-tight px-1', active ? 'font-bold' : 'font-medium')}>{t.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11.5px] text-slate-400">
              {POLL_TYPES.find((t) => t.value === pollType)?.hint}
            </p>
          </div>

          {/* Options */}
          {(pollType === 'single' || pollType === 'multiple') && (
            <div>
              <SectionLabel
                icon={ListChecks}
                title="Options"
                right={<span className="text-[11px] font-medium text-slate-400">{options.length}/{MAX_OPTIONS}</span>}
              />
              <div className="flex flex-col gap-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                    <input
                      type="text"
                      value={opt.value}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      aria-label={`Option ${i + 1}`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      aria-label={`Remove option ${i + 1}`}
                      disabled={options.length <= 2}
                      onClick={() => removeOption(i)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              {options.length < MAX_OPTIONS && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 h-10 rounded-lg border border-dashed border-slate-300 text-emerald-600 text-[13px] font-semibold hover:bg-emerald-50/40 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Option
                </button>
              )}
            </div>
          )}

          {/* Slider */}
          {pollType === 'slider' && (
            <div>
              <SectionLabel icon={SlidersHorizontal} title="Scale Configuration" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="poll-slider-min" className="block text-[11px] text-slate-500 mb-1">Minimum</label>
                  <input id="poll-slider-min" type="number" value={sliderMin} onChange={(e) => setSliderMin(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="poll-slider-max" className="block text-[11px] text-slate-500 mb-1">Maximum</label>
                  <input id="poll-slider-max" type="number" value={sliderMax} onChange={(e) => setSliderMax(Number(e.target.value))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="poll-slider-min-label" className="block text-[11px] text-slate-500 mb-1">Left label</label>
                  <input id="poll-slider-min-label" type="text" value={minLabel} onChange={(e) => setMinLabel(e.target.value)} placeholder="e.g., Poor" className={inputClass} />
                </div>
                <div>
                  <label htmlFor="poll-slider-max-label" className="block text-[11px] text-slate-500 mb-1">Right label</label>
                  <input id="poll-slider-max-label" type="text" value={maxLabel} onChange={(e) => setMaxLabel(e.target.value)} placeholder="e.g., Excellent" className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Emoji */}
          {pollType === 'emoji' && (
            <div>
              <SectionLabel
                icon={Smile}
                title="Emoji Scale"
                right={<span className="text-[11px] font-medium text-slate-400">{emojis.length} items</span>}
              />
              <div className="flex flex-wrap gap-2 mb-2">
                {emojis.map((item, i) => {
                  const active = activeEmoji === i;
                  return (
                    <div key={item.id} className="relative">
                      <button
                        type="button"
                        aria-label={`Emoji ${i + 1}: ${item.emoji}`}
                        draggable
                        onDragStart={() => { dragIndex.current = i; }}
                        onDragOver={(ev) => ev.preventDefault()}
                        onDrop={() => dropEmoji(i)}
                        onClick={() => setActiveEmoji(active ? null : i)}
                        className={cn(
                          'w-11 h-11 rounded-xl bg-slate-50 border flex items-center justify-center text-xl cursor-grab active:cursor-grabbing transition-all',
                          active ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50' : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {item.emoji}
                      </button>
                      {active && (
                        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 rounded-full bg-emerald-600 text-white text-[8px] font-bold tracking-wide">
                          ACTIVE
                        </span>
                      )}
                      {emojis.length > MIN_EMOJIS && (
                        <button
                          type="button"
                          aria-label="Remove emoji"
                          onClick={() => removeEmoji(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[11px] font-bold cursor-pointer"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Drag to reorder · tap an emoji to {activeEmoji !== null ? 'replace it below' : 'select'} · × to remove
              </p>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={emojiSearch}
                  onChange={(e) => setEmojiSearch(e.target.value)}
                  placeholder="Search emojis"
                  aria-label="Search emojis"
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 focus:border-emerald-300"
                />
              </div>
              {(() => {
                const q = emojiSearch.trim().toLowerCase();
                const list = q
                  ? EMOJI_PALETTE.filter((p) => p.k.includes(q) || p.e === q)
                  : EMOJI_PALETTE;
                if (list.length === 0) {
                  return <p className="text-[12px] text-slate-400 py-3 text-center">No emojis found.</p>;
                }
                return (
                  <div className="flex flex-wrap gap-1.5 max-h-[168px] overflow-y-auto pr-1">
                    {list.map((p) => (
                      <button
                        key={p.e}
                        type="button"
                        aria-label={`Add emoji ${p.e}`}
                        onClick={() => pickEmoji(p.e)}
                        disabled={activeEmoji === null && emojis.length >= MAX_EMOJIS}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg hover:bg-emerald-50/50 hover:border-emerald-300 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {p.e}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Closes in */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[12px] font-medium text-slate-500">Closes in</span>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              aria-label="Poll duration"
              className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/15 cursor-pointer"
            >
              {DURATIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg text-[13px] font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={publish}
            className="h-9 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-bold transition-colors cursor-pointer shadow-sm"
          >
            Send Poll
          </button>
        </div>
      </div>
    </div>
  );
}

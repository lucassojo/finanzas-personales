'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus } from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    name: 'Caras y Gente',
    icon: '😀',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
      '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
      '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
      '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
      '🤗', '🤔', '🫣', '🤭', '🫢', '🤫', '🤥', '😶', '😐', '😑',
      '😬', '🫨', '🫠', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
      '😴', '🤤', '😪', '😵', '😵‍💫', '🫥', '🤐', '🥴', '🤢', '🤮',
      '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘',
      '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚',
      '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '✍️', '🙏', '🤝'
    ]
  },
  {
    name: 'Comida',
    icon: '🍔',
    emojis: [
      '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐',
      '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
      '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
      '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈',
      '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕',
      '🥪', '🌮', '🌯', '🥗', '🍿', '🍱', '🍣', '🥟', '🍤',
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫',
      '🍬', '🍭', '🍮', '🍯', '☕', '🍵', '🍶', '🥤', '🧋', '🍺',
      '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉'
    ]
  },
  {
    name: 'Deportes y Ocio',
    icon: '⚽',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🏓',
      '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎟️', '🎫', '🎭', '🎨',
      '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🪗', '🎸',
      '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🛼', '🎿',
      '🏂', '🏄', '🏊', '🚴', '🏃', '🧘', '🧗', '🏋️', '🤸', '🏌️',
      '🏇', '🚣', '🥊', '🥋', '🎣', '🏹', '🎪', '🎡', '🎢', '🎠'
    ]
  },
  {
    name: 'Viajes',
    icon: '🚗',
    emojis: [
      '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
      '🚚', '🚛', '🚜', '🛵', '🚲', '🛴', '🚆', '🚇', '🚊', '✈️',
      '🛫', '🚁', '🚀', '🛸', '⛵', '🚢', '⚓', '🛟', '⛽', '🗺️',
      '🗽', '🗼', '🏰', '🏟️', '🏔️', '🏕️', '⛺', '🏠', '🏢', '🏥',
      '🏦', '🏨', '🏫', '🏭', '⛪', '🕌', '🕍', '🏖️', '🏜️', '🌋'
    ]
  },
  {
    name: 'Objetos',
    icon: '💡',
    emojis: [
      '⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🎙️', '📻',
      '📺', '📷', '📸', '📹', '🎥', '🎞️', '🔋', '🔌', '💡',
      '🔦', '🕯️', '🗑️', '💵', '🪙', '💳', '🧾', '✉️', '📦', '✏️',
      '✒️', '🖋️', '🖊️', '📝', '📁', '📂', '📅', '📆', '🗒️', '📖',
      '📚', '🔒', '🔓', '🔑', '🔨', '🛠️', '🧰', '⚙️', '🛡️', '⚔️',
      '🔬', '🔭', '🩺', '💉', '🩹', '🪞', '🪑', '🪟', '🛏️', '🚪',
      '🛍️', '🎈', '🎁', '🧸', '🧼', '🧹', '🧺', '🧻', '🛁', '🚿'
    ]
  },
  {
    name: 'Símbolos',
    icon: '❤️',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
      '✝️', '☪️', '🕉️', '☸️', '✡️', '☯️', '♈', '♉', '♊', '♋',
      '♌', '♍', '♎', '♏', '♐', '♑', '♒', '⛎', '⚠️', '⛔',
      '🚫', '🔞', '☢️', '☣️', '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️',
      '⬅️', '↖️', '🔄', '🔙', '🔚', '🔛', '🔝', '🔜', '🆗', '🆒',
      '✅', '❌', '➕', '➖', '💸', '📈', '📉', '✨', '🔥', '💥', '💤'
    ]
  }
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  id?: string;
  placement?: 'top' | 'bottom';
}

export default function EmojiPicker({ value, onChange, id, placement = 'bottom' }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Calculate position when opening
  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const pickerWidth = 288; // w-72
      const pickerHeight = 280; // approximate height
      const margin = 8;

      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Determine vertical placement: prefer top if close to bottom
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const goUp = placement === 'top' || spaceBelow < pickerHeight + margin;

      let top: number;
      if (goUp && spaceAbove > pickerHeight + margin) {
        top = rect.top - pickerHeight - margin;
      } else {
        top = rect.bottom + margin;
      }

      // Horizontal: align left with button, but keep inside viewport
      let left = rect.left;
      if (left + pickerWidth > viewportWidth - 8) {
        left = viewportWidth - pickerWidth - 8;
      }
      if (left < 8) left = 8;

      setPopoverStyle({
        position: 'fixed',
        top: Math.max(8, top),
        left,
        width: pickerWidth,
        zIndex: 9999,
      });
    }
  }, [open, placement]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current && !buttonRef.current.contains(target) &&
        popoverRef.current && !popoverRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const picker = open ? (
    <div
      ref={popoverRef}
      style={popoverStyle}
      className="rounded-3xl border border-border/60 shadow-2xl glass-card overflow-hidden animate-in fade-in duration-150"
    >
      {/* Categories Bar */}
      <div className="flex border-b border-border/30 bg-black/25 px-2 py-1.5 justify-between">
        {EMOJI_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            type="button"
            onClick={() => setActiveCategory(idx)}
            title={cat.name}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all active:scale-90 ${
              activeCategory === idx
                ? 'bg-primary/30 ring-1 ring-primary/50 scale-105'
                : 'hover:bg-white/[0.04]'
            }`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emojis Grid */}
      <div className="p-3 max-h-48 overflow-y-auto bg-black/10 scrollbar-thin">
        <div className="grid grid-cols-6 gap-2">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, idx) => (
            <button
              key={`${emoji}-${idx}`}
              type="button"
              onClick={() => {
                onChange(emoji);
                setOpen(false);
              }}
              className="w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-border/30 bg-black/20 flex items-center justify-between text-xs text-muted-foreground">
        <span>{EMOJI_CATEGORIES[activeCategory].name}</span>
        {value && (
          <div className="flex items-center gap-1.5">
            <span>Seleccionado:</span>
            <span className="text-sm bg-secondary/80 w-6 h-6 flex items-center justify-center rounded-lg">{value}</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative inline-block">
      {/* Trigger Button */}
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all touch-feedback active:scale-95 shadow-md ${
          open
            ? 'bg-primary/25 ring-2 ring-primary border-primary/50'
            : 'bg-secondary border border-border hover:bg-secondary/80'
        }`}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <Plus size={20} className="text-muted-foreground" />
        )}
      </button>

      {/* Render picker in a portal to escape overflow:hidden/auto containers */}
      {typeof document !== 'undefined' && createPortal(picker, document.body)}
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
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
      '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '🖕', '✍️', '🙏', '🤝'
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

// Clean up some placeholders and strings that have leading spaces or wrong names
EMOJI_CATEGORIES.forEach(cat => {
  cat.emojis = cat.emojis.map(e => e.trim());
});

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  id?: string;
}

export default function EmojiPicker({ value, onChange, id }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
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

  return (
    <div ref={containerRef} className="relative inline-block">
      {/* Trigger Button */}
      <button
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

      {/* Apple-style Popover Picker */}
      {open && (
        <div className="absolute left-0 mt-2 z-50 w-72 rounded-3xl border border-border/60 shadow-2xl glass-card overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-3">
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

          {/* Selected Preview Footer */}
          <div className="px-4 py-2 border-t border-border/30 bg-black/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>Categoría: {EMOJI_CATEGORIES[activeCategory].name}</span>
            {value && (
              <div className="flex items-center gap-1.5">
                <span>Seleccionado:</span>
                <span className="text-sm bg-secondary/80 w-6 h-6 flex items-center justify-center rounded-lg">{value}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

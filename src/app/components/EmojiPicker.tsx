"use client";

// motion removed

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

export default function EmojiPicker({ onSelect, className = "" }: EmojiPickerProps) {
  const emojis = ["🔥", "✨", "👑", "💎", "💯", "🚀", "❤️", "🥂", "🌟", "📍", "💼", "🤝", "🤩", "🙌", "🥃", "📸", "🎬", "🎩", "💰", "🍷", "🏇", "🏌️", "🐆", "🐉", "💍", "🏡"];
  
  return (
    <div className={`flex flex-wrap gap-2 p-3 bg-white/80 backdrop-blur-md border border-stone-100 rounded-2xl shadow-xl ${className}`}>
      {emojis.map(e => (
        <button 
          key={e} 
          onClick={() => onSelect(e)}
          className="text-xl hover:scale-125 transition-transform active:scale-90 p-1"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

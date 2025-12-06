import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading, placeholder }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-white/80 backdrop-blur-md border-t border-gray-200/50 sticky bottom-0 z-10">
      <form onSubmit={handleSubmit} className="relative flex items-end gap-2 p-2 bg-gray-50 border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 rounded-2xl shadow-sm transition-all">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 resize-none py-3 px-3 min-h-[48px] max-h-[120px] text-gray-800 placeholder:text-gray-400"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`flex-shrink-0 p-3 rounded-xl mb-1 transition-all ${
            input.trim() && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-2">
        AI guides can make mistakes. Please verify important travel info.
      </p>
    </div>
  );
};
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message, Role, Language } from '../types';
import { Bot, User } from 'lucide-react';
import { GroundingSources } from './GroundingSources';

interface MessageBubbleProps {
  message: Message;
  language: Language;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, language }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-sm ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-500 text-white'}`}>
          {isUser ? <User size={18} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div 
          className={`relative px-4 py-3 rounded-2xl text-sm md:text-base shadow-sm
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
            }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.text}</div>
          ) : (
            <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
              <ReactMarkdown 
                components={{
                  a: ({node, ...props}) => <a {...props} className="text-blue-500 underline hover:text-blue-600" target="_blank" rel="noopener noreferrer" />,
                  strong: ({node, ...props}) => <strong {...props} className="font-bold text-gray-900" />,
                  ul: ({node, ...props}) => <ul {...props} className="list-disc pl-4 my-2" />,
                  ol: ({node, ...props}) => <ol {...props} className="list-decimal pl-4 my-2" />,
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )}

          {/* Grounding Sources (only for model) */}
          {!isUser && message.groundingSources && message.groundingSources.length > 0 && (
            <GroundingSources sources={message.groundingSources} language={language} />
          )}

          {/* Loading Indicator for streaming (if text is empty but is streaming) */}
          {message.isStreaming && message.text.length === 0 && (
             <span className="flex gap-1 mt-1 h-4 items-center">
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
             </span>
          )}
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { GroundingChunk, Language } from '../types';
import { ExternalLink } from 'lucide-react';

interface GroundingSourcesProps {
  sources: GroundingChunk[];
  language: Language;
}

export const GroundingSources: React.FC<GroundingSourcesProps> = ({ sources, language }) => {
  if (!sources || sources.length === 0) return null;

  // Filter out empty sources or sources without URI
  const validSources = sources.filter(s => s.web?.uri && s.web?.title);

  if (validSources.length === 0) return null;

  const label = language === 'ko' ? '출처' : 'Sources';

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
        <ExternalLink size={12} />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {validSources.map((source, index) => (
          <a
            key={index}
            href={source.web?.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white border border-gray-200 text-blue-600 hover:text-blue-800 hover:border-blue-300 px-2 py-1 rounded-full transition-colors truncate max-w-[200px]"
            title={source.web?.title}
          >
            {source.web?.title || 'Link'}
          </a>
        ))}
      </div>
    </div>
  );
};
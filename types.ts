export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export type Language = 'ko' | 'en';

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  groundingSources?: GroundingChunk[];
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SuggestedPrompt {
  label: string;
  prompt: string;
  icon: string;
}
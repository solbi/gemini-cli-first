import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, GroundingChunk, SuggestedPrompt, Language } from './types';
import { sendMessageStream, resetChat } from './services/geminiService';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { MapPin, Coffee, Train, Sparkles, Menu, Globe, Compass, Map, Navigation, Moon, Package } from 'lucide-react';

// Translations
const TRANSLATIONS = {
  ko: {
    title: "한빛 가이드",
    subtitle: "대전 여행 AI",
    quickTopics: "추천 여행 테마",
    startNewChat: "새로운 여행 계획하기",
    welcomeTitle: "대전 여행의 모든 것! KR",
    welcomeDesc: "안녕하세요! 저는 당신의 대전 여행 가이드 '한빛'입니다. 성심당, 엑스포 과학공원, 숨은 명소 등 무엇이든 물어보세요.",
    inputPlaceholder: "대전 여행에 대해 물어보세요 (예: 성심당 빵 추천해줘)",
    errorMsg: "여행 가이드 네트워크 연결에 문제가 생겼어요. 다시 시도해주세요!",
    suggestions: [
      { label: "대전의 자랑", prompt: "대전의 명물은 뭐야? 볼거리를 추천해줘.", icon: "✨" },
      { label: "성심당", prompt: "성심당 인기 메뉴랑 본점 위치 알려줘.", icon: "📦" },
      { label: "교통편", prompt: "기차로 대전역 가는 방법 알려줘.", icon: "🚄" },
      { label: "야경 명소", prompt: "대전에서 야경 예쁜 곳 어디야? 엑스포 다리?", icon: "🌙" },
    ]
  },
  en: {
    title: "Hanbit Guide",
    subtitle: "Daejeon Travel AI",
    quickTopics: "Travel Themes",
    startNewChat: "Plan New Trip",
    welcomeTitle: "Welcome to Daejeon! KR",
    welcomeDesc: "I'm Hanbit, your personal AI guide. Ask me anything about science parks, bakeries, or hidden nature spots in Daejeon.",
    inputPlaceholder: "Ask about Daejeon travel (e.g., 'Where is Sung Sim Dang?')",
    errorMsg: "Sorry, I had trouble connecting to the travel guide network. Please try again!",
    suggestions: [
      { label: "Highlights", prompt: "What is famous about Daejeon?", icon: "✨" },
      { label: "Bakery", prompt: "Tell me about Sung Sim Dang bakery and what to buy there.", icon: "📦" },
      { label: "Transport", prompt: "How do I get to Daejeon by train?", icon: "🚄" },
      { label: "Night Views", prompt: "Where are the best night view spots in Daejeon?", icon: "🌙" },
    ]
  }
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('ko'); // Default to Korean
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessagePlaceholder: Message = {
      id: botMessageId,
      role: Role.MODEL,
      text: '', // Start empty
      isStreaming: true,
      timestamp: Date.now(),
      groundingSources: [],
    };

    setMessages((prev) => [...prev, botMessagePlaceholder]);

    try {
      let accumulatedText = "";
      const accumulatedSources: GroundingChunk[] = [];

      await sendMessageStream(text, (chunkText, grounding) => {
        accumulatedText += chunkText;
        if (grounding) {
            // Deduplicate sources based on URI
            grounding.forEach(g => {
                if (g.web?.uri && !accumulatedSources.some(existing => existing.web?.uri === g.web?.uri)) {
                    accumulatedSources.push(g);
                }
            });
        }
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, text: accumulatedText, groundingSources: [...accumulatedSources] }
              : msg
          )
        );
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, text: t.errorMsg, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [t.errorMsg]);

  const handleNewChat = () => {
    resetChat();
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar - Desktop: Static, Mobile: Drawer */}
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-[#0B1120] text-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl md:shadow-none border-r border-slate-800`}>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none" />
        
        <div className="p-6 flex flex-col h-full relative z-10">
          {/* Logo / Badge Section */}
          <div className="flex flex-col items-center mb-8 text-center group">
            <div className="relative mb-3 cursor-default">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-white/10 relative">
                <MapPin className="text-white drop-shadow-md" size={32} />
                <div className="absolute -bottom-1.5 -right-1.5 bg-[#0B1120] rounded-full p-1 border border-slate-700">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <h1 className="font-bold text-xl tracking-tight text-white mb-2 drop-shadow-sm">
              {t.title}
            </h1>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 rounded-full border border-slate-700/50 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex gap-2 mb-8 px-2 w-full max-w-[220px] mx-auto">
            <button 
                onClick={() => setLanguage('ko')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-transparent ${
                language === 'ko' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 border-indigo-500/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700/50'
                }`}
            >
                <span>KR</span> 한국어
            </button>
            <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-transparent ${
                language === 'en' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30 border-indigo-500/50' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border-slate-700/50'
                }`}
            >
                <span className="opacity-80">US</span> ENG
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="mb-6 px-1">
              <div className="flex items-center gap-2 mb-3 px-2">
                 <Globe size={14} className="text-indigo-400" />
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.quickTopics}</h3>
              </div>
              
              <ul className="space-y-1">
                <li className="group flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-700/50" onClick={() => { handleSendMessage(t.suggestions[0].prompt); setIsSidebarOpen(false); }}>
                    <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-yellow-500/20 group-hover:text-yellow-400 transition-colors">
                        <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-medium">{t.suggestions[0].label}</span>
                </li>
                <li className="group flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-700/50" onClick={() => { handleSendMessage(t.suggestions[1].prompt); setIsSidebarOpen(false); }}>
                    <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                        <Coffee size={16} />
                    </div>
                    <span className="text-sm font-medium">{t.suggestions[1].label}</span>
                </li>
                <li className="group flex items-center gap-3 text-slate-400 hover:text-white cursor-pointer p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-slate-700/50" onClick={() => { handleSendMessage(t.suggestions[2].prompt); setIsSidebarOpen(false); }}>
                     <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                        <Train size={16} />
                    </div>
                    <span className="text-sm font-medium">{t.suggestions[2].label}</span>
                </li>
              </ul>
            </div>
          </div>

          <button 
            onClick={handleNewChat}
            className="mt-auto w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-white border border-indigo-500/30"
          >
            <Compass size={18} />
            {t.startNewChat}
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 backdrop-blur-md border-b border-gray-200 z-10 sticky top-0">
          <div className="flex items-center gap-2">
             <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 rounded-lg shadow-sm">
               <MapPin className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-800">{t.title}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu size={24} />
          </button>
        </header>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-8 animate-fade-in pb-10">
              {/* Central Hero Visual - Replaces Image */}
              <div className="relative w-28 h-28 mx-auto mb-2 group cursor-default">
                 {/* Abstract Background Shapes */}
                 <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] rotate-6 blur-xl group-hover:rotate-12 transition-transform duration-700"></div>
                 <div className="absolute inset-0 bg-blue-400/20 rounded-[2rem] -rotate-6 blur-xl group-hover:-rotate-12 transition-transform duration-700"></div>
                 
                 {/* Main Card */}
                 <div className="relative w-full h-full bg-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 flex items-center justify-center border border-white/60 backdrop-blur-xl overflow-hidden transform group-hover:scale-105 transition-all duration-300">
                    {/* Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.06]" 
                         style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                    </div>
                    
                    {/* Map Icon */}
                    <div className="relative z-10 p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100/50 group-hover:shadow-inner transition-all">
                      <Map className="w-10 h-10 text-indigo-600 drop-shadow-sm" strokeWidth={1.5} />
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-3 right-3 w-2 h-2 bg-indigo-400 rounded-full opacity-40"></div>
                    <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-40"></div>
                 </div>
                 
                 {/* Floating Badge */}
                 <div className="absolute -bottom-3 -right-3 bg-white py-1.5 px-2.5 rounded-xl shadow-lg border border-slate-50 flex items-center gap-1 animate-bounce-slow">
                   <span className="text-[10px] font-black text-indigo-600 tracking-wider">KR</span>
                 </div>
              </div>
              
              <div className="mt-6">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3 tracking-tight">{t.welcomeTitle}</h2>
                <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                  {t.welcomeDesc}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
                {t.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion.prompt)}
                    className="p-4 bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/40 rounded-2xl transition-all duration-300 flex items-start gap-4 group"
                  >
                    <span className="text-2xl bg-gray-50 p-2 rounded-lg group-hover:scale-110 group-hover:bg-indigo-50 transition-all shadow-sm">
                      {suggestion.icon}
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{suggestion.label}</span>
                      <span className="block text-xs text-gray-500 line-clamp-1 group-hover:text-gray-600">{suggestion.prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} language={language} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput 
          onSend={handleSendMessage} 
          isLoading={isLoading} 
          placeholder={t.inputPlaceholder} 
        />
      </div>
    </div>
  );
};

export default App;
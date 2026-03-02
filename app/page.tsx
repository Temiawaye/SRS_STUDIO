"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, MessageSquare, Plus, Menu, X, Trash2, Activity } from "lucide-react";
import Link from "next/link";

type Message = {
  role: "user" | "bot";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
};

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chat History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        setSessions(parsed);
        // Load the most recent session if exists
        if (parsed.length > 0) {
          const mostRecent = parsed.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          setCurrentSessionId(mostRecent.id);
          setMessages(mostRecent.messages);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Save to local storage whenever sessions change significantly
  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("chat_sessions", JSON.stringify(updatedSessions));
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== id);
    saveSessions(updatedSessions);
    if (currentSessionId === id) {
      startNewChat();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    // If this is the very first message of a new session, create it immediately
    let sessionId = currentSessionId;
    let currentSessions = sessions;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSessionId(sessionId);
      const newSession: ChatSession = {
        id: sessionId,
        title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
        messages: newMessages,
        updatedAt: Date.now(),
      };
      currentSessions = [newSession, ...sessions];
      saveSessions(currentSessions);
    } else {
      // Update existing session with user message
      currentSessions = sessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: newMessages, updatedAt: Date.now() }
          : s
      );
      saveSessions(currentSessions);
    }

    try {
      const response = await fetch("/api/chat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      const botMessage: Message = { role: "bot", content: data.reply };
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);

      // Update session with bot message
      const finalSessions = currentSessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: finalMessages, updatedAt: Date.now() }
          : s
      );
      saveSessions(finalSessions);

    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = { role: "bot", content: "Sorry, I'm having trouble connecting right now." };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-screen bg-[#212121] text-[#ececec] font-sans antialiased overflow-hidden">

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar for checking past prompts/chats */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#171717] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col`}>
        <div className="p-3 flex flex-col gap-2">
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-transparent hover:bg-[#2f2f2f] rounded-lg border border-white/10 text-[14px] font-medium transition-colors"
          >
            <div className="bg-white/10 rounded-full p-1 border border-white/20">
              <Plus className="w-4 h-4" />
            </div>
            New Chat
          </button>
          <Link
            href="/evaluate"
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-transparent hover:bg-purple-900/30 text-purple-400 rounded-lg border border-purple-500/20 text-[14px] font-medium transition-colors"
          >
            <div className="bg-purple-500/10 rounded-full p-1 border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
            Evaluate SRS
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="text-xs font-semibold text-gray-500 mb-2 mt-4 px-2 uppercase tracking-wider">
            Past Prompts
          </div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => loadSession(session.id)}
                  className={`flex items-center gap-3 w-full px-2 py-2 pr-8 rounded-lg text-left text-[14px] truncate transition-colors ${currentSessionId === session.id
                    ? "bg-[#2f2f2f] text-gray-100"
                    : "hover:bg-[#2f2f2f] text-gray-400"
                    }`}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-white/5"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="px-2 text-[13px] text-gray-500 italic">No past prompts yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        {/* Header/Top Bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#212121]/95 backdrop-blur-sm z-10 sticky top-0 md:bg-transparent md:border-none">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-1.5 -ml-1.5 text-gray-400 hover:text-white rounded-md hover:bg-white/10"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <Bot className="w-5 h-5 text-gray-300" />
              <h1 className="text-[15px] font-medium tracking-tight text-gray-200">
                Hugging Face Assistant
              </h1>
            </div>
          </div>
        </header>

        {/* Main Chat Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-0">
          {messages.length === 0 ? (
            // Empty State
            <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center px-4">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-5 ring-1 ring-white/10">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-100">How can I help you today?</h2>
              <p className="text-[15px] text-gray-400 max-w-sm">
                I can assist you with answering questions, drafting emails, brainstorming, and writing code.
              </p>
            </div>
          ) : (
            // Messages List
            <div className="w-full max-w-3xl mx-auto py-8">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`py-6 flex gap-4 w-full animate-fade-in group ${msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  {msg.role === "bot" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-[#2f2f2f]">
                      <Sparkles className="w-4 h-4 text-gray-300" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] text-[15.5px] leading-relaxed ${msg.role === "user"
                    ? "bg-[#2f2f2f] px-5 py-3.5 rounded-2xl rounded-tr-[4px] text-gray-100 shadow-sm"
                    : "text-gray-200 pt-0.5"
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="py-6 flex gap-4 w-full justify-start animate-fade-in">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center bg-[#2f2f2f]">
                    <Sparkles className="w-4 h-4 text-gray-300" />
                  </div>
                  <div className="flex items-center h-8 gap-1 pl-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot" />
                  </div>
                </div>
              )}

              {/* Spacer for bottom input to avoid overlap */}
              <div className="h-40" ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Floating Input Area */}
        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-[#212121] via-[#212121]/90 to-transparent pt-8 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative flex items-end bg-[#2f2f2f] rounded-3xl border border-white/5 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all focus-within:ring-1 focus-within:ring-gray-400/50">
            <textarea
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 rounded-3xl pl-5 pr-14 py-4 max-h-[200px] min-h-[56px] focus:outline-none resize-none leading-relaxed text-[15px]"
              placeholder="Generate a SRS for the following project: "
              rows={1}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 bottom-3 p-1.5 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-30 disabled:bg-white disabled:hover:bg-white transition-colors flex items-center justify-center h-8 w-8"
            >
              <Send className="w-4 h-4 mr-0.5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-500 mt-3 hidden sm:block">
            Assistant can make mistakes. Consider verifying important information.
          </p>
        </div>
      </div>
    </main>
  );
}
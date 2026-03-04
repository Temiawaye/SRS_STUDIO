"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, Sparkles, MessageSquare, Plus, Menu, Trash2, Activity } from "lucide-react";
import Link from "next/link";
import { Editor } from "@/components/Editor";
import { TemplateSelector, TemplateOption } from '@/components/TemplateSelector';
import { marked } from "marked";

type Message = {
  role: "user" | "bot";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
  editorContent?: string;
};

const DEFAULT_EDITOR_CONTENT = '<h2>Software Requirement Specification</h2><p>Your generated content will appear here...</p>';

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Chat History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Editor State
  const [editorContent, setEditorContent] = useState(DEFAULT_EDITOR_CONTENT);
  const [templateType, setTemplateType] = useState<TemplateOption>('full_srs');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("chat_sessions");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ChatSession[];
        setSessions(parsed);
        if (parsed.length > 0) {
          const mostRecent = parsed.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          setCurrentSessionId(mostRecent.id);
          setMessages(mostRecent.messages);
          setEditorContent(mostRecent.editorContent || DEFAULT_EDITOR_CONTENT);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    localStorage.setItem("chat_sessions", JSON.stringify(updatedSessions));
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setInput("");
    setEditorContent(DEFAULT_EDITOR_CONTENT);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const loadSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      setEditorContent(session.editorContent || DEFAULT_EDITOR_CONTENT);
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

    let sessionId = currentSessionId;
    let currentSessions = sessions;
    let newEditorContent = editorContent;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      setCurrentSessionId(sessionId);
      const newSession: ChatSession = {
        id: sessionId,
        title: input.slice(0, 30) + (input.length > 30 ? "..." : ""),
        messages: newMessages,
        updatedAt: Date.now(),
        editorContent: newEditorContent,
      };
      currentSessions = [newSession, ...sessions];
      saveSessions(currentSessions);
    } else {
      currentSessions = sessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: newMessages, updatedAt: Date.now(), editorContent: newEditorContent }
          : s
      );
      saveSessions(currentSessions);
    }

    try {
      const response = await fetch("/api/chat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          templateType: templateType,
          history: messages.slice(-10)
        }),
      });

      const data = await response.json();
      const botMessage: Message = { role: "bot", content: data.reply };
      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);

      if (data.reply) {
        const parsedReply = await marked.parse(data.reply);
        newEditorContent = newEditorContent + parsedReply;
        setEditorContent(newEditorContent);
      }

      const finalSessions = currentSessions.map(s =>
        s.id === sessionId
          ? { ...s, messages: finalMessages, updatedAt: Date.now(), editorContent: newEditorContent }
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
    <main className="flex h-screen bg-gray-50 text-gray-900 font-sans antialiased overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar for checking past prompts/chats */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} flex flex-col border-r border-gray-200 shadow-sm`}>
        <div className="p-4 flex flex-col gap-3">
          <button
            onClick={startNewChat}
            className="flex items-center gap-3 w-full px-4 py-3 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 text-[14px] font-medium transition-all shadow-sm text-gray-700 hover:text-gray-900"
          >
            <div className="bg-gray-100 rounded-full p-1 border border-gray-200 text-gray-600">
              <Plus className="w-4 h-4" />
            </div>
            New Chat
          </button>
          <Link
            href="/evaluate"
            className="flex items-center gap-3 w-full px-4 py-3 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-[14px] font-medium transition-all shadow-sm"
          >
            <div className="bg-indigo-100/50 rounded-full p-1 border border-indigo-200 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
            Evaluate SRS
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 mb-3 mt-4 px-1 uppercase tracking-wider">
            Past Prompts
          </div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id} className="relative group">
                <button
                  onClick={() => loadSession(session.id)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 pr-8 rounded-lg text-left text-[14px] truncate transition-colors ${currentSessionId === session.id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "hover:bg-gray-50 text-gray-600"
                    }`}
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentSessionId === session.id ? 'text-indigo-500' : 'text-gray-400'}`} />
                  <span className="truncate">{session.title}</span>
                </button>
                <button
                  onClick={(e) => deleteSession(e, session.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-md hover:bg-red-50"
                  title="Delete Chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="px-3 py-2 text-[13px] text-gray-400 italic">No past prompts yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area (Split Pane) */}
      <div className="flex-1 flex flex-col md:flex-row h-full min-w-0 relative">

        {/* Left Side: Chat Interface */}
        <div className="flex-1 flex flex-col h-full border-r border-gray-200 relative w-full md:w-1/2 bg-white">
          {/* Header/Top Bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/95 backdrop-blur-md z-10 sticky top-0">
            <div className="flex items-center gap-3">
              <button
                className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2.5">
                <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <h1 className="text-[16px] font-semibold tracking-tight text-gray-800">
                  SRS Assistant
                </h1>
              </div>
            </div>
            {/* Added Template Selector to header */}
            <TemplateSelector
              selectedTemplate={templateType}
              onChange={setTemplateType}
            />
          </header>

          {/* Main Chat Area */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 custom-scrollbar bg-gray-50/30">
            {messages.length === 0 ? (
              // Empty State
              <div className="h-full flex flex-col items-center justify-center animate-fade-in text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 border border-gray-100">
                  <Sparkles className="w-7 h-7 text-indigo-500" />
                </div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Let's write a product requirement.</h2>
                <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed">
                  Describe what you want to build, and I'll generate technical specifications on the right.
                </p>
              </div>
            ) : (
              // Messages List
              <div className="w-full py-8 max-w-3xl mx-auto">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`py-6 flex gap-4 w-full animate-fade-in group ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {msg.role === "bot" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm mt-1">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                      </div>
                    )}

                    <div className={`max-w-[85%] text-[15px] leading-relaxed ${msg.role === "user"
                      ? "bg-indigo-600 px-5 py-3.5 rounded-2xl rounded-tr-sm text-white shadow-sm font-medium"
                      : "text-gray-700 pt-1"
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="py-6 flex gap-4 w-full justify-start animate-fade-in">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm mt-1">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex items-center h-8 gap-1 pl-1 pt-1">
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-gray-300 rounded-full typing-dot" />
                    </div>
                  </div>
                )}

                {/* Spacer for bottom input to avoid overlap */}
                <div className="h-36" ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Floating Input Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/95 to-transparent pt-10 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-3xl mx-auto relative flex items-end bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
              <textarea
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 rounded-2xl pl-5 pr-14 py-4 max-h-[200px] min-h-[56px] focus:outline-none resize-none leading-relaxed text-[15px]"
                placeholder="Describe your product feature..."
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
                className="absolute right-3 bottom-3 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:bg-gray-100 transition-all flex items-center justify-center h-10 w-10 shadow-sm"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3 hidden sm:block font-medium">
              Assistant can make mistakes. Verify technical specs before using.
            </p>
          </div>
        </div>

        {/* Right Side: Document Editor */}
        <div className="hidden md:flex flex-1 w-1/2 flex-col h-full bg-gray-50/50">
          <Editor
            content={editorContent}
            onUpdate={(content) => {
              setEditorContent(content);
              // Also update session editor state on manual type
              if (currentSessionId) {
                const updatedSessions = sessions.map(s =>
                  s.id === currentSessionId ? { ...s, editorContent: content } : s
                );
                setSessions(updatedSessions);
                localStorage.setItem("chat_sessions", JSON.stringify(updatedSessions));
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
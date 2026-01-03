'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bot, FileText, CheckCircle } from 'lucide-react';

export default function StudioPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  
  // 1. The Editor: Handles "Collaborative Editing" 
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<h2>Product Requirement Document</h2><p>Start by generating content...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // 2. The AI Trigger: Handles "Automated PRD Generation" 
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: userPrompt }),
      });
      const data = await res.json();
      
      // Append AI content to the editor
      if (editor) {
        editor.commands.insertContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar: AI Controls & Quality Metrics */}
      <aside className="w-1/3 border-r bg-white p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Bot className="text-blue-600" /> AI Agent
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Describe the product feature you want to document.
          </p>
        </div>

        <textarea
          className="w-full h-32 p-3 border rounded-lg resize-none focus:ring-2 ring-blue-500"
          placeholder="e.g., A user authentication system for a fintech app..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating Draft...' : 'Generate PRD Section'}
        </button>

        {/* Quality Assessment Placeholder  */}
        <div className="mt-auto border-t pt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Quality Gate</h3>
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} /> Traceability Score: 85%
          </div>
          <div className="flex items-center gap-2 text-green-600 text-sm mt-1">
            <CheckCircle size={16} /> Ambiguity Check: Pass
          </div>
        </div>
      </aside>

      {/* Right Area: The Document Editor */}
      <main className="flex-1 overflow-y-auto bg-white m-4 rounded-xl shadow-sm border">
        <div className="p-8 max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </main>
    </div>
  );
}
import { Bot, CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface AssessmentPanelProps {
    isGenerating: boolean;
    userPrompt: string;
    onPromptChange: (prompt: string) => void;
    onGenerate: () => void;
    CustomHeader?: ReactNode;
    MetricsContent?: ReactNode;
}

export function AssessmentPanel({
    isGenerating,
    userPrompt,
    onPromptChange,
    onGenerate,
    CustomHeader,
    MetricsContent
}: AssessmentPanelProps) {
    return (
        <aside className="w-full md:w-1/3 border-r border-white/10 bg-[#171717] p-6 flex flex-col gap-6 z-10 shadow-lg">
            <div>
                {CustomHeader || (
                    <>
                        <h2 className="text-[17px] font-medium tracking-tight text-white flex items-center gap-2">
                            <Bot className="text-purple-400 w-5 h-5" /> AI Agent
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Describe the product feature you want to document.
                        </p>
                    </>
                )}
            </div>

            <textarea
                className="w-full h-32 p-4 bg-[#212121] border border-white/10 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/50 text-gray-200 placeholder-gray-500 text-[14px] leading-relaxed shadow-inner"
                placeholder="e.g., A user authentication system for a fintech app..."
                value={userPrompt}
                onChange={(e) => onPromptChange(e.target.value)}
            />

            <button
                onClick={onGenerate}
                disabled={isGenerating || !userPrompt.trim()}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors shadow-lg shadow-purple-900/20"
            >
                {isGenerating ? 'Generating Draft...' : 'Generate Content'}
            </button>

            {/* Quality Assessment Block */}
            <div className="mt-auto border-t border-white/10 pt-5">
                <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider mb-3">Quality Gate</h3>
                {MetricsContent ? MetricsContent : (
                    <>
                        <div className="flex items-center gap-2 text-purple-400/80 text-[14px]">
                            <CheckCircle size={15} /> Traceability Score: Pending...
                        </div>
                        <div className="flex items-center gap-2 text-purple-400/80 text-[14px] mt-2">
                            <CheckCircle size={15} /> Ambiguity Check: Pending...
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
}

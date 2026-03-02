"use client";

import { useState } from "react";
import { Activity, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EvaluatePage() {
    const [srsContent, setSrsContent] = useState("");
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<string | null>(null);

    const handleEvaluate = async () => {
        if (!srsContent.trim()) return;

        setIsEvaluating(true);
        setEvaluationResult(null);

        try {
            const res = await fetch("/api/chat/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ srsContent }),
            });

            const data = await res.json();

            if (res.ok) {
                setEvaluationResult(data.evaluation);
            } else {
                setEvaluationResult(`Error: ${data.error}`);
            }
        } catch (err) {
            console.error(err);
            setEvaluationResult("Failed to connect to the evaluation service.");
        } finally {
            setIsEvaluating(false);
        }
    };

    const formatEvaluationText = (text: string) => {
        return text.split("\n").map((line, i) => {
            // Very basic formatting for bold headers like **Title**
            if (line.trim().startsWith("**") && line.trim().endsWith("**")) {
                return (
                    <h3 key={i} className="text-lg font-semibold text-gray-100 mt-4 mb-2">
                        {line.replace(/\*\*/g, "")}
                    </h3>
                );
            }
            return (
                <span key={i} className="block mb-2">
                    {line}
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col h-screen bg-[#212121] text-[#ececec] font-sans antialiased">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#212121]/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-400" />
                        <h1 className="text-[16px] font-medium tracking-tight text-white">
                            SRS Quality Auditor
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content Split Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left Side: Input Pane */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-white/10 bg-[#171717]">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Document Input
                        </span>
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                        <textarea
                            className="flex-1 w-full bg-[#212121] border border-white/10 rounded-xl p-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 resize-none font-mono text-[14px] leading-relaxed shadow-inner"
                            placeholder="Paste your Software Requirement Specification (SRS) content here for evaluation..."
                            value={srsContent}
                            onChange={(e) => setSrsContent(e.target.value)}
                            disabled={isEvaluating}
                        />
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleEvaluate}
                                disabled={isEvaluating || !srsContent.trim()}
                                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors shadow-lg shadow-purple-900/20 flex items-center gap-2"
                            >
                                {isEvaluating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="w-4 h-4" />
                                        Run Audit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Results Pane */}
                <div className="w-full md:w-1/2 flex flex-col bg-[#212121]">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2 bg-[#171717]">
                        <Activity className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                            Evaluation Report
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        {!evaluationResult && !isEvaluating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center animate-fade-in">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
                                    <FileText className="w-8 h-8 text-gray-600" />
                                </div>
                                <p className="max-w-xs leading-relaxed text-[15px]">
                                    Paste your document and click <b>Run Audit</b> to generate a quality report highlighting ambiguity, completeness, and consistency.
                                </p>
                            </div>
                        ) : isEvaluating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                                <div className="flex items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-sm">
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" />
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="text-gray-300 ml-3 font-medium tracking-wide">Evaluating compliance & quality...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert prose-purple max-w-none text-[15.5px] leading-relaxed text-gray-300 animate-fade-in bg-[#2a2a2a] p-8 rounded-2xl border border-white/10 shadow-lg">
                                {evaluationResult && formatEvaluationText(evaluationResult)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                    <h3 key={i} className="text-lg font-semibold text-gray-900 mt-5 mb-2">
                        {line.replace(/\*\*/g, "")}
                    </h3>
                );
            }
            return (
                <span key={i} className="block mb-2 text-gray-700 leading-relaxed">
                    {line}
                </span>
            );
        });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-gray-900 font-sans antialiased">
            {/* Header */}
            <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/95 backdrop-blur-md z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <div className="bg-indigo-50 p-1.5 rounded-lg border border-indigo-100">
                            <Activity className="w-5 h-5 text-indigo-600" />
                        </div>
                        <h1 className="text-[16px] font-semibold tracking-tight text-gray-800">
                            SRS Quality Auditor
                        </h1>
                    </div>
                </div>
            </header>

            {/* Main Content Split Pane */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

                {/* Left Side: Input Pane */}
                <div className="w-full md:w-1/2 flex flex-col border-r border-gray-200 bg-white shadow-sm z-0">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Document Input
                        </span>
                    </div>
                    <div className="flex-1 p-6 flex flex-col bg-white">
                        <textarea
                            className="flex-1 w-full bg-white border border-gray-200 rounded-2xl p-5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 resize-none font-mono text-[14px] leading-relaxed shadow-sm transition-all"
                            placeholder="Paste your Software Requirement Specification (SRS) content here for evaluation..."
                            value={srsContent}
                            onChange={(e) => setSrsContent(e.target.value)}
                            disabled={isEvaluating}
                        />
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleEvaluate}
                                disabled={isEvaluating || !srsContent.trim()}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm flex items-center gap-2"
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
                <div className="w-full md:w-1/2 flex flex-col bg-gray-50">
                    <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-white shadow-sm z-0">
                        <Activity className="w-4 h-4 text-indigo-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                            Evaluation Report
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                        {!evaluationResult && !isEvaluating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 p-8 text-center animate-fade-in">
                                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5">
                                    <FileText className="w-8 h-8 text-indigo-400" />
                                </div>
                                <p className="max-w-xs leading-relaxed text-[15px] text-gray-500">
                                    Paste your document and click <b>Run Audit</b> to generate a quality report highlighting ambiguity, completeness, and consistency.
                                </p>
                            </div>
                        ) : isEvaluating ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center animate-fade-in">
                                <div className="flex items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm backdrop-blur-md">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" />
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    <span className="text-gray-700 ml-3 font-medium tracking-wide">Evaluating compliance & quality...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-indigo max-w-none animate-fade-in bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                                {evaluationResult && formatEvaluationText(evaluationResult)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

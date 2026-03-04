import { ChevronDown } from 'lucide-react';

export type TemplateOption = 'full_srs' | 'prd' | 'user_stories';

const templateOptions: { value: TemplateOption; label: string; description: string }[] = [
    { value: 'full_srs', label: 'Full SRS Document', description: 'Comprehensive Software Requirements Specification' },
    { value: 'prd', label: 'Product Requirement Doc (PRD)', description: 'High-level product focused requirements' },
    { value: 'user_stories', label: 'User Stories', description: 'Agile use-cases mapped out' },
];

interface TemplateSelectorProps {
    selectedTemplate: TemplateOption;
    onChange: (template: TemplateOption) => void;
}

export function TemplateSelector({ selectedTemplate, onChange }: TemplateSelectorProps) {
    return (
        <div className="relative inline-block w-48 ml-auto">
            <select
                className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 px-3 pr-8 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-[13px] font-medium transition-colors cursor-pointer hover:bg-gray-50 bg-gradient-to-b from-white to-gray-50/50"
                value={selectedTemplate}
                onChange={(e) => onChange(e.target.value as TemplateOption)}
            >
                {templateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-400">
                <ChevronDown className="h-3.5 w-3.5" />
            </div>
        </div>
    );
}

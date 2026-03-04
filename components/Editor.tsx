import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface EditorProps {
    content: string;
    onUpdate?: (content: string) => void;
    editable?: boolean;
}

export function Editor({ content, onUpdate, editable = true }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: content,
        editable: editable,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl prose-purple m-5 focus:outline-none min-h-[500px] text-gray-800',
            },
        },
        onUpdate: ({ editor }) => {
            if (onUpdate) {
                onUpdate(editor.getHTML());
            }
        },
        immediatelyRender: false,
    });

    // Effect to update editor content when 'content' prop changes externally (e.g., AI generation)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    return (
        <div className="flex-1 overflow-y-auto bg-white m-4 md:m-6 rounded-2xl shadow-sm border border-gray-200 relative custom-scrollbar">
            <div className="p-8 max-w-4xl mx-auto h-full">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}

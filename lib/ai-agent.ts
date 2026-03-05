import { getPromptForTemplate, srsGenerationSystemPrompt, chatSystemPrompt } from "./prompts";
import { RequirementInput, SRS_Document } from "./models";

export class LLM_Agent_Manager {
    private apiUrl: string;
    private hfToken: string | undefined;

    constructor() {
        this.apiUrl = process.env.API_URL || "https://router.huggingface.co/v1/chat/completions";
        this.hfToken = process.env.HF_ACCESS_TOKEN;
    }

    public processInput(input: RequirementInput): string {
        // Basic processing - could be expanded to parse specific formats if needed
        return input.description.trim();
    }

    public async generateSRS(
        input: RequirementInput,
        history: any[] = [],
        templateType: string = "chat"
    ): Promise<string> {
        const isChat = templateType === "chat";
        const systemPrompt = isChat ? chatSystemPrompt : srsGenerationSystemPrompt;

        // Process input
        const processedDescription = this.processInput(input);

        const formattedHistory = history.map((msg: { role: string, content: string }) => ({
            role: msg.role === "bot" ? "assistant" : msg.role,
            content: msg.content
        }));

        const messages = [
            { role: "system", content: systemPrompt },
            ...formattedHistory,
            {
                role: "user",
                content: getPromptForTemplate(templateType, processedDescription)
            }
        ];

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.hfToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V3",
                messages: messages,
                max_tokens: isChat ? 2000 : 4000,
                temperature: isChat ? 0.7 : 0.3,
            }),
        });

        if (response.status === 503) {
            throw new Error("Model is warming up. Please wait 30 seconds and try again.");
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;
    }
}

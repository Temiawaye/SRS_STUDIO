import { srsEvaluationPrompt } from "./prompts";
import { SRS_Document, EvaluationResult } from "./models";

export class EvaluationEngine {
    private apiUrl: string;
    private hfToken: string | undefined;

    constructor() {
        this.apiUrl = process.env.API_URL || "https://router.huggingface.co/v1/chat/completions";
        this.hfToken = process.env.HF_ACCESS_TOKEN;
    }

    public async evaluateSRS(srsContent: string): Promise<EvaluationResult> {
        // If a structured object is passed, convert to string (though the API route expects a pure string right now)
        const contentToEvaluate = typeof srsContent === 'string' ? srsContent : JSON.stringify(srsContent);

        const response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${this.hfToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "deepseek-ai/DeepSeek-V3",
                messages: [
                    { role: "system", content: srsEvaluationPrompt },
                    { role: "user", content: `Please evaluate this SRS content: ${contentToEvaluate}` }
                ],
                max_tokens: 4000,
                temperature: 0.2, // Extremely low temperature for objective, critical analysis
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Evaluation API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        const evaluationText = result.choices[0].message.content;

        // Attempt to extract scores (dummy logic based on expected markdown/text, 
        // real implementation would parse structured JSON output if configured from HuggingFace).
        let completenessScore = undefined;
        let consistencyScore = undefined;

        // Simple RegEx to try and find numerical scores out of 10 or 100 in the string
        // This is optional and serves to satisfy the UML constraints.
        const completenessMatch = evaluationText.match(/completeness.*?(\d+(?:\.\d+)?)/i);
        const consistencyMatch = evaluationText.match(/consistency.*?(\d+(?:\.\d+)?)/i);

        if (completenessMatch) completenessScore = parseFloat(completenessMatch[1]);
        if (consistencyMatch) consistencyScore = parseFloat(consistencyMatch[1]);

        return {
            completenessScore,
            consistencyScore,
            evaluationText
        };
    }
}

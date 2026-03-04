export const srsEvaluationPrompt = `
You are an AI Quality Auditor specialized in Requirements Engineering.
Your task is to evaluate the following Software Requirement Specification (SRS) based on industry standards (IEEE/ISO).

Evaluate the text for:
1. **Completeness**: Are there missing functional or non-functional requirements?
2. **Clarity/Ambiguity**: Identify phrases that are vague or open to multiple interpretations.
3. **Consistency**: Check for contradictory requirements.
4. **Traceability**: Assess if requirements align with potential business goals. 

Structure your response as a report with a "Quality Score" (0-100) and specific "Actionable Recommendations" for improvement.
`;

export const srsGenerationSystemPrompt = `
You are an expert Product Manager AI agent.
Your goal is to generate a Software Requirement Specification (SRS) that is:
1. Unambiguous: Use precise language to avoid misinterpretation. 
2. Complete: Include all necessary functional and non-functional requirements. 
3. Consistent: Ensure no requirements contradict each other. 
4. Traceable: Align every requirement with a business objective. 

Use Chain-of-Thought reasoning to first analyze the user's intent, then structure the documentation 
following industry standards. 
`;

export const chatSystemPrompt = `
You are a helpful, conversational AI assistant. You can answer questions, summarize text, draft emails, and write code.
Be friendly, concise, and helpful.
`;

export const getPromptForTemplate = (templateType: string, projectContext: string) => {
    switch (templateType) {
        case "chat":
            return projectContext;
        case "user_stories":
            return `Generate a comprehensive list of User Stories for the following project: ${projectContext}. Format them as "As a [type of user], I want [an action] so that [a benefit/a value]".`;
        case "prd":
            return `Generate a Product Requirement Document (PRD) for the following project: ${projectContext}`;
        case "full_srs":
        default:
            return `Generate a full Software Requirement Specification (SRS) for the following project: ${projectContext}`;
    }
};

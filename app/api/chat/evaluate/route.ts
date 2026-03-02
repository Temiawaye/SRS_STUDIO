import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { srsContent } = await req.json();

    const evaluationPrompt = `
      You are an AI Quality Auditor specialized in Requirements Engineering.
      Your task is to evaluate the following Software Requirement Specification (SRS) based on industry standards (IEEE/ISO).
      
      Evaluate the text for:
      1. **Completeness**: Are there missing functional or non-functional requirements? [cite: 77]
      2. **Clarity/Ambiguity**: Identify phrases that are vague or open to multiple interpretations. [cite: 95]
      3. **Consistency**: Check for contradictory requirements. [cite: 77]
      4. **Traceability**: Assess if requirements align with potential business goals. 

      Structure your response as a report with a "Quality Score" (0-100) and specific "Actionable Recommendations" for improvement.
    `;

    const response = await fetch(process.env.API_URL || "https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3", 
        messages: [
          { role: "system", content: evaluationPrompt },
          { role: "user", content: `Please evaluate this SRS content: ${srsContent}` }
        ],
        max_tokens: 1500,
        temperature: 0.2, // Extremely low temperature for objective, critical analysis
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ evaluation: result.choices[0].message.content });

  } catch (error) {
    console.error("Evaluation Module Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
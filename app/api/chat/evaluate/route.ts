import { NextResponse } from "next/server";
import { srsEvaluationPrompt } from "@/lib/prompts";

export async function POST(req: Request) {
  try {
    const { srsContent } = await req.json();

    const evaluationPrompt = srsEvaluationPrompt;

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
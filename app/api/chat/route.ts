import { NextResponse } from "next/server";

// Standard Hugging Face Router Endpoint
const API_URL = "https://router.huggingface.co/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // NEW MODEL: Microsoft Phi-3.5 Mini (Very fast and reliable)
        model: "deepseek-ai/DeepSeek-V3.2",
        messages: [
          { role: "system", content: "You are an expert Product Manager AI agent. Your goal is to write a high-quality Product Requirement Document (PRD) Ensure the output is unambiguous, complete, and traceable." },
          { role: "user", content: message }
        ],
        max_tokens: 500,
      }),
    });

    if (response.status === 503) {
      return NextResponse.json(
        { error: "Model is warming up. Please wait 30 seconds and try again." }, 
        { status: 503 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF Error:", errorText);
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText}` }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    const reply = result.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
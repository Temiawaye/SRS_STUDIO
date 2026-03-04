import { NextResponse } from "next/server";
import { getPromptForTemplate, srsGenerationSystemPrompt, chatSystemPrompt } from "@/lib/prompts";

// Standard Hugging Face Router Endpoint
const API_URL = "https://router.huggingface.co/v1/chat/completions";



export async function POST(req: Request) {
  try {
    const { message, templateType = "chat", history = [] } = await req.json();

    const isChat = templateType === "chat";
    const systemPrompt = isChat ? chatSystemPrompt : srsGenerationSystemPrompt;

    // Map history to HF's required format for context
    const formattedHistory = history.map((msg: { role: string, content: string }) => ({
        role: msg.role === "bot" ? "assistant" : msg.role,
        content: msg.content
    }));

    const messages = [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { 
          role: "user", 
          content: getPromptForTemplate(templateType, message)
        }
    ];

    const response = await fetch(process.env.API_URL || "https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3", 
        messages: messages,
        max_tokens: isChat ? 1000 : 2000, 
        temperature: isChat ? 0.7 : 0.3, 
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
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorText}` }, 
        { status: response.status }
      );
    }

    const result = await response.json();
    const reply = result.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("AI-SRS Studio Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// export async function POST(req: Request) {
//   try {
//     const { message } = await req.json();

//     const response = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         // NEW MODEL: Microsoft Phi-3.5 Mini (Very fast and reliable)
//         model: "deepseek-ai/DeepSeek-V3.2",
//         messages: [
//           { role: "system", content: "You are an expert Product Manager AI agent. Your goal is to write a high-quality Product Requirement Document (PRD) Ensure the output is unambiguous, complete, and traceable." },
//           { role: "user", content: message }
//         ],
//         max_tokens: 500,
//       }),
//     });

//     if (response.status === 503) {
//       return NextResponse.json(
//         { error: "Model is warming up. Please wait 30 seconds and try again." }, 
//         { status: 503 }
//       );
//     }

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("HF Error:", errorText);
//       return NextResponse.json(
//         { error: `API Error: ${response.status} - ${errorText}` }, 
//         { status: response.status }
//       );
//     }

//     const result = await response.json();
//     const reply = result.choices[0].message.content;

//     return NextResponse.json({ reply });

//   } catch (error) {
//     console.error("Server Error:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }





// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     // 1. Get the message from the frontend
//     const { message } = await req.json();

//     // 2. Initialize Gemini
//     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
//     const model = genAI.getGenerativeModel({ 
//       model: "gemini-pro",
//       systemInstruction: "You are a helpful assistant.", 
//     });

//     // 3. Generate Content
//     // We pass the simple message. If you want "memory" later, 
//     // we can use the startChat() feature.
//     const result = await model.generateContent(message);
//     const response = await result.response;
//     const reply = response.text();

//     // 4. Send back to frontend (same format as before)
//     return NextResponse.json({ reply });
    
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     return NextResponse.json(
//       { error: "Failed to generate response" }, 
//       { status: 500 }
//     );
//   }
// }
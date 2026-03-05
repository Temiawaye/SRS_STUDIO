import { NextResponse } from "next/server";
import { LLM_Agent_Manager } from "@/lib/ai-agent";

export async function POST(req: Request) {
  try {
    const { message, templateType = "chat", history = [] } = await req.json();

    const agentManager = new LLM_Agent_Manager();
    
    // Convert generic text message into RequirementInput domain model
    const requirementInput = {
      requirementID: crypto.randomUUID(), // Mock ID 
      description: message
    };

    const reply = await agentManager.generateSRS(requirementInput, history, templateType);

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("AI-SRS Studio Server Error:", error);
    
    if (error.message.includes("warming up")) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 503 }
      );
    }
    
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
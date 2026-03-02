import { NextResponse } from "next/server";

// Standard Hugging Face Router Endpoint
const API_URL = "https://router.huggingface.co/v1/chat/completions";



export async function POST(req: Request) {
  try {
    const { message, templateType = "full_srs" } = await req.json();

    // 1. Incorporating Project-Specific System Prompting 
    // We enforce the quality gate directly in the system instructions.
    const systemPrompt = `
      You are an expert Product Manager AI agent.
      Your goal is to generate a Software Requirement Specification (SRS) that is:
      1. Unambiguous: Use precise language to avoid misinterpretation. 
      2. Complete: Include all necessary functional and non-functional requirements. 
      3. Consistent: Ensure no requirements contradict each other. 
      4. Traceable: Align every requirement with a business objective. 

      Use Chain-of-Thought reasoning to first analyze the user's intent, then structure the documentation 
      following industry standards. 
    `;

    const response = await fetch(process.env.API_URL || "https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Using DeepSeek-V3 as proposed for its strong reasoning capabilities  
        model: "deepseek-ai/DeepSeek-V3", 
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `Generate a ${templateType} for the following project: ${message}` 
          }
        ],
        // Increased max_tokens as SRS documents are detailed and lengthy 
        max_tokens: 2000, 
        temperature: 0.3, // Lower temperature for technical, consistent output 
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
import { NextResponse } from "next/server";
import { EvaluationEngine } from "@/lib/evaluation-engine";

export async function POST(req: Request) {
  try {
    const { srsContent } = await req.json();

    const engine = new EvaluationEngine();
    const evaluationResult = await engine.evaluateSRS(srsContent);

    // The frontend currently expects { evaluation: string }
    return NextResponse.json({ evaluation: evaluationResult.evaluationText });

  } catch (error: any) {
    console.error("Evaluation Module Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
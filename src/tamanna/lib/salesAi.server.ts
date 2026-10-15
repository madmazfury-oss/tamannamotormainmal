import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const MODEL = "openai/gpt-6-astra";

export async function askSalesAi(question: string, dataContext: string): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("AI কনফিগার করা নেই (LOVABLE_API_KEY missing)");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const result = streamText({
    model: provider.responses(MODEL),
    system:
      "You are a sales analyst for TAMANNA MOTORS, a motorcycle parts shop in Hazigonj, Chandpur, Bangladesh. " +
      "Answer ONLY from the provided sales data (currency BDT ৳). Reply in the same language as the question " +
      "(Bengali if the question is Bengali/Banglish). Be concise, give exact numbers, and end with 1-3 practical, actionable suggestions. " +
      "If the data does not contain the answer, say so plainly. Never invent numbers.",
    messages: [{ role: "user", content: `SALES DATA:\n${dataContext}\n\nQUESTION: ${question}` }],
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  let failure: unknown;
  for await (const part of result.fullStream) {
    if (part.type === "error") failure = part.error;
  }
  if (failure) {
    const status = (failure as any)?.statusCode;
    if (status === 429) throw new Error("অনেক বেশি অনুরোধ হয়েছে, একটু পরে আবার চেষ্টা করুন।");
    if (status === 402) throw new Error("AI ক্রেডিট শেষ। Settings → Plans & credits থেকে ক্রেডিট যোগ করুন।");
    throw new Error((failure as any)?.message || "AI উত্তর দিতে পারেনি");
  }
  return await result.text;
}

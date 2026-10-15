import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askSalesQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { question: string; dataContext: string }) => {
    const question = String(d?.question || "").trim().slice(0, 1000);
    if (!question) throw new Error("প্রশ্ন লিখুন");
    return { question, dataContext: String(d?.dataContext || "").slice(0, 120000) };
  })
  .handler(async ({ data }) => {
    const { askSalesAi } = await import("./salesAi.server");
    try {
      return { answer: await askSalesAi(data.question, data.dataContext), error: null as string | null };
    } catch (e: any) {
      return { answer: "", error: e?.message || "AI error" };
    }
  });

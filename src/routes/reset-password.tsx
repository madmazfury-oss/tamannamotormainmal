import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — TAMANNA MOTORS" },
      { name: "description", content: "Set a new password for your TAMANNA MOTORS account." },
      { property: "og:title", content: "Reset Password — TAMANNA MOTORS" },
      { property: "og:description", content: "Set a new password for your TAMANNA MOTORS account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg(error.message);
    setMsg("পাসওয়ার্ড আপডেট হয়েছে / Password updated");
    setTimeout(() => navigate({ to: "/" }), 1200);
  };
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 space-y-4">
        <h1 className="text-2xl font-extrabold">নতুন পাসওয়ার্ড / New password</h1>
        <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-500" placeholder="••••••" />
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <button disabled={busy} className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold">Save</button>
      </form>
    </div>
  );
}
